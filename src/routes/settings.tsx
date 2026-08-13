import { useState, useCallback, useMemo, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Bell,
  Battery,
  Check,
  ChevronRight,
  FileText,
  Globe,
  LogOut,
  MapPin,
  Moon,
  ScrollText,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { usePreferences, useSavePreferences } from "@/hooks/use-gasguard";
import { cn } from "@/lib/utils";
import type { AuthSession } from "@/services/auth-service";
import type { NotificationPreferences } from "@/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GasGuard AI" },
      {
        name: "description",
        content: "Manage your GasGuard AI profile, notifications, appearance and safety preferences.",
      },
      { property: "og:title", content: "Settings — GasGuard AI" },
      { property: "og:description", content: "Profile, notifications and app preferences." },
    ],
  }),
  component: SettingsPage,
});

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "Hindi" },
];

const ICON_COLORS = {
  primary: "text-primary bg-primary-soft",
  success: "text-success bg-success-soft",
  warning: "text-warning bg-warning-soft",
  danger: "text-danger bg-danger-soft",
  muted: "text-muted-foreground bg-muted",
};

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore malformed storage
    }
  }, [key]);

  const setStored = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(v));
        } catch {
          // storage may be unavailable
        }
        return v;
      });
    },
    [key],
  );

  return [mounted ? value : initial, setStored] as const;
}

function formatPhone(session: AuthSession | null) {
  if (!session) return "Not signed in";
  return `+${session.countryCode} ${session.phone}`;
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
      <Check className="h-3 w-3" />
      Verified
    </span>
  );
}

