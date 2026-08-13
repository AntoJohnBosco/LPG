export type DeviceStatus = "online" | "offline" | "alarm" | "maintenance";
export type RiskLevel = "safe" | "elevated" | "warning" | "critical";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertState = "active" | "acknowledged" | "resolved";
export type MqttState = "online" | "connecting" | "offline";
export type SafetyState = "safe" | "warning" | "leak";

export interface SensorTriplet {
  mq2: number;
  mq5: number;
  mq6: number;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: DeviceStatus;
  ppm: number;
  riskLevel: RiskLevel;
  batteryPercent: number;
  signalPercent: number;
  temperatureC: number;
  humidityPercent: number;
  firmware: string;
  lastSeen: string;
  valveClosed: boolean;
  sensors: SensorTriplet;
  /** Relative position on the site map, 0-100 in both axes. */
  mapX: number;
  mapY: number;
}

export interface GasReading {
  timestamp: string;
  ppm: number;
}

export interface MqttStatus {
  state: MqttState;
  broker: string;
  topic: string;
  latencyMs: number;
  messagesPerMinute: number;
  uptimePercent: number;
  lastMessageAt: string;
}

export type TimelineKind = "reading" | "alert" | "valve" | "system" | "connection";

export interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  title: string;
  detail: string;
  deviceName: string;
  severity: AlertSeverity;
  createdAt: string;
}

export interface AlertEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  severity: AlertSeverity;
  state: AlertState;
  title: string;
  description: string;
  ppm: number;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  /** Relationship to the user, e.g. "Father", "Site safety officer". */
  relationship: string;
  phone: string;
  /** Optional photo URL or data URL; falls back to initials avatar. */
  photoUrl?: string;
  primary: boolean;
}

/** Payload used when creating or updating a contact. */
export type EmergencyContactInput = Omit<EmergencyContact, "id"> & { id?: string };


export interface SystemSummary {
  devicesOnline: number;
  devicesTotal: number;
  activeAlerts: number;
  averagePpm: number;
  safetyScore: number;
  lastSweep: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  autoShutoff: boolean;
  sirenEnabled: boolean;
  alertThresholdPpm: number;
}

/** Coordinates as returned by the backend / device GPS. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface HardwareLocation extends GeoPoint {
  deviceId: string;
  deviceName: string;
  address: string;
  /** Position on the map placeholder canvas, 0-100 in both axes. */
  mapX: number;
  mapY: number;
}

export interface UserLocation extends GeoPoint {
  userId: string;
  userName: string;
  accuracyMeters: number;
  /** Last GPS ping pushed to the backend (clients report every minute). */
  reportedAt: string;
  mapX: number;
  mapY: number;
}

/**
 * Proximity result. The BACKEND decides which registered user is closest to
 * the hardware — the app never computes or ranks nearby users, it only renders
 * these fields.
 */
export interface ProximityInfo {
  /** Backend-computed distance in metres. */
  distanceMeters: number;
  /** Backend-computed travel time in seconds. */
  etaSeconds: number;
  travelMode: "walking" | "driving";
  /** Backend-supplied route polyline points for the map placeholder. */
  routePoints: Array<{ mapX: number; mapY: number }>;
  /** True when the backend flags this user as the nearest responder. */
  isNearestResponder: boolean;
  computedAt: string;
}

export interface LiveLocationSnapshot {
  hardware: HardwareLocation;
  user: UserLocation;
  proximity: ProximityInfo;
}

/** A registered platform user as returned by the admin API. */
export interface RegisteredUser {
  id: string;
  name: string;
  phone: string;
  role: "owner" | "responder" | "technician" | "viewer";
  status: "active" | "invited" | "suspended";
  devicesAssigned: number;
  lastActiveAt: string;
  city: string;
  /** Latest GPS ping pushed by the client (every minute). */
  location: {
    lat: number;
    lng: number;
    reportedAt: string;
    mapX: number;
    mapY: number;
    distanceMeters: number;
    isNearestResponder: boolean;
  };
}
