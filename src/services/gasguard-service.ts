import { delay } from "./api-client";
import {
  buildReadings,
  buildSummary,
  mockAlertHistory,
  mockAlerts,

  mockContacts,
  mockDevices,
  mockLiveLocation,
  mockMqtt,
  mockPreferences,
  mockTimeline,
  mockUsers,
} from "./mock-data";
import type {
  AlertEvent,
  Device,
  EmergencyContact,
  EmergencyContactInput,

  GasReading,
  LiveLocationSnapshot,
  MqttStatus,
  NotificationPreferences,
  RegisteredUser,
  SystemSummary,
  TimelineEvent,
} from "@/types";

/**
 * Domain services. Each method is the seam for a future backend call —
 * replace the `delay(...)` body with `request<T>("/devices")` etc.
 */
export const deviceService = {
  list: (): Promise<Device[]> => delay(mockDevices),
  get: (id: string): Promise<Device | undefined> =>
    delay(mockDevices.find((device) => device.id === id)),
  readings: (id: string): Promise<GasReading[]> => delay(buildReadings(id), 300),
  setValve: (id: string, closed: boolean): Promise<{ id: string; closed: boolean }> =>
    delay({ id, closed }, 600),
};

export const alertService = {
  list: (): Promise<AlertEvent[]> => delay(mockAlerts),
  /** Full alert history, newest first. Backend seam: GET /alerts/history */
  history: (): Promise<AlertEvent[]> =>
    delay(
      [...mockAlerts, ...mockAlertHistory].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      320,
    ),
  acknowledge: (id: string): Promise<{ id: string }> => delay({ id }, 500),
  resolve: (id: string): Promise<{ id: string }> => delay({ id }, 500),
};


export const summaryService = {
  get: (): Promise<SystemSummary> => delay(buildSummary(mockDevices, mockAlerts), 260),
  trend: (): Promise<GasReading[]> => delay(buildReadings("network-average", 32), 260),
};

export const mqttService = {
  status: (): Promise<MqttStatus> => delay(mockMqtt, 320),
};

export const timelineService = {
  list: (): Promise<TimelineEvent[]> => delay(mockTimeline, 300),
};

/** In-memory contact store — swap for real API calls when the backend lands. */
let contactStore: EmergencyContact[] = [...mockContacts];

export const settingsService = {
  contacts: (): Promise<EmergencyContact[]> => delay([...contactStore], 240),
  saveContact: (input: EmergencyContactInput): Promise<EmergencyContact> => {
    const contact: EmergencyContact = {
      ...input,
      id: input.id ?? `c${Date.now()}`,
    };
    contactStore = input.id
      ? contactStore.map((c) => (c.id === input.id ? contact : c))
      : [...contactStore, contact];
    if (contact.primary) {
      contactStore = contactStore.map((c) => (c.id === contact.id ? c : { ...c, primary: false }));
    }
    return delay(contact, 420);
  },
  deleteContact: (id: string): Promise<{ id: string }> => {
    contactStore = contactStore.filter((c) => c.id !== id);
    return delay({ id }, 380);
  },
  preferences: (): Promise<NotificationPreferences> => delay(mockPreferences, 240),
  savePreferences: (next: NotificationPreferences): Promise<NotificationPreferences> =>
    delay(next, 500),
};


/**
 * Live location. The backend owns geolocation logic: it stores the fixed
 * ESP32 coordinates, ingests the GPS ping every user pushes each minute, and
 * decides which registered user is nearest plus the distance, route and ETA.
 * The app only renders what comes back.
 *
 * Backend seams:
 *   live()        -> request<LiveLocationSnapshot>("/location/live")
 *   reportUser()  -> request("/location/report", { method: "POST", body })
 */
export const locationService = {
  live: (): Promise<LiveLocationSnapshot> => delay(mockLiveLocation, 340),
  reportUser: (point: { lat: number; lng: number }): Promise<{ accepted: true }> =>
    delay({ accepted: true as const }, 200).then((res) => {
      void point;
      return res;
    }),
};

/**
 * Admin console reads. Backend seams:
 *   users() -> request<RegisteredUser[]>("/admin/users")
 */
export const adminService = {
  users: (): Promise<RegisteredUser[]> => delay([...mockUsers], 300),
};
