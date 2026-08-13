import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-3xl",
        interactive && "transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("surface-card rounded-3xl", className)}>{children}</div>;
}
