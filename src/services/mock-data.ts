import type {
  AlertEvent,
  Device,
  EmergencyContact,
  GasReading,
  LiveLocationSnapshot,
  MqttStatus,
  NotificationPreferences,
  RegisteredUser,
  SystemSummary,
  TimelineEvent,
} from "@/types";

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

export const mockDevices: Device[] = [
  {
    id: "gg-001",
    name: "Kitchen Sensor",
    location: "Ground floor · Kitchen",
    status: "online",
    ppm: 118,
    riskLevel: "safe",
    batteryPercent: 92,
    signalPercent: 88,
    temperatureC: 27.4,
    humidityPercent: 48,
    firmware: "v2.4.1",
    lastSeen: iso(1),
    valveClosed: false,
    sensors: { mq2: 118, mq5: 96, mq6: 104 },
    mapX: 26,
    mapY: 32,
  },
  {
    id: "gg-002",
    name: "Cylinder Bay",
    location: "Utility yard · Bay A",
    status: "alarm",
    ppm: 642,
    riskLevel: "critical",
    batteryPercent: 76,
    signalPercent: 71,
    temperatureC: 31.2,
    humidityPercent: 54,
    firmware: "v2.4.1",
    lastSeen: iso(0),
    valveClosed: true,
    sensors: { mq2: 642, mq5: 588, mq6: 611 },
    mapX: 68,
    mapY: 24,
  },
  {
    id: "gg-003",
    name: "Restaurant Line",
    location: "Block B · Service kitchen",
    status: "online",
    ppm: 268,
    riskLevel: "elevated",
    batteryPercent: 64,
    signalPercent: 93,
    temperatureC: 29.8,
    humidityPercent: 51,
    firmware: "v2.3.9",
    lastSeen: iso(2),
    valveClosed: false,
    sensors: { mq2: 268, mq5: 244, mq6: 219 },
    mapX: 48,
    mapY: 62,
  },
  {
    id: "gg-004",
    name: "Basement Store",
    location: "Basement · Storage",
    status: "offline",
    ppm: 0,
    riskLevel: "safe",
    batteryPercent: 12,
    signalPercent: 0,
    temperatureC: 24.1,
    humidityPercent: 61,
    firmware: "v2.3.9",
    lastSeen: iso(184),
    valveClosed: false,
    sensors: { mq2: 0, mq5: 0, mq6: 0 },
    mapX: 18,
    mapY: 78,
  },
  {
    id: "gg-005",
    name: "Boiler Room",
    location: "Plant room · Level 1",
    status: "maintenance",
    ppm: 96,
    riskLevel: "safe",
    batteryPercent: 88,
    signalPercent: 79,
    temperatureC: 33.6,
    humidityPercent: 39,
    firmware: "v2.4.1",
    lastSeen: iso(12),
    valveClosed: false,
    sensors: { mq2: 96, mq5: 88, mq6: 74 },
    mapX: 82,
    mapY: 70,
  },
];

export const mockMqtt: MqttStatus = {
  state: "online",
  broker: "mqtts://broker.gasguard.ai:8883",
  topic: "gasguard/site-01/+/telemetry",
  latencyMs: 42,
  messagesPerMinute: 96,
  uptimePercent: 99.8,
  lastMessageAt: iso(0),
};

export const mockTimeline: TimelineEvent[] = [
  {
    id: "ev-1",
    kind: "alert",
    title: "Critical LPG concentration",
    detail: "642 ppm sustained for 40s — siren armed and responders notified.",
    deviceName: "Cylinder Bay",
    severity: "critical",
    createdAt: iso(3),
  },
  {
    id: "ev-2",
    kind: "valve",
    title: "Solenoid valve auto-closed",
    detail: "Auto shut-off executed within 1.4s of threshold breach.",
    deviceName: "Cylinder Bay",
    severity: "warning",
    createdAt: iso(3),
  },
  {
    id: "ev-3",
    kind: "reading",
    title: "Elevated MQ5 baseline",
    detail: "244 ppm on MQ5 — ventilation recommended for the service kitchen.",
    deviceName: "Restaurant Line",
    severity: "warning",
    createdAt: iso(46),
  },
  {
    id: "ev-4",
    kind: "connection",
    title: "MQTT client reconnected",
    detail: "Session resumed after 12s backoff, QoS 1 queue flushed.",
    deviceName: "Kitchen Sensor",
    severity: "info",
    createdAt: iso(74),
  },
  {
    id: "ev-5",
    kind: "system",
    title: "Zero-point calibration complete",
    detail: "Automatic calibration finished successfully on all MQ channels.",
    deviceName: "Kitchen Sensor",
    severity: "info",
    createdAt: iso(310),
  },
];

