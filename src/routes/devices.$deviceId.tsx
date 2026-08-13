import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Battery,
  Droplets,
  Power,
  RefreshCw,
  Signal,
  Thermometer,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GasGauge } from "@/components/ui-kit/gas-gauge";
import { DeviceStatusPill } from "@/components/ui-kit/status-pill";
import { TrendChart } from "@/components/charts/trend-chart";
import { useDevice, useDeviceReadings, useToggleValve } from "@/hooks/use-gasguard";
import { formatRelativeTime } from "@/utils/gas";

export const Route = createFileRoute("/devices/$deviceId")({
  head: () => ({
    meta: [
      { title: "Device Detail — GasGuard AI" },
      {
        name: "description",
        content: "Inspect live LPG readings, environment data and valve controls for a sensor.",
      },
      { property: "og:title", content: "Device Detail — GasGuard AI" },
      { property: "og:description", content: "Live sensor readings and valve controls." },
    ],
  }),
  component: DeviceDetailPage,
});

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Battery;
  label: string;
  value: string;
}) {
  return (
    <div className="surface-card rounded-3xl p-4">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function DeviceDetailPage() {
  const { deviceId } = Route.useParams();
  const { data: device, isLoading } = useDevice(deviceId);
  const readings = useDeviceReadings(deviceId);
  const valve = useToggleValve(deviceId);

  if (isLoading) {
    return <Skeleton className="h-96 rounded-4xl" />;
  }

  if (!device) {
    return (
      <div className="surface-card rounded-3xl p-10 text-center">
        <p className="text-sm font-medium">Device not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/devices">Back to devices</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/devices">
          <ArrowLeft /> Devices
        </Link>
      </Button>

      <PageHeader
        eyebrow={device.location}
        title={device.name}
        description={`Firmware ${device.firmware} · last heartbeat ${formatRelativeTime(device.lastSeen)}`}
        action={<DeviceStatusPill status={device.status} />}
      />

      <section className="surface-card ambient-grid rounded-4xl p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <GasGauge ppm={device.ppm} />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Valve control</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The solenoid valve is currently{" "}
              <strong className="text-foreground">{device.valveClosed ? "closed" : "open"}</strong>.
              Closing the valve isolates the LPG supply to this zone immediately.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant={device.valveClosed ? "success" : "emergency"}
                size="lg"
                disabled={valve.isPending}
                onClick={() => {
                  valve.mutate(!device.valveClosed);
                  toast.success(device.valveClosed ? "Valve reopened" : "Valve closed");
                }}
              >
                <Power /> {device.valveClosed ? "Reopen valve" : "Close valve"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => toast.success("Calibration scheduled")}
              >
                <Wrench /> Calibrate
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  readings.refetch();
                  toast.success("Readings refreshed");
                }}
              >
                <RefreshCw /> Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <Stat icon={Battery} label="Battery" value={`${device.batteryPercent}%`} />
        <Stat icon={Signal} label="Signal" value={`${device.signalPercent}%`} />
        <Stat icon={Thermometer} label="Temperature" value={`${device.temperatureC}°C`} />
        <Stat icon={Droplets} label="Humidity" value={`${device.humidityPercent}%`} />
      </section>

      <section className="surface-card rounded-4xl p-6 lg:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Concentration history</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Last 12 hours, 15-minute resolution</p>
        {readings.isLoading || !readings.data ? (
          <Skeleton className="h-[220px] rounded-3xl" />
        ) : (
          <TrendChart data={readings.data} height={260} />
        )}
      </section>
    </div>
  );
}
