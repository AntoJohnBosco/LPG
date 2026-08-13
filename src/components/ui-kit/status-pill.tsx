import { cn } from "@/lib/utils";
import type { AlertSeverity, DeviceStatus, RiskLevel } from "@/types";
import { riskLabel, severityLabel, statusLabel } from "@/utils/gas";

type Tone = "success" | "warning" | "danger" | "primary" | "muted";

const toneClass: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  primary: "bg-primary-soft text-primary",
  muted: "bg-muted text-muted-foreground",
};

export const riskTone: Record<RiskLevel, Tone> = {
  safe: "success",
  elevated: "primary",
  warning: "warning",
  critical: "danger",
};

export const statusTone: Record<DeviceStatus, Tone> = {
  online: "success",
  offline: "muted",
  alarm: "danger",
  maintenance: "warning",
};

export const severityTone: Record<AlertSeverity, Tone> = {
  info: "primary",
  warning: "warning",
  critical: "danger",
};

export function StatusPill({
  tone,
  label,
  pulse = false,
  className,
}: {
  tone: Tone;
  label: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-tight",
        toneClass[tone],
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {label}
    </span>
  );
}

export function RiskPill({ risk }: { risk: RiskLevel }) {
  return <StatusPill tone={riskTone[risk]} label={riskLabel[risk]} pulse={risk === "critical"} />;
}

export function DeviceStatusPill({ status }: { status: DeviceStatus }) {
  return (
    <StatusPill tone={statusTone[status]} label={statusLabel[status]} pulse={status === "alarm"} />
  );
}

export function SeverityPill({ severity }: { severity: AlertSeverity }) {
  return (
    <StatusPill
      tone={severityTone[severity]}
      label={severityLabel[severity]}
      pulse={severity === "critical"}
    />
  );
}