export const mockAlerts: AlertEvent[] = [
  {
    id: "al-9001",
    deviceId: "gg-002",
    deviceName: "Cylinder Bay",
    location: "Utility yard · Bay A",
    severity: "critical",
    state: "active",
    title: "Critical LPG concentration detected",
    description: "642 ppm sustained for 40s. Solenoid valve auto-closed and siren triggered.",
    ppm: 642,
    createdAt: iso(3),
  },
  {
    id: "al-9002",
    deviceId: "gg-003",
    deviceName: "Restaurant Line",
    location: "Block B · Service kitchen",
    severity: "warning",
    state: "acknowledged",
    title: "Elevated gas trend",
    description: "Readings above baseline for 12 minutes. Ventilation advised.",
    ppm: 268,
    createdAt: iso(46),
  },
  {
    id: "al-9003",
    deviceId: "gg-004",
    deviceName: "Basement Store",
    location: "Basement · Storage",
    severity: "warning",
    state: "active",
    title: "Device offline",
    description: "No heartbeat received for 3 hours. Battery at 12% before disconnect.",
    ppm: 0,
    createdAt: iso(184),
  },
  {
    id: "al-9004",
    deviceId: "gg-001",
    deviceName: "Kitchen Sensor",
    location: "Ground floor · Kitchen",
    severity: "info",
    state: "resolved",
    title: "Calibration completed",
    description: "Automatic zero-point calibration finished successfully.",
    ppm: 84,
    createdAt: iso(310),
  },
];

/**
 * Long-range alert history spanning the past year. Deterministic so the
 * timeline stays stable between renders — replace with `/alerts/history`.
 */
const historyTemplates: Array<{
  title: string;
  description: string;
  severity: AlertEvent["severity"];
  ppm: number;
}> = [
  {
    title: "Critical LPG concentration detected",
    description: "Threshold breached — solenoid valve auto-closed and siren triggered.",
    severity: "critical",
    ppm: 655,
  },
  {
    title: "Elevated gas trend",
    description: "Readings above baseline for several minutes. Ventilation advised.",
    severity: "warning",
    ppm: 284,
  },
  {
    title: "Device offline",
    description: "No heartbeat received. Battery low before disconnect.",
    severity: "warning",
    ppm: 0,
  },
  {
    title: "Calibration completed",
    description: "Automatic zero-point calibration finished successfully.",
    severity: "info",
    ppm: 78,
  },
  {
    title: "Sensor drift corrected",
    description: "MQ6 baseline re-normalised after ambient humidity spike.",
    severity: "info",
    ppm: 96,
  },
  {
    title: "Leak suspected near regulator",
    description: "Short high-ppm burst detected during cylinder change.",
    severity: "critical",
    ppm: 512,
  },
];

const historyOffsetsMinutes = [
  8, 96, 320, 640, 1_180, 1_900, 2_760, 4_150, 5_600, 7_800, 10_200, 13_400, 17_800, 22_600,
  29_500, 36_800, 44_100, 58_000, 74_500, 96_000, 128_000, 164_000, 210_000, 268_000, 340_000,
  412_000, 498_000,
];

export const mockAlertHistory: AlertEvent[] = historyOffsetsMinutes.map((minutes, index) => {
  const template = historyTemplates[index % historyTemplates.length];
  const device = mockDevices[index % mockDevices.length];
  const resolved = index > 2;
  return {
    id: `hist-${1000 + index}`,
    deviceId: device.id,
    deviceName: device.name,
    location: device.location,
    severity: template.severity,
    state: resolved ? "resolved" : index === 0 ? "active" : "acknowledged",
    title: template.title,
    description: template.description,
    ppm: template.ppm,
    createdAt: iso(minutes),
  };
});


export const mockContacts: EmergencyContact[] = [
  { id: "c1", name: "Fire & Rescue Control", relationship: "Emergency service", phone: "101", primary: true },
  {
    id: "c2",
    name: "Anita Rao",
    relationship: "Site safety officer",
    phone: "+91 98450 11234",
    primary: false,
  },
  {
    id: "c3",
    name: "GasGuard Support",
    relationship: "24/7 technical",
    phone: "+91 80 4000 9090",
    primary: false,
  },
];


