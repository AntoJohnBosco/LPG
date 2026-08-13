import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, MapPin, PhoneCall, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmergency } from "@/hooks/use-emergency";

const ease = [0.22, 1, 0.36, 1] as const;

function useLiveClock(active: boolean) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!active) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

export function EmergencyOverlay() {
  const { device, dismiss } = useEmergency();
  const now = useLiveClock(Boolean(device));

  return (
    <AnimatePresence>
      {device && (
        <motion.div
          key={device.id}
          role="alertdialog"
          aria-modal="true"
          aria-label="LPG gas leak detected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease }}
          className="fixed inset-0 z-[120] overflow-y-auto text-emergency-foreground"
        >
          <div className="emergency-canvas absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent,oklch(0.14_0.06_24/45%))]" />

          <div className="relative mx-auto flex min-h-full w-full max-w-xl flex-col items-center px-6 py-12 text-center sm:py-16">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease }}
              className="text-[11px] font-semibold uppercase tracking-[0.38em] text-emergency-muted"
            >
              GasGuard AI · Emergency
            </motion.p>

            {/* Warning icon with calm expanding rings */}
            <motion.div
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.7, ease }}
              className="relative mt-10 flex h-40 w-40 items-center justify-center"
            >
              {[0, 1.1, 2.2].map((delay) => (
                <span
                  key={delay}
                  style={{ animationDelay: `${delay}s` }}
                  className="emergency-ring absolute inset-0 rounded-full border border-current opacity-0"
                />
              ))}
              <motion.span
                animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-28 w-28 items-center justify-center rounded-full bg-emergency-foreground/12 backdrop-blur-sm"
              >
                <AlertTriangle className="h-14 w-14" strokeWidth={1.75} />
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.55, ease }}
              className="text-balance-tight mt-10 text-3xl font-bold uppercase tracking-[0.06em] sm:text-4xl"
            >
              LPG Gas Leak Detected
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.26, duration: 0.55 }}
              className="mt-3 max-w-sm text-sm leading-relaxed text-emergency-muted"
            >
              Evacuate the area, avoid ignition sources and ventilate before resetting the valve.
            </motion.p>

            {/* Live readout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.6, ease }}
              className="mt-9 w-full rounded-4xl border border-emergency-foreground/18 bg-emergency-foreground/8 p-6 backdrop-blur-md"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emergency-muted">
                Current gas level
              </p>
              <p className="mt-2 font-mono text-5xl font-bold tabular-nums">
                {device.ppm}
                <span className="ml-2 text-base font-semibold tracking-normal text-emergency-muted">
                  ppm
                </span>
              </p>

              <dl className="mt-6 space-y-3 text-left text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-emergency-muted">Device</dt>
                  <dd className="text-right font-semibold">{device.name}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-emergency-muted">
                    <MapPin className="h-3.5 w-3.5" /> Address
                  </dt>
                  <dd className="text-right font-semibold">{device.location}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-emergency-muted">Detected at</dt>
                  <dd className="text-right font-mono font-semibold tabular-nums">
                    {now
                      ? now.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "--:--:--"}
                  </dd>
                </div>
              </dl>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease }}
              className="mt-8 grid w-full gap-3"
            >
              <Button
                size="xl"
                asChild
                className="w-full bg-emergency-foreground text-emergency-deep hover:bg-emergency-foreground/90"
              >
                <Link to="/devices/$deviceId" params={{ deviceId: device.id }} onClick={dismiss}>
                  View details
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                asChild
                className="w-full border-emergency-foreground/40 bg-transparent text-emergency-foreground hover:bg-emergency-foreground/12 hover:text-emergency-foreground"
              >
                <Link to="/contacts" onClick={dismiss}>
                  <PhoneCall /> Emergency contacts
                </Link>
              </Button>
              <button
                type="button"
                onClick={dismiss}
                className="mx-auto mt-1 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-emergency-muted transition-colors duration-300 hover:text-emergency-foreground"
              >
                <X className="h-4 w-4" /> Dismiss
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
