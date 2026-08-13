import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { DeviceCard } from "@/components/devices/device-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDevices } from "@/hooks/use-gasguard";
import type { DeviceStatus } from "@/types";

export const Route = createFileRoute("/devices/")({
  head: () => ({
    meta: [
      { title: "Sensor Devices — GasGuard AI" },
      {
        name: "description",
        content: "Browse every GasGuard LPG sensor with live readings, battery and signal health.",
      },
      { property: "og:title", content: "Sensor Devices — GasGuard AI" },
      { property: "og:description", content: "Live readings and health for every LPG sensor." },
    ],
  }),
  component: DevicesPage,
});

const filters: Array<{ value: DeviceStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "alarm", label: "Alarm" },
  { value: "offline", label: "Offline" },
  { value: "maintenance", label: "Service" },
];

function DevicesPage() {
  const { data, isLoading } = useDevices();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DeviceStatus | "all">("all");

  const devices = (data ?? []).filter((device) => {
    const matchesQuery = `${device.name} ${device.location}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesStatus = status === "all" || device.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Fleet"
        title="Sensor devices"
        description="Every node in the LPG detection network with live concentration and hardware health."
      />

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or location"
            className="h-12 rounded-2xl pl-11"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              size="sm"
              variant={status === filter.value ? "default" : "outline"}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-3xl" />)
          : devices.map((device, index) => (
              <DeviceCard key={device.id} device={device} index={index} />
            ))}
      </div>

      {!isLoading && devices.length === 0 && (
        <div className="surface-card rounded-3xl p-10 text-center">
          <p className="text-sm font-medium">No devices match this filter</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or clear the status filter.
          </p>
        </div>
      )}
    </div>
  );
}
