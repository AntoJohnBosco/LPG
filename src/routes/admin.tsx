import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  CircleSlash2,
  Cpu,
  Gauge,
  MapPin,
  Radio,
  Search,
  ShieldAlert,
  Users,
  Wifi,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/ui-kit/metric-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { AdminChip, AdminPanel, ExportButton, HealthBar } from "@/components/admin/admin-widgets";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAlerts,
  useDevices,
  useMqttStatus,
  useNetworkTrend,
  useRegisteredUsers,
} from "@/hooks/use-gasguard";
import { downloadCsv } from "@/utils/export";
import { formatRelativeTime, riskLabel, severityLabel, statusLabel } from "@/utils/gas";
import { cn } from "@/lib/utils";
import type { AlertEvent, Device, RegisteredUser } from "@/types";

type DeviceFilter = "all" | "online" | "offline" | "alarm" | "maintenance";
type UserFilter = "all" | "owner" | "responder" | "technician" | "viewer";

const DEVICE_FILTERS: DeviceFilter[] = ["all", "online", "offline", "alarm", "maintenance"];
const USER_FILTERS: UserFilter[] = ["all", "owner", "responder", "technician", "viewer"];

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q.slice(0, 80) : "",
    device: DEVICE_FILTERS.includes(search.device as DeviceFilter)
      ? (search.device as DeviceFilter)
      : ("all" as DeviceFilter),
    role: USER_FILTERS.includes(search.role as UserFilter)
      ? (search.role as UserFilter)
      : ("all" as UserFilter),
  }),
  head: () => ({
    meta: [
      { title: "Admin Console — GasGuard AI" },
      {
        name: "description",
        content:
          "Operations console for registered devices and users, live MQTT health, gas levels, alerts and responder locations.",
      },
      { property: "og:title", content: "Admin Console — GasGuard AI" },
      {
        property: "og:description",
        content: "Monitor the full LPG sensor fleet, user directory and live telemetry in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function deviceTone(device: Device) {
  if (device.status === "alarm") return "danger" as const;
  if (device.status === "offline") return "neutral" as const;
  if (device.status === "maintenance") return "warning" as const;
  return "success" as const;
}

function healthScore(device: Device) {
  const battery = device.batteryPercent;
  const signal = device.signalPercent;
  const penalty = device.status === "offline" ? 45 : device.status === "alarm" ? 25 : 0;
  return Math.max(0, Math.round((battery * 0.4 + signal * 0.6) - penalty));
}

function FilterPills<T extends string>({
  values,
  active,
  onSelect,
}: {
  values: T[];
  active: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-300 active:scale-95",
            active === value
              ? "border-primary bg-primary text-primary-foreground shadow-glow"
              : "border-border bg-card/70 text-muted-foreground hover:text-foreground",
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

function AdminPage() {
  const { q, device: deviceFilter, role } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const devices = useDevices();
  const users = useRegisteredUsers();
  const alerts = useAlerts();
  const mqtt = useMqttStatus();
  const trend = useNetworkTrend();

  const setSearch = (patch: Partial<{ q: string; device: DeviceFilter; role: UserFilter }>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }) });

  const allDevices = devices.data ?? [];
  const allUsers = users.data ?? [];
  const allAlerts = alerts.data ?? [];
  const needle = q.trim().toLowerCase();

  const matchesDevice = (d: Device) =>
    !needle ||
    [d.name, d.id, d.location].some((field) => field.toLowerCase().includes(needle));

  const filteredDevices = allDevices
    .filter((d) => (deviceFilter === "all" ? true : d.status === deviceFilter))
    .filter(matchesDevice);

  const filteredUsers = allUsers
    .filter((u) => (role === "all" ? true : u.role === role))
    .filter(
      (u) =>
        !needle ||
        [u.name, u.phone, u.city, u.id].some((field) => field.toLowerCase().includes(needle)),
    );

  const filteredAlerts = allAlerts.filter(
    (a) =>
      !needle ||
      [a.deviceName, a.title, a.location].some((field) => field.toLowerCase().includes(needle)),
  );

  const online = allDevices.filter((d) => d.status === "online" || d.status === "alarm").length;
  const offline = allDevices.length - online;
  const avgPpm = allDevices.length
    ? Math.round(allDevices.reduce((sum, d) => sum + d.ppm, 0) / allDevices.length)
    : 0;
  const peak = allDevices.reduce<Device | null>(
    (best, d) => (!best || d.ppm > best.ppm ? d : best),
    null,
  );
  const avgHealth = allDevices.length
    ? Math.round(allDevices.reduce((sum, d) => sum + healthScore(d), 0) / allDevices.length)
    : 0;

  const gasChart = allDevices.map((d) => ({
    name: d.name.split(" ")[0],
    ppm: d.ppm,
    risk: d.riskLevel,
  }));

  const barColor = {
    safe: "var(--success)",
    elevated: "var(--primary)",
    warning: "var(--warning)",
    critical: "var(--danger)",
  } as const;

  const roleSplit = USER_FILTERS.filter((r) => r !== "all").map((r) => ({
    name: r,
    value: allUsers.filter((u) => u.role === r).length,
  }));
  const pieColors = ["var(--primary)", "var(--success)", "var(--warning)", "var(--danger)"];

  const loading = devices.isLoading || users.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Admin console"
        description="Fleet-wide visibility over registered devices, users, live MQTT telemetry and emergency response readiness."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ExportButton
              label="Export devices"
              onClick={() =>
                downloadCsv(
                  "gasguard-devices",
                  filteredDevices.map((d) => ({
                    id: d.id,
                    name: d.name,
                    location: d.location,
                    status: d.status,
                    ppm: d.ppm,
                    risk: d.riskLevel,
                    battery: d.batteryPercent,
                    signal: d.signalPercent,
                    health: healthScore(d),
                    firmware: d.firmware,
                    lastSeen: d.lastSeen,
                  })),
                  [
                    { key: "id", label: "Device ID" },
                    { key: "name", label: "Name" },
                    { key: "location", label: "Location" },
                    { key: "status", label: "Status" },
                    { key: "ppm", label: "PPM" },
                    { key: "risk", label: "Risk" },
                    { key: "battery", label: "Battery %" },
                    { key: "signal", label: "Signal %" },
                    { key: "health", label: "Health" },
                    { key: "firmware", label: "Firmware" },
                    { key: "lastSeen", label: "Last seen" },
                  ],
                )
              }
            />
            <ExportButton
              label="Export users"
              onClick={() =>
                downloadCsv(
                  "gasguard-users",
                  filteredUsers.map((u) => ({
                    id: u.id,
                    name: u.name,
                    phone: u.phone,
                    role: u.role,
                    status: u.status,
                    city: u.city,
                    devices: u.devicesAssigned,
                    lastActive: u.lastActiveAt,
                    lat: u.location.lat.toFixed(5),
                    lng: u.location.lng.toFixed(5),
                  })),
                  [
                    { key: "id", label: "User ID" },
                    { key: "name", label: "Name" },
                    { key: "phone", label: "Phone" },
                    { key: "role", label: "Role" },
                    { key: "status", label: "Status" },
                    { key: "city", label: "City" },
                    { key: "devices", label: "Devices" },
                    { key: "lastActive", label: "Last active" },
                    { key: "lat", label: "Latitude" },
                    { key: "lng", label: "Longitude" },
                  ],
                )
              }
            />
          </div>
        }
      />

      <div className="surface-card flex flex-wrap items-center gap-3 rounded-3xl p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => setSearch({ q: event.target.value })}
            placeholder="Search devices, users, locations, alerts…"
            className="h-11 rounded-2xl pl-10"
            aria-label="Search admin records"
          />
        </div>
        <FilterPills
          values={DEVICE_FILTERS}
          active={deviceFilter}
          onSelect={(value) => setSearch({ device: value })}
        />
        {q && (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setSearch({ q: "" })}>
            Clear
          </Button>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard index={0} icon={Cpu} label="Registered devices" value={allDevices.length} hint="Across all sites" />
        <MetricCard index={1} icon={Users} tone="success" label="Registered users" value={allUsers.length} hint="Owners & responders" />
        <MetricCard index={2} icon={Wifi} tone="success" label="Online devices" value={online} hint="Reporting heartbeat" />
        <MetricCard index={3} icon={CircleSlash2} tone="warning" label="Offline devices" value={offline} hint="No heartbeat" />
        <MetricCard index={4} icon={Gauge} label="Average gas level" value={avgPpm} unit="ppm" hint={`Peak ${peak?.ppm ?? 0} ppm`} />
        <MetricCard index={5} icon={ShieldAlert} tone="danger" label="Active alerts" value={allAlerts.length} hint="Requires triage" />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPanel
          index={1}
          title="Current gas levels"
          description="Live concentration per registered sensor"
          className="xl:col-span-2"
        >
          {loading ? (
            <Skeleton className="h-[260px] w-full rounded-3xl" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gasChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 8" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} width={46} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--card-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="ppm" radius={[10, 10, 4, 4]}>
                    {gasChart.map((entry) => (
                      <Cell key={entry.name} fill={barColor[entry.risk]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AdminPanel>

        <AdminPanel index={2} title="Live MQTT status" description="Broker connectivity and throughput">
          {mqtt.isLoading || !mqtt.data ? (
            <Skeleton className="h-[260px] w-full rounded-3xl" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft text-success">
                  <Radio className="h-5 w-5" />
                  <motion.span
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-2xl border border-success"
                  />
                </span>
                <div>
                  <AdminChip tone={mqtt.data.state === "online" ? "success" : "warning"}>
                    {mqtt.data.state}
                  </AdminChip>
                  <p className="mt-1 text-xs text-muted-foreground">{mqtt.data.broker}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Latency", `${mqtt.data.latencyMs} ms`],
                  ["Msgs / min", mqtt.data.messagesPerMinute],
                  ["Uptime", `${mqtt.data.uptimePercent}%`],
                  ["Last msg", formatRelativeTime(mqtt.data.lastMessageAt)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-2xl bg-muted/50 p-3">
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="truncate rounded-2xl bg-primary-soft px-3 py-2 font-mono text-xs text-primary">
                {mqtt.data.topic}
              </p>
              <div className="flex items-center justify-between rounded-2xl border border-border px-3 py-2 text-sm">
                <span className="text-muted-foreground">Fleet health</span>
                <HealthBar value={avgHealth} tone={avgHealth > 70 ? "success" : avgHealth > 45 ? "warning" : "danger"} />
              </div>
            </div>
          )}
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPanel index={3} title="Network concentration trend" description="Rolling average across all sensors" className="xl:col-span-2">
          {trend.isLoading ? <Skeleton className="h-[220px] w-full rounded-3xl" /> : <TrendChart data={trend.data ?? []} />}
        </AdminPanel>
        <AdminPanel index={4} title="User roles" description="Directory composition">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleSplit} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3} stroke="none">
                  {roleSplit.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    fontSize: 12,
                    textTransform: "capitalize",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
      </div>

      <AdminPanel
        index={5}
        title="Registered devices"
        description={`${filteredDevices.length} of ${allDevices.length} devices · health, gas level and connectivity`}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Gas level</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-right">Battery</TableHead>
                <TableHead>Firmware</TableHead>
                <TableHead className="text-right">Last seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <span className="block font-semibold">{d.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {d.id} · {d.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    <AdminChip tone={deviceTone(d)}>{statusLabel[d.status]}</AdminChip>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{d.ppm} ppm</TableCell>
                  <TableCell>
                    <AdminChip
                      tone={
                        d.riskLevel === "critical"
                          ? "danger"
                          : d.riskLevel === "warning"
                            ? "warning"
                            : d.riskLevel === "elevated"
                              ? "primary"
                              : "success"
                      }
                    >
                      {riskLabel[d.riskLevel]}
                    </AdminChip>
                  </TableCell>
                  <TableCell>
                    <HealthBar
                      value={healthScore(d)}
                      tone={healthScore(d) > 70 ? "success" : healthScore(d) > 45 ? "warning" : "danger"}
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{d.batteryPercent}%</TableCell>
                  <TableCell className="text-muted-foreground">{d.firmware}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatRelativeTime(d.lastSeen)}</TableCell>
                </TableRow>
              ))}
              {!loading && filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No devices match the current search and filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </AdminPanel>

      <AdminPanel
        index={6}
        title="Registered users"
        description={`${filteredUsers.length} of ${allUsers.length} users · role, activity and assigned devices`}
        actions={<FilterPills values={USER_FILTERS} active={role} onSelect={(value) => setSearch({ role: value })} />}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Devices</TableHead>
                <TableHead className="text-right">Last active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <span className="block font-semibold">{u.name}</span>
                    <span className="block text-xs text-muted-foreground">{u.phone}</span>
                  </TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>
                    <AdminChip
                      tone={u.status === "active" ? "success" : u.status === "invited" ? "primary" : "danger"}
                    >
                      {u.status}
                    </AdminChip>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.city}</TableCell>
                  <TableCell className="text-right tabular-nums">{u.devicesAssigned}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatRelativeTime(u.lastActiveAt)}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No users match the current search and filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </AdminPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel
          index={7}
          title="Recent alerts"
          description="Latest detections across the fleet"
          actions={
            <ExportButton
              label="Export alerts"
              onClick={() =>
                downloadCsv(
                  "gasguard-alerts",
                  filteredAlerts.map((a: AlertEvent) => ({
                    id: a.id,
                    device: a.deviceName,
                    location: a.location,
                    title: a.title,
                    severity: a.severity,
                    state: a.state,
                    ppm: a.ppm,
                    createdAt: a.createdAt,
                  })),
                  [
                    { key: "id", label: "Alert ID" },
                    { key: "device", label: "Device" },
                    { key: "location", label: "Location" },
                    { key: "title", label: "Type" },
                    { key: "severity", label: "Severity" },
                    { key: "state", label: "State" },
                    { key: "ppm", label: "PPM" },
                    { key: "createdAt", label: "Timestamp" },
                  ],
                )
              }
            />
          }
        >
          <ul className="space-y-3">
            {filteredAlerts.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-3xl border border-border p-3">
                <span
                  className={cn(
                    "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
                    a.severity === "critical"
                      ? "bg-danger-soft text-danger"
                      : a.severity === "warning"
                        ? "bg-warning-soft text-warning"
                        : "bg-primary-soft text-primary",
                  )}
                >
                  <ShieldAlert className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.deviceName} · {a.location} · {a.ppm} ppm
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <AdminChip tone={a.severity === "critical" ? "danger" : a.severity === "warning" ? "warning" : "primary"}>
                    {severityLabel[a.severity]}
                  </AdminChip>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(a.createdAt)}</p>
                </div>
              </li>
            ))}
            {!alerts.isLoading && filteredAlerts.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">No alerts match your search.</li>
            )}
          </ul>
        </AdminPanel>

        <AdminPanel
          index={8}
          title="Current user locations"
          description="Latest GPS pings reported by clients every minute — proximity is computed by the backend"
        >
          <div className="relative mb-4 h-[220px] overflow-hidden rounded-3xl border border-border bg-muted/40">
            {filteredUsers.map((u: RegisteredUser) => (
              <motion.span
                key={u.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ left: `${u.location.mapX}%`, top: `${u.location.mapY}%` }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-[10px] font-semibold shadow-soft",
                  u.location.isNearestResponder
                    ? "bg-danger text-primary-foreground"
                    : "bg-card text-foreground",
                )}
              >
                <MapPin className="mr-1 inline h-3 w-3" />
                {u.name.split(" ")[0]}
              </motion.span>
            ))}
          </div>
          <ul className="space-y-2">
            {filteredUsers.slice(0, 6).map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.location.lat.toFixed(4)}, {u.location.lng.toFixed(4)} ·{" "}
                    {formatRelativeTime(u.location.reportedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {u.location.isNearestResponder && <AdminChip tone="danger">Nearest</AdminChip>}
                  <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    {(u.location.distanceMeters / 1000).toFixed(2)} km
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </div>
  );
}
