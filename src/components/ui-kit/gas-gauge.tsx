import { motion } from "motion/react";
import { riskFromPpm, riskLabel } from "@/utils/gas";
import { cn } from "@/lib/utils";

const MAX_PPM = 1000;

export function GasGauge({ ppm, className }: { ppm: number; className?: string }) {
  const risk = riskFromPpm(ppm);
  const pct = Math.min(ppm / MAX_PPM, 1);
  const radius = 84;
  const circumference = Math.PI * radius;
  const strokeColor = {
    safe: "var(--success)",
    elevated: "var(--primary)",
    warning: "var(--warning)",
    critical: "var(--danger)",
  }[risk];

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <svg viewBox="0 0 200 116" className="w-full max-w-[280px]">
        <path
          d="M 16 100 A 84 84 0 0 1 184 100"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <motion.path
          d="M 16 100 A 84 84 0 0 1 184 100"
          fill="none"
          stroke={strokeColor}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="-mt-14 flex flex-col items-center">
        <motion.span
          key={ppm}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-semibold tracking-tight"
        >
          {ppm}
        </motion.span>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          ppm · {riskLabel[risk]}
        </span>
      </div>
    </div>
  );
}
