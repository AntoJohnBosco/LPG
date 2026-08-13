import type { AlertSeverity, DeviceStatus, RiskLevel } from "@/types";

export function riskFromPpm(ppm: number): RiskLevel {
  if (ppm >= 600) return "critical";
  if (ppm >= 400) return "warning";
  if (ppm >= 200) return "elevated";
  return "safe";
}

export const riskLabel: Record<RiskLevel, string> = {
  safe: "Safe",
  elevated: "Elevated",
  warning: "Warning",
  critical: "Critical",
};

export const statusLabel: Record<DeviceStatus, string> = {
  online: "Online",
  offline: "Offline",
  alarm: "Alarm",
  maintenance: "Maintenance",
};

export const severityLabel: Record<AlertSeverity, string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatClock(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
