export const queryKeys = {
  devices: ["devices"] as const,
  device: (id: string) => ["devices", id] as const,
  deviceReadings: (id: string) => ["devices", id, "readings"] as const,
  alerts: ["alerts"] as const,
  alertHistory: ["alerts", "history"] as const,

  summary: ["summary"] as const,
  networkTrend: ["summary", "trend"] as const,
  mqtt: ["mqtt", "status"] as const,
  timeline: ["timeline"] as const,
  contacts: ["settings", "contacts"] as const,
  liveLocation: ["location", "live"] as const,
  preferences: ["settings", "preferences"] as const,
  adminUsers: ["admin", "users"] as const,
};