export const mockPreferences: NotificationPreferences = {
  pushEnabled: true,
  smsEnabled: true,
  emailEnabled: false,
  autoShutoff: true,
  sirenEnabled: true,
  alertThresholdPpm: 400,
};

export function buildReadings(deviceId: string, points = 48): GasReading[] {
  const seed = deviceId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin((index + seed) / 5) * 42 + Math.cos((index + seed) / 11) * 26;
    const drift = index > points - 8 ? (index - (points - 8)) * 18 : 0;
    return {
      timestamp: new Date(now - (points - index) * 15 * 60_000).toISOString(),
      ppm: Math.max(28, Math.round(140 + wave + drift)),
    };
  });
}

export function buildSummary(devices: Device[], alerts: AlertEvent[]): SystemSummary {
  const online = devices.filter((device) => device.status === "online").length;
  const active = alerts.filter((alert) => alert.state === "active").length;
  const avg = Math.round(devices.reduce((sum, d) => sum + d.ppm, 0) / Math.max(devices.length, 1));

  return {
    devicesOnline: online,
    devicesTotal: devices.length,
    activeAlerts: active,
    averagePpm: avg,
    safetyScore: Math.max(35, 100 - active * 18 - Math.round(avg / 24)),
    lastSweep: iso(1),
  };
}

/**
 * Placeholder live-location payload. Shape mirrors the future backend
 * response for `GET /location/live` — including the backend-computed
 * distance, ETA and nearest-responder flag.
 */
export const mockLiveLocation: LiveLocationSnapshot = {
  hardware: {
    deviceId: "dev-1",
    deviceName: "Cylinder Bay",
    address: "Block C, Utility Yard, 12 Harbour Road",
    lat: 12.9718,
    lng: 77.6412,
    mapX: 72,
    mapY: 30,
  },
  user: {
    userId: "usr-1",
    userName: "You",
    accuracyMeters: 8,
    lat: 12.9663,
    lng: 77.6338,
    reportedAt: iso(1),
    mapX: 24,
    mapY: 74,
  },
  proximity: {
    distanceMeters: 940,
    etaSeconds: 11 * 60,
    travelMode: "walking",
    routePoints: [
      { mapX: 24, mapY: 74 },
      { mapX: 34, mapY: 66 },
      { mapX: 46, mapY: 58 },
      { mapX: 55, mapY: 44 },
      { mapX: 72, mapY: 30 },
    ],
    isNearestResponder: true,
    computedAt: iso(1),
  },
};

const userSeed: Array<[string, string, RegisteredUser["role"], RegisteredUser["status"], string, number, number, number, number]> = [
  ["Anto John Bosco", "+91 98400 11234", "owner", "active", "Chennai", 4, 22, 68, 210],
  ["Priya Raman", "+91 99401 55210", "responder", "active", "Chennai", 3, 46, 52, 640],
  ["Karthik Menon", "+91 98844 20117", "technician", "active", "Coimbatore", 5, 61, 38, 1240],
  ["Sneha Iyer", "+91 90031 78452", "responder", "active", "Chennai", 2, 34, 74, 480],
  ["Rahul Verma", "+91 88700 33914", "viewer", "invited", "Bengaluru", 1, 78, 24, 2380],
  ["Divya Nair", "+91 97865 44120", "technician", "active", "Kochi", 3, 18, 46, 1620],
  ["Mohammed Faiz", "+91 95001 87336", "responder", "suspended", "Madurai", 0, 82, 66, 3140],
  ["Lakshmi Prasad", "+91 93810 21094", "viewer", "active", "Hyderabad", 2, 55, 18, 2860],
  ["Vignesh Kumar", "+91 90474 65281", "responder", "active", "Chennai", 4, 30, 58, 320],
  ["Aisha Khan", "+91 89390 74125", "technician", "invited", "Pune", 1, 68, 80, 4120],
];

export const mockUsers: RegisteredUser[] = userSeed.map(
  ([name, phone, role, status, city, devicesAssigned, mapX, mapY, distanceMeters], index) => ({
    id: `usr-${String(index + 1).padStart(3, "0")}`,
    name,
    phone,
    role,
    status,
    city,
    devicesAssigned,
    lastActiveAt: iso(index * 37 + 2),
    location: {
      lat: 12.9718 + (mapX - 50) / 900,
      lng: 77.6412 + (mapY - 50) / 900,
      reportedAt: iso((index % 4) + 1),
      mapX,
      mapY,
      distanceMeters,
      isNearestResponder: index === 0,
    },
  }),
);
