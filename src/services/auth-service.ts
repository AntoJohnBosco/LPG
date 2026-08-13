import { delay } from "@/services/api-client";

export interface AuthSession {
  phone: string;
  countryCode: string;
  signedInAt: string;
}

const SESSION_KEY = "gasguard.session";
const PENDING_KEY = "gasguard.pending-otp";

/** Demo OTP used while no SMS provider is connected. */
export const DEMO_OTP = "123456";

export interface PendingVerification {
  countryCode: string;
  phone: string;
  sentAt: number;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const authService = {
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    return safeParse<AuthSession>(window.localStorage.getItem(SESSION_KEY));
  },

  getPending(): PendingVerification | null {
    if (typeof window === "undefined") return null;
    return safeParse<PendingVerification>(window.localStorage.getItem(PENDING_KEY));
  },

  async sendOtp(countryCode: string, phone: string): Promise<PendingVerification> {
    await delay(null, 900);
    const pending: PendingVerification = { countryCode, phone, sentAt: Date.now() };
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    return pending;
  },

  async verifyOtp(code: string): Promise<AuthSession> {
    await delay(null, 1100);
    const pending = authService.getPending();
    if (!pending) throw new Error("Verification expired. Request a new code.");
    if (code !== DEMO_OTP) throw new Error("That code doesn't match. Try again.");
    const session: AuthSession = {
      phone: pending.phone,
      countryCode: pending.countryCode,
      signedInAt: new Date().toISOString(),
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.localStorage.removeItem(PENDING_KEY);
    return session;
  },

  signOut() {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(PENDING_KEY);
  },
};
