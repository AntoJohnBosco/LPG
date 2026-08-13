import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Clock, Flame, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/ui-kit/metric-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts, useDevices, useNetworkTrend } from "@/hooks/use-gasguard";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Safety Analytics — GasGuard AI" },
      {
        name: "description",
        content: "Trend analysis of LPG concentration, incident frequency and response times.",
      },
      { property: "og:title", content: "Safety Analytics — GasGuard AI" },
      { property: "og:description", content: "Concentration trends and incident analytics." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const devices = useDevices();
  const alerts = useAlerts();
  const trend = useNetworkTrend();

  const perDevice = (devices.data ?? []).map((device) => ({
    name: device.name.split(" ")[0],
    ppm: device.ppm,
    risk: device.riskLevel,
  }));

  const barColor = {
    safe: "var(--success)",
    elevated: "var(--primary)",
    warning: "var(--warning)",
    critical: "var(--danger)",
  } as const;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Safety analytics"
        description="Understand concentration patterns, incident frequency and how fast the site responds."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard index={0} icon={Flame} tone="danger" label="Incidents (30d)" value={alerts.data?.length ?? 0} hint="All severities" />
        <MetricCard index={1} icon={Clock} label="Avg response" value="1m 42s" hint="Alert to acknowledgement" />
        <MetricCard index={2} icon={TrendingDown} tone="success" label="False positives" value="2.1" unit="%" hint="Down from 5.4% last month" />
        <MetricCard index={3} icon={Activity} tone="warning" label="Uptime" value="99.4" unit="%" hint="Network heartbeat availability" />
      </section>

      <section className="surface-card rounded-4xl p-6 lg:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Network concentration</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Rolling average across all sensors</p>
        {trend.isLoading || !trend.data ? (
          <Skeleton className="h-[240px] rounded-3xl" />
        ) : (
          <TrendChart data={trend.data} height={260} />
        )}
      </section>

      <section className="surface-card rounded-4xl p-6 lg:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Current reading by device</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">ppm, latest sample</p>
        {devices.isLoading ? (
          <Skeleton className="h-[240px] rounded-3xl" />
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perDevice} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 8" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} width={46} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="ppm" radius={[12, 12, 6, 6]} maxBarSize={54}>
                  {perDevice.map((entry) => (
                    <Cell key={entry.name} fill={barColor[entry.risk]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
