import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, MessageSquareLock, TriangleAlert } from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { authService, type PendingVerification } from "@/services/auth-service";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify your SMS code — GasGuard AI" },
      {
        name: "description",
        content: "Enter the six-digit code sent to your phone to unlock your GasGuard AI safety dashboard.",
      },
      { property: "og:title", content: "Verify your SMS code — GasGuard AI" },
      { property: "og:description", content: "One-time passcode verification for GasGuard AI." },
    ],
  }),
  component: VerifyPage,
});

const RESEND_SECONDS = 45;
type Status = "idle" | "loading" | "error" | "success";

function VerifyPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [pending, setPending] = useState<PendingVerification | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (authService.getSession()) {
      navigate({ to: "/", replace: true });
      return;
    }
    const stored = authService.getPending();
    if (!stored) {
      navigate({ to: "/login", replace: true });
      return;
    }
    setPending(stored);
    inputs.current[0]?.focus();
  }, [navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (!clean && value !== "") return;
    setStatus("idle");
    const next = [...digits];
    if (clean.length > 1) {
      clean.split("").slice(0, 6 - index).forEach((char, offset) => {
        next[index + offset] = char;
      });
      setDigits(next);
      const last = Math.min(index + clean.length, 5);
      inputs.current[last]?.focus();
    } else {
      next[index] = clean;
      setDigits(next);
      if (clean && index < 5) inputs.current[index + 1]?.focus();
    }
    if (next.every((char) => char !== "")) void submit(next.join(""));
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function submit(code: string) {
    setStatus("loading");
    try {
      await authService.verifyOtp(code);
      setStatus("success");
      refresh();
      setTimeout(() => navigate({ to: "/", replace: true }), 1100);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Verification failed.");
      setDigits(Array(6).fill(""));
      setTimeout(() => inputs.current[0]?.focus(), 240);
    }
  }

  async function resend() {
    if (seconds > 0 || !pending) return;
    setStatus("loading");
    await authService.sendOtp(pending.countryCode, pending.phone);
    setSeconds(RESEND_SECONDS);
    setDigits(Array(6).fill(""));
    setStatus("idle");
    inputs.current[0]?.focus();
  }

  const locked = status === "loading" || status === "success";

  return (
    <AuthScreen className="justify-between gap-10">
      <div>
        <button
          type="button"
          onClick={() => navigate({ to: "/login" })}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back to phone number"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <span className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <MessageSquareLock className="h-6 w-6" />
        </span>

        <h1 className="text-balance-tight mt-5 text-3xl font-semibold">Enter your code</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We sent a six-digit code to{" "}
          <span className="font-semibold text-foreground">
            {pending ? `${pending.countryCode} ${pending.phone}` : "your phone"}
          </span>
          .
        </p>

        <motion.div
          animate={status === "error" ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-8 flex gap-2"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              value={digit}
              disabled={locked}
              inputMode="numeric"
              aria-label={`Digit ${index + 1}`}
              maxLength={6}
              onChange={(event) => setDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              className={`h-16 w-full rounded-2xl border bg-card text-center text-2xl font-semibold shadow-soft outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/15 disabled:opacity-70 ${
                status === "error"
                  ? "border-danger text-danger"
                  : status === "success"
                    ? "border-success text-success"
                    : "border-border focus:border-primary"
              }`}
            />
          ))}
        </motion.div>

        <div className="mt-5 min-h-12">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.p
                key="loading"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying your code…
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 text-sm font-medium text-danger"
              >
                <TriangleAlert className="h-4 w-4" /> {message}
              </motion.p>
            )}
            {status === "success" && (
              <motion.p
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm font-semibold text-success"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 16 }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.span>
                Verified — opening your dashboard
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          The code expires after 5 minutes. You can request a new code when the resend timer ends.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          variant="ghost"
          onClick={resend}
          disabled={seconds > 0 || locked}
          className="h-12 rounded-2xl text-sm font-semibold"
        >
          {seconds > 0
            ? `Resend code in 0:${String(seconds).padStart(2, "0")}`
            : "Resend OTP"}
        </Button>
      </div>
    </AuthScreen>
  );
}
