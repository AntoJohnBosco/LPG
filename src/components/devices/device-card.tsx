import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Battery, ChevronRight, Signal, Thermometer } from "lucide-react";
import { DeviceStatusPill, RiskPill } from "@/components/ui-kit/status-pill";
import type { Device } from "@/types";
import { formatRelativeTime } from "@/utils/gas";

export function DeviceCard({ device, index = 0 }: { device: Device; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/devices/$deviceId"
        params={{ deviceId: device.id }}
        className="surface-card group block rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">{device.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{device.location}</p>
          </div>
          <DeviceStatusPill status={device.status} />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">{device.ppm}</span>
              <span className="text-xs font-medium text-muted-foreground">ppm</span>
            </p>
            <div className="mt-2">
              <RiskPill risk={device.riskLevel} />
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
        </div>

        <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Battery className="h-3.5 w-3.5" /> {device.batteryPercent}%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Signal className="h-3.5 w-3.5" /> {device.signalPercent}%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5" /> {device.temperatureC}°C
          </span>
          <span className="ml-auto">{formatRelativeTime(device.lastSeen)}</span>
        </div>
      </Link>
    </motion.div>
  );
}
