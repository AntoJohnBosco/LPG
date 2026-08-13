import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, Clock, History, Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertHistory } from "@/hooks/use-gasguard";
import { cn } from "@/lib/utils";
import type { AlertEvent, AlertSeverity } from "@/types";

type RangeKey = "today" | "week" | "month" | "year";

const RANGES: Array<{ value: RangeKey; label: string; days: number }> = [
  { value: "today", label: "Today", days: 1 },
  { value: "week", label: "Week", days: 7 },
  { value: "month", label: "Month", days: 30 },
  { value: "year", label: "Year", days: 365 },
];

export const Route = createFileRoute("/history")({
  validateSearch: (search: Record<string, unknown>) => ({
    range: (["today", "week", "month", "year"] as const).includes(search.range as RangeKey)
      ? (search.range as RangeKey)
      : ("week" as RangeKey),
    q: typeof search.q === "string" ? search.q.slice(0, 80) : "",
  }),
  head: () => ({
    meta: [
      { title: "Alert History — GasGuard AI" },
      {
        name: "description",
        content:
          "Searchable timeline of every LPG detection event with date, time, alert type, severity and resolution state.",
      },
      { property: "og:title", content: "Alert History — GasGuard AI" },
      {
        property: "og:description",
        content: "Filter your gas leak incident history by today, week, month or year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

const severityTone: Record<AlertSeverity, { dot: string; chip: string; label: string }> = {
  critical: {
    dot: "bg-destructive shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-destructive)_20%,transparent)]",
    chip: "bg-destructive/10 text-destructive",
    label: "Critical",
  },
  warning: {
    dot: "bg-warning shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-warning)_20%,transparent)]",
    chip: "bg-warning/10 text-warning",
    label: "Warning",
  },
  info: {
    dot: "bg-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]",
    chip: "bg-primary-soft text-primary",
    label: "Info",
  },
};

function formatDay(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function groupByDay(alerts: AlertEvent[]) {
  const groups = new Map<string, AlertEvent[]>();
  for (const alert of alerts) {
    const key = formatDay(new Date(alert.createdAt));
    groups.set(key, [...(groups.get(key) ?? []), alert]);
  }
  return [...groups.entries()];
}

function HistoryPage() {
  const { range, q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const history = useAlertHistory();

  const days = RANGES.find((item) => item.value === range)?.days ?? 7;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const needle = q.trim().toLowerCase();

  const filtered = (history.data ?? []).filter((alert) => {
    if (new Date(alert.createdAt).getTime() < cutoff) return false;
    if (!needle) return true;
    return [alert.title, alert.deviceName, alert.location, alert.severity, alert.state]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const groups = groupByDay(filtered);
  const resolvedCount = filtered.filter((alert) => alert.state === "resolved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Archive"
        title="Alert history"
        description="Every detection event on a timeline — searchable and filterable by period."
      />

      <section className="surface-card rounded-4xl p-5 sm:p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            maxLength={80}
            placeholder="Search device, zone, alert type…"
            aria-label="Search alert history"
            className="h-12 rounded-2xl pl-11 pr-11"
            onChange={(event) =>
              navigate({ search: (prev: { range: RangeKey; q: string }) => ({ ...prev, q: event.target.value }) })
            }
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => navigate({ search: (prev: { range: RangeKey; q: string }) => ({ ...prev, q: "" }) })}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {RANGES.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={range === item.value ? "default" : "outline"}
              onClick={() => navigate({ search: (prev: { range: RangeKey; q: string }) => ({ ...prev, range: item.value }) })}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {history.isLoading
            ? "Loading history…"
            : `${filtered.length} event${filtered.length === 1 ? "" : "s"} · ${resolvedCount} resolved`}
        </p>
      </section>

      {history.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="surface-card rounded-4xl p-10 text-center">
          <History className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold tracking-tight">No events in this period</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Try a wider filter or clear the search to see more of your incident archive.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([day, events], groupIndex) => (
            <section key={day}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {day}
              </h2>
              <div className="relative mt-4 pl-7">
                <span
                  aria-hidden
                  className="absolute left-[9px] top-2 bottom-2 w-px bg-border"
                />
                <div className="space-y-3">
                  {events.map((alert, index) => {
                    const tone = severityTone[alert.severity];
                    const time = new Date(alert.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <motion.article
                        key={alert.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(groupIndex * 0.05 + index * 0.04, 0.4) }}
                        className="surface-card relative rounded-3xl p-5 transition-shadow duration-300 hover:shadow-lifted"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "absolute -left-[22px] top-7 h-2.5 w-2.5 rounded-full",
                            tone.dot,
                          )}
                        />
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold tracking-tight">
                              {alert.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {alert.deviceName} · {alert.location}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                              tone.chip,
                            )}
                          >
                            {tone.label}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {alert.description}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> {time}
                          </span>
                          <span className="font-mono">{alert.ppm} ppm</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 font-semibold",
                              alert.state === "resolved" ? "text-success" : "text-warning",
                            )}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {alert.state === "resolved" ? "Resolved" : "Unresolved"}
                          </span>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