function ProfileCard({ session }: { session: AuthSession | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="surface-card rounded-4xl p-5"
    >
      <div className="flex items-center gap-4">
        <div className="gradient-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-glow">
          <User className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold tracking-tight">GasGuard User</p>
          <p className="text-sm text-muted-foreground">{formatPhone(session)}</p>
          <div className="mt-1.5">
            <VerifiedBadge />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      className="space-y-2.5"
    >
      {title && (
        <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="surface-card overflow-hidden rounded-4xl">{children}</div>
    </motion.section>
  );
}

function SettingsRow({
  icon: Icon,
  color = "primary",
  title,
  subtitle,
  value,
  onClick,
  trailing,
  noChevron,
  danger,
}: {
  icon: LucideIcon;
  color?: keyof typeof ICON_COLORS;
  title: string;
  subtitle?: string;
  value?: React.ReactNode;
  onClick?: () => void;
  trailing?: React.ReactNode;
  noChevron?: boolean;
  danger?: boolean;
}) {
  const body = (
    <>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          ICON_COLORS[color],
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className={cn("text-sm font-semibold tracking-tight", danger && "text-danger")}>
          {title}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      {trailing && <div className="shrink-0">{trailing}</div>}
      {!trailing && onClick && !noChevron && (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/50 active:bg-accent/70"
      >
        {body}
      </button>
    );
  }

  return <div className="flex items-center gap-4 px-4 py-3.5">{body}</div>;
}

function NotificationSheet({
  open,
  onOpenChange,
  preferences,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NotificationPreferences | undefined;
}) {
  const save = useSavePreferences();

  const update = useCallback(
    (patch: Partial<NotificationPreferences>) => {
      if (!preferences) return;
      save.mutate({ ...preferences, ...patch });
    },
    [preferences, save],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-4xl">
        <SheetHeader className="text-left">
          <SheetTitle>Notification Settings</SheetTitle>
          <SheetDescription>Choose how GasGuard AI reaches you during events.</SheetDescription>
        </SheetHeader>

        {!preferences ? (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
          </div>
        ) : (
          <div className="mt-6 space-y-6 pb-2">
            <div className="divide-y divide-border">
              {[
                {
                  key: "pushEnabled",
                  title: "Push notifications",
                  desc: "Instant alerts on this device.",
                },
                {
                  key: "smsEnabled",
                  title: "SMS fallback",
                  desc: "Send SMS when push delivery fails.",
                },
                {
                  key: "emailEnabled",
                  title: "Email digest",
                  desc: "Daily summary of readings and incidents.",
                },
                {
                  key: "autoShutoff",
                  title: "Automatic shut-off",
                  desc: "Close the solenoid valve at critical levels.",
                },
                {
                  key: "sirenEnabled",
                  title: "On-site siren",
                  desc: "Sound the local buzzer during an alarm.",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onCheckedChange={(value) => update({ [item.key]: value })}
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold tracking-tight">Alert threshold</p>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {preferences.alertThresholdPpm} ppm
                </span>
              </div>
              <Slider
                className="mt-4"
                min={100}
                max={900}
                step={20}
                value={[preferences.alertThresholdPpm]}
                onValueChange={([value]) => update({ alertThresholdPpm: value })}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Recommended: 400 ppm — roughly 20% of the lower explosive limit for LPG.
              </p>
            </div>

            <Button variant="hero" className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function LanguageSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-4xl">
        <SheetHeader className="text-left">
          <SheetTitle>Language</SheetTitle>
          <SheetDescription>Select your preferred language for the app interface.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onChange(lang.code);
                onOpenChange(false);
                toast.success("Language updated");
              }}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3.5 text-left transition-colors hover:bg-accent/50 active:bg-accent/70"
            >
              <span className="text-sm font-medium">{lang.label}</span>
              {value === lang.code && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LegalSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-4xl">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SettingsPage() {
  const { session, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const preferences = usePreferences();

  const [language, setLanguage] = useStoredState("gasguard.language", "en");
  const [locationPermission, setLocationPermission] = useStoredState("gasguard.location-permission", false);
  const [batteryOptimization, setBatteryOptimization] = useStoredState("gasguard.battery-optimization", false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const languageLabel = useMemo(
    () => LANGUAGES.find((l) => l.code === language)?.label ?? "English",
    [language],
  );

  const handleLocationToggle = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setLocationPermission(false);
        toast.info("Location sharing disabled");
        return;
      }
      if (!navigator.geolocation) {
        toast.error("Geolocation is not available on this device");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission(true);
          toast.success("Location permission granted");
        },
        () => {
          toast.error("Location permission was denied");
        },
      );
    },
    [setLocationPermission],
  );

  const handleBatteryToggle = useCallback(
    (checked: boolean) => {
      setBatteryOptimization(checked);
      toast.success(checked ? "Battery optimisation relaxed for GasGuard AI" : "Battery optimisation restored");
    },
    [setBatteryOptimization],
  );

  const handleLogout = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    signOut();
    toast.info("Signed out successfully");
    navigate({ to: "/welcome", replace: true });
  }, [queryClient, signOut, navigate]);

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader
        title="Settings"
        description="Manage your profile, notifications and safety preferences."
      />

      <ProfileCard session={session} />

      <Section title="Account" delay={0.1}>
        <div className="divide-y divide-border">
          <SettingsRow
            icon={Smartphone}
            color="success"
            title="Verified Phone Number"
            subtitle={formatPhone(session)}
            value={<VerifiedBadge />}
          />
          <SettingsRow
            icon={LogOut}
            color="danger"
            title="Logout"
            danger
            noChevron
            onClick={handleLogout}
          />
        </div>
      </Section>

      <Section title="Preferences" delay={0.2}>
        <div className="divide-y divide-border">
          <SettingsRow
            icon={Bell}
            title="Notification Settings"
            value="Customise"
            onClick={() => setNotifOpen(true)}
          />
          <SettingsRow
            icon={Moon}
            title="Dark Mode"
            subtitle="Easier on the eyes in low light"
            trailing={
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            }
          />
          <SettingsRow
            icon={Globe}
            title="Language"
            value={languageLabel}
            onClick={() => setLangOpen(true)}
          />
          <SettingsRow
            icon={MapPin}
            color="warning"
            title="Location Permission"
            subtitle="Share GPS for emergency routing"
            trailing={
              <Switch checked={locationPermission} onCheckedChange={handleLocationToggle} />
            }
          />
          <SettingsRow
            icon={Battery}
            color="success"
            title="Battery Optimization"
            subtitle="Allow uninterrupted background monitoring"
            trailing={
              <Switch checked={batteryOptimization} onCheckedChange={handleBatteryToggle} />
            }
          />
        </div>
      </Section>

      <Section title="Legal" delay={0.3}>
        <div className="divide-y divide-border">
          <SettingsRow icon={ShieldCheck} title="Privacy Policy" onClick={() => setPrivacyOpen(true)} />
          <SettingsRow icon={ScrollText} title="Terms of Service" onClick={() => setTermsOpen(true)} />
        </div>
      </Section>

      <NotificationSheet
        open={notifOpen}
        onOpenChange={setNotifOpen}
        preferences={preferences.data}
      />
      <LanguageSheet
        open={langOpen}
        onOpenChange={setLangOpen}
        value={language}
        onChange={setLanguage}
      />
      <LegalSheet open={privacyOpen} onOpenChange={setPrivacyOpen} title="Privacy Policy">
        <p>
          <strong className="text-foreground">Last updated:</strong> August 2026
        </p>
        <p className="mt-4">
          GasGuard AI collects sensor telemetry, device status and location data only to detect LPG
          leaks and coordinate emergency response. Your information is encrypted in transit and at
          rest, and we never sell personal data to third parties.
        </p>
        <p className="mt-4">
          <strong className="text-foreground">Location data</strong> is shared only with authorised
          responders and the backend proximity engine. You can revoke location permission at any time
          from these settings.
        </p>
        <p className="mt-4">
          <strong className="text-foreground">Emergency contacts</strong> are stored securely and
          used solely for alert escalation during critical detection events.
        </p>
      </LegalSheet>
      <LegalSheet open={termsOpen} onOpenChange={setTermsOpen} title="Terms of Service">
        <p>
          By using GasGuard AI you agree to the following terms. The service is provided as an
          auxiliary safety monitoring tool and does not replace certified gas detection equipment or
          professional emergency services.
        </p>
        <p className="mt-4">
          <strong className="text-foreground">Use of the service.</strong> You are responsible for
          keeping your device online, maintaining accurate emergency contacts, and responding to
          critical alerts promptly.
        </p>
        <p className="mt-4">
          <strong className="text-foreground">Liability.</strong> GasGuard AI is not liable for
          damages arising from sensor faults, network outages or delayed notifications. Always call
          emergency services if you suspect a gas leak.
        </p>
      </LegalSheet>
    </div>
  );
}
