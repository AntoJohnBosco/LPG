import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "GasGuard AI — Smart LPG Safety" },
      {
        name: "description",
        content: "Smart LPG safety, anywhere and anytime. Launching your GasGuard AI safety network.",
      },
      { property: "og:title", content: "GasGuard AI — Smart LPG Safety" },
      { property: "og:description", content: "Smart LPG Safety. Anywhere. Anytime." },
    ],
  }),
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      navigate({ to: session ? "/" : "/welcome", replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [ready, session, navigate]);

  return (
    <div className="ambient-grid flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center"
      >
        <motion.span
          animate={{ boxShadow: ["0 0 0 0 rgba(21,101,192,0.35)", "0 0 0 28px rgba(21,101,192,0)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="gradient-primary flex h-24 w-24 items-center justify-center rounded-[2rem] text-primary-foreground"
        >
          <ShieldCheck className="h-12 w-12" />
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="text-balance-tight mt-8 text-3xl font-semibold"
        >
          GasGuard AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-3 text-sm font-medium tracking-wide text-muted-foreground"
        >
          Smart LPG Safety. Anywhere. Anytime.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-14 h-1 w-40 overflow-hidden rounded-full bg-muted"
      >
        <motion.span
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="block h-full w-full rounded-full bg-primary"
        />
      </motion.div>
    </div>
  );
}
