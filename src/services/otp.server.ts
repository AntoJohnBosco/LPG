import crypto from "node:crypto";
import mqtt from "mqtt";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type PendingOtp = {
  phone: string;
  hash: string;
  expiresAt: number;
  attempts: number;
};

const otpStore = new Map<string, PendingOtp>();

let mqttClient: mqtt.MqttClient | null = null;
let mqttConnectPromise: Promise<mqtt.MqttClient> | null = null;

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

function normalizePhone(countryCode: string, phone: string): string {
  const cc = countryCode.trim();
  const digits = phone.replace(/\D/g, "");
  if (!/^\+[1-9]\d{0,2}$/.test(cc)) {
    throw new Error("Invalid country code");
  }
  if (digits.length < 7 || digits.length > 14) {
    throw new Error("Invalid phone number");
  }
  return `${cc}${digits}`;
}

function hashOtp(phone: string, otp: string): string {
  const secret = env("OTP_SECRET");
  return crypto
    .createHmac("sha256", secret)
    .update(`${phone}:${otp}`)
    .digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const aa = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

async function getMqttClient(): Promise<mqtt.MqttClient> {
  if (mqttClient?.connected) return mqttClient;
  if (mqttConnectPromise) return mqttConnectPromise;

  mqttConnectPromise = new Promise((resolve, reject) => {
    const host = env("HIVEMQ_HOST");
    const port = Number(process.env.HIVEMQ_PORT ?? "8883");
    const username = env("HIVEMQ_USERNAME");
    const password = env("HIVEMQ_PASSWORD");

    const client = mqtt.connect(`mqtts://${host}:${port}`, {
      username,
      password,
      reconnectPeriod: 0,
      connectTimeout: 10000,
      clientId: `gasguard-server-${crypto.randomBytes(6).toString("hex")}`,
    });

    const timeout = setTimeout(() => {
      client.end(true);
      mqttConnectPromise = null;
      reject(new Error("Timed out connecting to HiveMQ"));
    }, 12000);

    client.once("connect", () => {
      clearTimeout(timeout);
      mqttClient = client;
      mqttConnectPromise = null;
      resolve(client);
    });

    client.once("error", (error) => {
      clearTimeout(timeout);
      client.end(true);
      mqttConnectPromise = null;
      reject(error);
    });
  });

  return mqttConnectPromise;
}

export async function publishOtp(phone: string, otp: string): Promise<void> {
  const client = await getMqttClient();
  const topic = process.env.HIVEMQ_COMMAND_TOPIC ?? "gasmonitor/cmd";
  const payload = `OTP|${phone}|${otp}`;

  await new Promise<void>((resolve, reject) => {
    client.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export async function requestOtpInternal(
  countryCode: string,
  phone: string,
): Promise<{ phone: string; expiresInSeconds: number }> {
  const normalized = normalizePhone(countryCode, phone);
  const otp = generateOtp();

  otpStore.set(normalized, {
    phone: normalized,
    hash: hashOtp(normalized, otp),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });

  try {
    await publishOtp(normalized, otp);
  } catch (error) {
    otpStore.delete(normalized);
    throw new Error(
      `Could not send OTP through GasGuard hardware: ${
        error instanceof Error ? error.message : "MQTT error"
      }`,
    );
  }

  return { phone: normalized, expiresInSeconds: OTP_EXPIRY_MS / 1000 };
}

export function verifyOtpInternal(phone: string, otp: string): void {
  const normalized = phone.trim();
  const record = otpStore.get(normalized);

  if (!record) throw new Error("Verification expired. Request a new code.");

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalized);
    throw new Error("Verification expired. Request a new code.");
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new Error("Enter the six-digit code.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalized);
    throw new Error("Too many attempts. Request a new code.");
  }

  record.attempts += 1;

  if (!safeEqualHex(record.hash, hashOtp(normalized, otp))) {
    throw new Error("That code doesn't match. Try again.");
  }

  otpStore.delete(normalized);
}
