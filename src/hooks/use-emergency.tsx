import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useDevices } from "@/hooks/use-gasguard";
import { riskFromPpm } from "@/utils/gas";
import type { Device } from "@/types";

interface EmergencyContextValue {
  /** Device currently driving the emergency interface, if any. */
  device: Device | null;
  dismiss: () => void;
  /** Manually raise the emergency interface (used by "Trigger emergency" actions). */
  raise: (device?: Device | null) => void;
}

const EmergencyContext = createContext<EmergencyContextValue | null>(null);

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const devices = useDevices();
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [forcedId, setForcedId] = useState<string | null>(null);

  const leakDevice = useMemo(() => {
    const list = devices.data ?? [];
    return (
      list.find((d) => d.status === "alarm" || riskFromPpm(d.ppm) === "critical") ??
      list.find((d) => d.status === "online") ??
      null
    );
  }, [devices.data]);

  const forced = useMemo(
    () => (forcedId ? (devices.data ?? []).find((d) => d.id === forcedId) ?? null : null),
    [forcedId, devices.data],
  );

  const autoDevice =
    leakDevice && (leakDevice.status === "alarm" || riskFromPpm(leakDevice.ppm) === "critical")
      ? leakDevice
      : null;

  const active = forced ?? (autoDevice && autoDevice.id !== dismissedId ? autoDevice : null);

  const dismiss = useCallback(() => {
    setForcedId(null);
    if (autoDevice) setDismissedId(autoDevice.id);
  }, [autoDevice]);

  const raise = useCallback(
    (device?: Device | null) => {
      const target = device ?? autoDevice ?? leakDevice;
      if (!target) return;
      setDismissedId(null);
      setForcedId(target.id);
    },
    [autoDevice, leakDevice],
  );

  const value = useMemo(() => ({ device: active, dismiss, raise }), [active, dismiss, raise]);

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>;
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error("useEmergency must be used inside EmergencyProvider");
  return ctx;
}
