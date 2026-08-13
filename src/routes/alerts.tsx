import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { History } from "lucide-react";

import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { AlertCard } from "@/components/alerts/alert-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcknowledgeAlert, useAlerts } from "@/hooks/use-gasguard";
import type { AlertState } from "@/types";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts & Incidents — GasGuard AI" },
      {
        name: "description",
        content: "Review active, acknowledged and resolved LPG leak incidents across the site.",
      },
      { property: "og:title", content: "Alerts & Incidents — GasGuard AI" },
      { property: "og:description", content: "Track and acknowledge LPG leak incidents." },
    ],
  }),
  component: AlertsPage,
});

const states: Array<{ value: AlertState | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

function AlertsPage() {
  const { data, isLoading } = useAlerts();
  const acknowledge = useAcknowledgeAlert();
  const [state, setState] = useState<AlertState | "all">("all");

  const alerts = (data ?? []).filter((alert) => state === "all" || alert.state === state);

  return (
    <div>
      <PageHeader
        eyebrow="Incident log"
        title="Alerts & response"
        description="Every detection event with its severity, affected zone and response state."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {states.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={state === item.value ? "default" : "outline"}
            onClick={() => setState(item.value)}
          >
            {item.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" className="ml-auto" asChild>
          <Link to="/history" search={{ range: "week", q: "" }}>
            <History /> History
          </Link>
        </Button>
      </div>


      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-3xl" />)
          : alerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                index={index}
                pending={acknowledge.isPending}
                onAcknowledge={(id) => {
                  acknowledge.mutate(id);
                  toast.success("Alert acknowledged");
                }}
              />
            ))}
      </div>

      {!isLoading && alerts.length === 0 && (
        <div className="surface-card rounded-3xl p-10 text-center">
          <p className="text-sm font-medium">Nothing here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No incidents match the selected state.
          </p>
        </div>
      )}
    </div>
  );
}
