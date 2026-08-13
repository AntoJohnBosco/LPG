import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MapPin, Navigation } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { DeviceStatusPill } from "@/components/ui-kit/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices } from "@/hooks/use-gasguard";
import { formatRelativeTime } from "@/utils/gas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Site Map — GasGuard AI" },
      {
        name: "description",
        content: "Spatial view of every GasGuard AI sensor node with live status and gas concentration.",
      },
      { property: "og:title", content: "Site Map — GasGuard AI" },
      { property: "og:description", content: "Live sensor placement and status across your site." },
    ],
  }),
  component: MapPage,
});

const statusDot = {
  online: "bg-success",
  alarm: "bg-danger",
  offline: "bg-muted-foreground",
  maintenance: "bg-warning",
} as const;

function MapPage() {
  const devices = useDevices();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Spatial view"
        title="Site sensor map"
        description="Node placement across the facility with live LPG concentration and link status."
      />

      <section className="surface-card ambient-grid relative overflow-hidden rounded-4xl p-4 lg:p-6">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-surface">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {devices.isLoading
            ? null
            : devices.data?.map((device, index) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${device.mapX}%`, top: `${device.mapY}%` }}
                >
                  <Link
                    to="/devices/$deviceId"
                    params={{ deviceId: device.id }}
                    className="group flex flex-col items-center gap-1"
                  >
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      {device.status === "alarm" && (
                        <span className="absolute h-6 w-6 animate-ping rounded-full bg-danger/60" />
                      )}
                      <span
                        className={cn(
                          "relative h-3.5 w-3.5 rounded-full ring-4 ring-card",
                          statusDot[device.status],
                        )}
                      />
                    </span>
                    <span className="glass-panel rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-tight opacity-90 transition-opacity group-hover:opacity-100">
                      {device.name} · {device.ppm} ppm
                    </span>
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {devices.isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
          : devices.data?.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="surface-card rounded-3xl p-5"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold tracking-tight">{device.name}</h2>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {device.location}
                    </p>
                  </div>
                  <DeviceStatusPill status={device.status} />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <p className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-tight">{device.ppm}</span>
                    <span className="text-xs text-muted-foreground">ppm</span>
                  </p>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Navigation className="h-3.5 w-3.5" /> {formatRelativeTime(device.lastSeen)}
                  </span>
                </div>
              </motion.div>
            ))}
      </section>
    </div>
  );
}
