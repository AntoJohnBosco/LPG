import { motion } from "motion/react";
import { AlertTriangle, BellRing, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeverityPill } from "@/components/ui-kit/status-pill";
import type { AlertEvent } from "@/types";
import { formatRelativeTime } from "@/utils/gas";
import { cn } from "@/lib/utils";

const icons = {
  critical: AlertTriangle,
  warning: BellRing,
  info: Info,
} as const;

const accent = {
  critical: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-primary-soft text-primary",
} as const;

export function AlertCard({
  alert,
  index = 0,
  onAcknowledge,
  pending = false,
}: {
  alert: AlertEvent;
  index?: number;
  onAcknowledge?: (id: string) => void;
  pending?: boolean;
}) {
  const Icon = icons[alert.severity];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="surface-card rounded-3xl p-5"
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            accent[alert.severity],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityPill severity={alert.severity} />
            <span className="text-xs text-muted-foreground">
              {alert.deviceName} · {formatRelativeTime(alert.createdAt)}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold tracking-tight">{alert.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{alert.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {alert.ppm} ppm
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
              {alert.state}
            </span>
            {alert.state === "active" && onAcknowledge && (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => onAcknowledge(alert.id)}
                className="ml-auto"
              >
                <Check /> Acknowledge
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
