import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BellRing, HeartHandshake, Radar } from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/auth-hero.jpg";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to GasGuard AI — Protect Your Home" },
      {
        name: "description",
        content:
          "Monitor gas leaks, receive emergency alerts and protect your family with the GasGuard AI safety network.",
      },
      { property: "og:title", content: "Welcome to GasGuard AI" },
      {
        property: "og:description",
        content: "Monitor gas leaks. Receive emergency alerts. Protect your family.",
      },
    ],
  }),
  component: WelcomePage,
});

const highlights = [
  { icon: Radar, title: "Monitor gas leaks", copy: "Live LPG concentration from every sensor in your home." },
  { icon: BellRing, title: "Receive emergency alerts", copy: "Instant push and SMS the moment levels rise." },
  { icon: HeartHandshake, title: "Protect your family", copy: "Automatic valve shut-off and siren response." },
];

function WelcomePage() {
  return (
    <AuthScreen className="justify-between gap-8">
      <div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[2rem] border border-border shadow-lifted"
        >
          <img
            src={heroImage}
            alt="Smart home protected by a GasGuard AI LPG sensor"
            width={1024}
            height={1024}
            className="h-52 w-full object-cover sm:h-64"
          />
        </motion.div>

        <h1 className="text-balance-tight mt-8 text-3xl font-semibold">
          Safety that never sleeps
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          GasGuard AI watches your LPG lines 24/7 and acts before a leak becomes an emergency.
        </p>

        <ul className="mt-7 flex flex-col gap-4">
          {highlights.map((item, index) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.1, duration: 0.5 }}
              className="flex items-start gap-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  {item.copy}
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="h-14 w-full rounded-2xl text-base">
          <Link to="/login">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-14 w-full rounded-2xl text-base">
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </AuthScreen>
  );
}
