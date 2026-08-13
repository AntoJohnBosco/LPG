import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LogOut, Moon, ShieldCheck, Sun } from "lucide-react";
import { navItems, useActivePath } from "./nav-items";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-2xl text-primary-foreground shadow-glow">
        <ShieldCheck className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-semibold tracking-tight">GasGuard AI</span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            LPG Safety Network
          </span>
        </span>
      )}
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/70 text-muted-foreground transition-all duration-300 hover:text-foreground active:scale-95"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <button
      type="button"
      onClick={signOut}
      aria-label="Sign out"
      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/70 text-muted-foreground transition-all duration-300 hover:text-danger active:scale-95"
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}

function Sidebar() {
  const pathname = useActivePath();

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col gap-2 border-r border-border bg-sidebar px-5 py-7 lg:flex">
      <Brand />
      <nav className="mt-9 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-300",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-gradient-surface p-5">
        <p className="text-sm font-semibold tracking-tight">Emergency protocol</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Auto shut-off valves and siren are armed across every online node.
        </p>
      </div>
    </aside>
  );
}

function BottomNav() {
  const pathname = useActivePath();

  return (
    <nav className="glass-panel fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-3xl px-2 py-2 lg:hidden">
      {navItems.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition-colors duration-300",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="bottom-active"
                className="absolute inset-0 rounded-2xl bg-primary-soft"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <item.icon className="relative h-[18px] w-[18px]" />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-30 flex items-center justify-between gap-3 rounded-none border-x-0 border-t-0 px-4 py-3 lg:px-8">
          <div className="lg:hidden">
            <Brand />
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">
            Live monitoring · all nodes reporting every 15 seconds
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 lg:px-8 lg:pb-14">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance-tight mt-1 text-2xl font-semibold lg:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </motion.div>
  );
}
