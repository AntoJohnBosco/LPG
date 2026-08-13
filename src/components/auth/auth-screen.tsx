import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Shared full-bleed canvas + enter transition for every auth screen. */
export function AuthScreen({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="ambient-grid relative flex min-h-screen w-full flex-col bg-background">
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10 ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
