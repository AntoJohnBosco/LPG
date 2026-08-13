import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Cpu,
  Crosshair,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  Route as RouteIcon,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveLocation } from "@/hooks/use-gasguard";
import { formatRelativeTime } from "@/utils/gas";
import type { LiveLocationSnapshot } from "@/types";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Live Location — GasGuard AI" },
      {
        name: "description",
        content:
          "Fixed ESP32 hardware location, your live GPS position, backend-computed distance, route and estimated travel time.",
      },
      { property: "og:title", content: "Live Location — GasGuard AI" },
      {
        property: "og:description",
        content: "Track distance and travel time between your position and the gas sensor node.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LocationPage,
});

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatEta(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Google Maps placeholder. Swap this canvas for the Maps JS API / embed once
 * the backend exposes real coordinates — markers and the route polyline are
 * already driven purely by backend-supplied values.
 */
function MapPlaceholder({ data }: { data: LiveLocationSnapshot }) {
  const { hardware, user, proximity } = data;
  const points = proximity.routePoints.length
    ? proximity.routePoints
    : [
        { mapX: user.mapX, mapY: user.mapY },
        { mapX: hardware.mapX, mapY: hardware.mapY },
      ];
  const path = points.map((p) => `${p.mapX},${p.mapY}`).join(" ");

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-surface sm:aspect-[16/9]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <motion.polyline
          points={path}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={0.9}
          strokeLinecap="round"
          strokeDasharray="3 2.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      {/* Fixed hardware marker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${hardware.mapX}%`, top: `${hardware.mapY}%` }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="gradient-primary flex h-9 w-9 items-center justify-center rounded-2xl text-primary-foreground shadow-glow">
            <Cpu className="h-4 w-4" />
          </span>
          <span className="glass-panel rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-tight">
            {hardware.deviceName}
          </span>
        </div>
      </motion.div>

      {/* Live user marker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${user.mapX}%`, top: `${user.mapY}%` }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-7 w-7 animate-ping rounded-full bg-primary/30" />
            <span className="relative h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-card" />
          </span>
          <span className="glass-panel rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-tight">
            {user.userName}
          </span>
        </div>
      </motion.div>

      <span className="glass-panel absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Google Maps placeholder
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-border py-2.5 text-sm first:border-t-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tracking-tight">{value}</span>
    </div>
  );
}

function LocationPage() {
  const live = useLiveLocation();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live location"
        title="Responder proximity"
        description="Fixed ESP32 node, your last GPS ping and the route the backend calculated between them."
      />

      {live.isLoading || !live.data ? (
        <div className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-4xl sm:aspect-[16/9]" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-3xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card ambient-grid rounded-4xl p-4 lg:p-6"
          >
            <MapPlaceholder data={live.data} />
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Your live position
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> Fixed hardware
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RouteIcon className="h-3.5 w-3.5" /> Backend route
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> GPS shared every minute
              </span>
            </div>
          </motion.section>

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: RouteIcon,
                label: "Distance to hardware",
                value: formatDistance(live.data.proximity.distanceMeters),
                hint: "Computed by backend",
              },
              {
                icon: Timer,
                label: "Estimated travel time",
                value: formatEta(live.data.proximity.etaSeconds),
                hint: `${live.data.proximity.travelMode} route`,
              },
              {
                icon: Radio,
                label: "Nearest responder",
                value: live.data.proximity.isNearestResponder ? "You" : "Another user",
                hint: "Selected server-side",
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="surface-card rounded-3xl p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-2xl font-semibold tracking-tight">{item.value}</p>
                <p className="mt-1 text-sm font-medium">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
              </motion.div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="surface-card rounded-3xl p-5"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <Cpu className="h-4 w-4 text-primary" /> Fixed hardware location
              </h2>
              <div className="mt-4">
                <InfoRow label="Device" value={live.data.hardware.deviceName} />
                <InfoRow label="Device ID" value={live.data.hardware.deviceId} />
                <InfoRow label="Address" value={live.data.hardware.address} />
                <InfoRow
                  label="Coordinates"
                  value={`${live.data.hardware.lat.toFixed(5)}, ${live.data.hardware.lng.toFixed(5)}`}
                />
              </div>
              <Button variant="outline" size="lg" className="mt-5 w-full" asChild>
                <Link to="/devices/$deviceId" params={{ deviceId: live.data.hardware.deviceId }}>
                  <MapPin /> Open device
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="surface-card rounded-3xl p-5"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <Crosshair className="h-4 w-4 text-primary" /> Current user location
              </h2>
              <div className="mt-4">
                <InfoRow label="User" value={live.data.user.userName} />
                <InfoRow
                  label="Coordinates"
                  value={`${live.data.user.lat.toFixed(5)}, ${live.data.user.lng.toFixed(5)}`}
                />
                <InfoRow label="GPS accuracy" value={`±${live.data.user.accuracyMeters} m`} />
                <InfoRow label="Last shared" value={formatRelativeTime(live.data.user.reportedAt)} />
              </div>
              <Button
                variant="outline"
                size="lg"
                className="mt-5 w-full"
                onClick={() => live.refetch()}
                disabled={live.isFetching}
              >
                <Navigation /> {live.isFetching ? "Syncing…" : "Refresh from backend"}
              </Button>
            </motion.div>
          </section>

          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            Distance, route and travel time are calculated by the backend, which also decides which
            registered user is closest to the hardware. This screen renders those values only —
            placeholders are ready for the live API.
          </p>
        </>
      )}
    </div>
  );
}
