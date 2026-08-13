import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Cpu,
  Droplets,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Siren,
  Thermometer,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { GasGauge } from "@/components/ui-kit/gas-gauge";
import { ProgressMeter, RadialGauge } from "@/components/ui-kit/radial-gauge";
import { StatusPill } from "@/components/ui-kit/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendChart } from "@/components/charts/trend-chart";
import { EventTimeline, MqttStatusCard } from "@/components/dashboard/dashboard-widgets";
import {
  useAlerts,
  useDevices,
  useMqttStatus,
  useNetworkTrend,
  useSummary,
  useTimeline,
} from "@/hooks/use-gasguard";
import { useEmergency } from "@/hooks/use-emergency";
import { formatRelativeTime, riskFromPpm } from "@/utils/gas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live IoT Dashboard — GasGuard AI" },
      {
        name: "description",
        content:
          "Live LPG concentration, MQ sensor gauges, MQTT link health and emergency controls for every GasGuard AI node.",
      },
      { property: "og:title", content: "Live IoT Dashboard — GasGuard AI" },
      {
        property: "og:description",
        content: "Real-time MQ sensor telemetry, MQTT status and emergency response controls.",
      },
    ],
  }),
  component: DashboardPage,
});

const statusCopy = {
  safe: {
    tone: "success" as const,
    label: "Safe",
    headline: "All zones are safe",
    body: "Concentration across every node is well below the 400 ppm action threshold.",
  },
  warning: {
    tone: "warning" as const,
    label: "Warning",
    headline: "Elevated gas concentration",
    body: "Readings are trending above baseline. Ventilate the area and monitor closely.",
  },
  leak: {
    tone: "danger" as const,
    label: "Gas Leak",
    headline: "Gas leak detected",
    body: "Auto shut-off engaged. Evacuate the area and ventilate before resetting the valve.",
  },
};

