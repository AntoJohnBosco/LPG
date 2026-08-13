import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "@/services/auth-service";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in with your phone — GasGuard AI" },
      {
        name: "description",
        content: "Enter your mobile number to receive a one-time SMS code and access your GasGuard AI dashboard.",
      },
      { property: "og:title", content: "Sign in with your phone — GasGuard AI" },
      { property: "og:description", content: "Passwordless SMS one-time-code sign in." },
    ],
  }),
  component: LoginPage,
});

const countryCodes = [
  { code: "+91", label: "India" },
  { code: "+1", label: "United States" },
  { code: "+44", label: "United Kingdom" },
  { code: "+61", label: "Australia" },
  { code: "+234", label: "Nigeria" },
  { code: "+971", label: "UAE" },
  { code: "+27", label: "South Africa" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const valid = digits.length >= 7 && digits.length <= 14;

  async function handleContinue() {
    if (!valid || sending) return;
    setSending(true);
    try {
      await authService.sendOtp(countryCode, digits);
      toast.success(`Code sent to ${countryCode} ${digits}`);
      navigate({ to: "/verify" });
    } catch {
      toast.error("Could not send the code. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthScreen className="justify-between gap-10">
      <div>
        <Link
          to="/welcome"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back to welcome"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <span className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Smartphone className="h-6 w-6" />
        </span>

        <h1 className="text-balance-tight mt-5 text-3xl font-semibold">What's your number?</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We'll text you a six-digit code. No passwords, no email — just your phone.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-8 flex gap-3"
        >
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger
              aria-label="Country code"
              className="h-16! w-28 rounded-2xl border-border bg-card px-4 text-base font-semibold shadow-soft"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {countryCodes.map((item) => (
                <SelectItem key={item.code} value={item.code} className="rounded-xl">
                  {item.code} · {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            aria-label="Phone number"
            placeholder="98765 43210"
            value={phone}
            maxLength={16}
            onChange={(event) => setPhone(event.target.value.replace(/[^\d\s]/g, ""))}
            onKeyDown={(event) => event.key === "Enter" && handleContinue()}
            className="h-16 flex-1 rounded-2xl border border-border bg-card px-5 text-lg font-semibold tracking-wide shadow-soft outline-none transition-all duration-300 placeholder:font-normal placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </motion.div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to receive safety-critical SMS alerts from GasGuard AI.
        </p>
      </div>

      <Button
        size="lg"
        disabled={!valid || sending}
        onClick={handleContinue}
        className="h-14 w-full rounded-2xl text-base"
      >
        {sending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Sending code…
          </>
        ) : (
          <>
            Continue <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>
    </AuthScreen>
  );
}
