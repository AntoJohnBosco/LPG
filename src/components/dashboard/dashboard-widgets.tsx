import { motion } from "motion/react";
import { Activity, AlertTriangle, Link2, Radio, ShieldCheck, Wrench, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatRelativeTime } from "@/utils/gas";
import { cn } from "@/lib/utils";
import type { MqttStatus, TimelineEvent } from "@/types";

const mqttMeta = {
  online: {
    label: "Online",
    tone: "text-success",
    soft: "bg-success-soft",
    dot: "bg-success",
  },
  connecting: {
    label: "Connecting",
    tone: "text-warning",
    soft: "bg-warning-soft",
    dot: "bg-warning",
  },
  offline: {
    label: "Offline",
    tone: "text-muted-foreground",
    soft: "bg-muted",
    dot: "bg-muted-foreground",
  },
} as const;

export function MqttStatusCard({ status, index = 0 }: { status: MqttStatus; index?: number }) {
  const meta = mqttMeta[status.state];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="surface-card rounded-3xl p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Live MQTT status
          </p>
          <p className={cn("mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight", meta.tone)}>
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-70",
                  meta.dot,
                  status.state !== "offline" && "animate-ping",
                )}
              />
              <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", meta.dot)} />
            </span>
            {meta.label}
          </p>
          <p className="mt-2 truncate text-xs text-muted-foreground">{status.broker}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{status.topic}</p>
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            meta.soft,
            meta.tone,
          )}
        >
          <Radio className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Latency", value: `${status.latencyMs} ms` },
          { label: "Msg / min", value: status.messagesPerMinute },
          { label: "Uptime", value: `${status.uptimePercent}%` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-muted/60 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Last packet {formatRelativeTime(status.lastMessageAt)}
      </p>
    </motion.div>
  );
}

const kindIcon: Record<TimelineEvent["kind"], LucideIcon> = {
  reading: Waves,
  alert: AlertTriangle,
  valve: Wrench,
  system: ShieldCheck,
  connection: Link2,
};

const severityStyles = {
  info: { soft: "bg-primary-soft", text: "text-primary" },
  warning: { soft: "bg-warning-soft", text: "text-warning" },
  critical: { soft: "bg-danger-soft", text: "text-danger" },
} as const;

export function EventTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-3 pl-2">
      {events.map((event, index) => {
        const Icon = kindIcon[event.kind] ?? Activity;
        const styles = severityStyles[event.severity];
        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {index < events.length - 1 && (
              <span className="absolute left-[21px] top-12 h-[calc(100%-1rem)] w-px bg-border" />
            )}
            <div className="surface-card rounded-3xl p-4 transition-shadow duration-300 hover:shadow-lifted">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                    styles.soft,
                    styles.text,
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold tracking-tight">{event.title}</p>
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelativeTime(event.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
                  <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                    {event.deviceName}
                  </p>
                </div>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