function DashboardPage() {
  const summary = useSummary();
  const devices = useDevices();
  const alerts = useAlerts();
  const trend = useNetworkTrend();
  const mqtt = useMqttStatus();
  const timeline = useTimeline();
  const { raise } = useEmergency();

  const criticalDevice = devices.data?.find((device) => device.status === "alarm");
  const activeDevice = criticalDevice ?? devices.data?.find((device) => device.status === "online");
  const peakPpm = criticalDevice?.ppm ?? activeDevice?.ppm ?? summary.data?.averagePpm ?? 0;
  const risk = riskFromPpm(peakPpm);
  const state = risk === "critical" ? "leak" : risk === "warning" || risk === "elevated" ? "warning" : "safe";
  const status = statusCopy[state];
  const activeAlerts = alerts.data?.filter((alert) => alert.state === "active") ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Live monitoring"
        title="Site safety at a glance"
        description="MQ sensor arrays, ambient conditions and valve state streaming over MQTT in real time."
        action={
          <Button variant="hero" size="lg" asChild>
            <Link to="/devices">
              Manage devices <ArrowRight />
            </Link>
          </Button>
        }
      />

      {/* Current status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="ambient-grid surface-card overflow-hidden rounded-4xl p-6 lg:p-9"
      >
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <StatusPill tone={status.tone} pulse label={`Current status · ${status.label}`} />
            <h2 className="text-balance-tight mt-5 text-3xl font-semibold lg:text-4xl">
              {status.headline}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {criticalDevice
                ? `${criticalDevice.name} at ${criticalDevice.location} — ${status.body}`
                : status.body}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                variant="emergency"
                size="xl"
                onClick={() => {
                  toast.error("Emergency broadcast sent to all contacts");
                  raise(criticalDevice ?? activeDevice ?? null);
                }}
              >
                <Siren /> Trigger emergency
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/contacts">
                  <PhoneCall /> Call responder
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-surface p-6">
            {summary.isLoading ? (
              <Skeleton className="mx-auto h-40 w-full max-w-[280px] rounded-3xl" />
            ) : (
              <GasGauge ppm={peakPpm} />
            )}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Peak reading · updated {summary.data ? formatRelativeTime(summary.data.lastSweep) : "—"}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Current device + MQTT */}
      <section className="grid gap-4 lg:grid-cols-2">
        {devices.isLoading || !activeDevice ? (
          <Skeleton className="h-64 rounded-3xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card rounded-3xl p-5"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Current device
                </p>
                <h3 className="mt-2 truncate text-xl font-semibold tracking-tight">
                  {activeDevice.name}
                </h3>
                <p className="mt-1 truncate text-xs text-muted-foreground">{activeDevice.location}</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Cpu className="h-5 w-5" />
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/60 px-3 py-2">
                <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Device ID
                </dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold">{activeDevice.id}</dd>
              </div>
              <div className="rounded-2xl bg-muted/60 px-3 py-2">
                <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Firmware
                </dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold">{activeDevice.firmware}</dd>
              </div>
            </dl>

            <div className="mt-5 space-y-4">
              <ProgressMeter
                label="Signal strength"
                value={activeDevice.signalPercent}
                display={`${activeDevice.signalPercent}%`}
                tone={activeDevice.signalPercent > 60 ? "success" : "warning"}
              />
              <ProgressMeter
                label="Battery"
                value={activeDevice.batteryPercent}
                display={`${activeDevice.batteryPercent}%`}
                delay={0.1}
                tone={activeDevice.batteryPercent > 30 ? "primary" : "danger"}
              />
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Signal className="h-3.5 w-3.5" /> Heartbeat {formatRelativeTime(activeDevice.lastSeen)}
            </div>
          </motion.div>
        )}

        {mqtt.isLoading || !mqtt.data ? (
          <Skeleton className="h-64 rounded-3xl" />
        ) : (
          <MqttStatusCard status={mqtt.data} index={1} />
        )}
      </section>

      {/* Gas sensors */}
      <section className="surface-card rounded-4xl p-6 lg:p-8">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">Gas sensors</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              MQ2, MQ5 and MQ6 channels with ambient conditions
            </p>
          </div>
          <StatusPill tone={status.tone} label={status.label} pulse={state !== "safe"} />
        </div>

        {devices.isLoading || !activeDevice ? (
          <Skeleton className="h-40 rounded-3xl" />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { key: "mq2", label: "MQ2", value: activeDevice.sensors.mq2 },
                  { key: "mq5", label: "MQ5", value: activeDevice.sensors.mq5 },
                  { key: "mq6", label: "MQ6", value: activeDevice.sensors.mq6 },
                ] as const
              ).map((sensor, index) => {
                const sensorRisk = riskFromPpm(sensor.value);
                const tone =
                  sensorRisk === "critical"
                    ? "danger"
                    : sensorRisk === "warning"
                      ? "warning"
                      : sensorRisk === "elevated"
                        ? "primary"
                        : "success";
                return (
                  <RadialGauge
                    key={sensor.key}
                    label={sensor.label}
                    value={sensor.value}
                    tone={tone}
                    delay={index * 0.12}
                  />
                );
              })}
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                  <Thermometer className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <ProgressMeter
                    label="Temperature"
                    value={activeDevice.temperatureC}
                    max={60}
                    display={`${activeDevice.temperatureC.toFixed(1)} °C`}
                    tone="warning"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Droplets className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <ProgressMeter
                    label="Humidity"
                    value={activeDevice.humidityPercent}
                    display={`${activeDevice.humidityPercent}%`}
                    tone="primary"
                    delay={0.1}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-muted/60 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Nodes online
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tracking-tight">
                    {summary.data ? `${summary.data.devicesOnline}/${summary.data.devicesTotal}` : "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Safety score
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tracking-tight">
                    {summary.data ? `${summary.data.safetyScore}/100` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Chart */}
      <section className="surface-card rounded-4xl p-6 lg:p-8">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">Concentration trend</h2>
            <p className="mt-1 text-sm text-muted-foreground">Network average over the last 8 hours</p>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary sm:inline-flex">
            <Activity className="h-3.5 w-3.5" /> Streaming
          </span>
        </div>
        {trend.isLoading || !trend.data ? (
          <Skeleton className="h-[220px] rounded-3xl" />
        ) : (
          <TrendChart data={trend.data} />
        )}
      </section>

      {/* Recent events */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent events</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/alerts">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>
          {timeline.isLoading || !timeline.data ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-3xl" />
              ))}
            </div>
          ) : (
            <EventTimeline events={timeline.data} />
          )}
        </div>

        <div className="space-y-4">
          <div className="surface-card rounded-3xl p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-medium text-muted-foreground">Active alerts</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{activeAlerts.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">Unacknowledged incidents right now</p>
          </div>
          <div className="surface-card rounded-3xl p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-medium text-muted-foreground">Auto shut-off</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">Armed</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Valves respond within 1.5s of a threshold breach
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
