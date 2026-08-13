import { Link, useRouterState } from "@tanstack/react-router";
import { AlertTriangle, LayoutDashboard, Map, Navigation, PhoneCall, Settings, ShieldHalf } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/map", label: "Map", icon: Map },
  { to: "/location", label: "Live", icon: Navigation },
  { to: "/contacts", label: "Contacts", icon: PhoneCall },
  { to: "/admin", label: "Admin", icon: ShieldHalf },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function useActivePath() {
  return useRouterState({ select: (state) => state.location.pathname });
}

export { Link };
