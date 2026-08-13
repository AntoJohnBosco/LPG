import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger";

const strokeVar: Record<Tone, string> = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

/** Compact circular gauge used for individual MQ sensor channels. */
export function RadialGauge({
  value,
  max = 1000,
  label,
  unit = "ppm",
  tone = "primary",
  size = 108,
  delay = 0,
  className,
}: {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  tone?: Tone;
  size?: number;
  delay?: number;
  className?: string;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="9"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={strokeVar[tone]}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            className="text-lg font-semibold tracking-tight"
          >
            {Math.round(value)}
          </motion.span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {unit}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold tracking-tight">{label}</span>
    </div>
  );
}

/** Horizontal animated progress indicator with a label + value row. */
export function ProgressMeter({
  label,
  value,
  max = 100,
  display,
  tone = "primary",
  delay = 0,
}: {
  label: string;
  value: number;
  max?: number;
  display?: string;
  tone?: Tone;
  delay?: number;
}) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const barTone: Record<Tone, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold tracking-tight">{display ?? value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", barTone[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
