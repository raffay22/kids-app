"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Puzzle, Rocket, Star } from "lucide-react";

const LOADING_MESSAGES = [
  "Loading your next adventure... 🚀",
  "Getting your brain playground ready... ✨",
  "Setting up puzzles & stories... 🎨",
] as const;

type LoadingSplashProps = {
  /** Optional custom status message (overrides rotating messages). */
  message?: string;
  /** Optional explicit 0–100 progress value; defaults to smooth animated fill. */
  progress?: number;
  /** Full viewport splash by default; set false for embedded containers. */
  fullScreen?: boolean;
};

const ORBIT_ITEMS = [
  {
    id: "star",
    angle: 0,
    Icon: Star,
    badgeClass: "bg-amber-400 text-amber-950 ring-amber-200",
    label: "Star",
  },
  {
    id: "puzzle",
    angle: 120,
    Icon: Puzzle,
    badgeClass: "bg-violet-500 text-white ring-violet-200",
    label: "Puzzle",
  },
  {
    id: "rocket",
    angle: 240,
    Icon: Rocket,
    badgeClass: "bg-sky-500 text-white ring-sky-200",
    label: "Rocket",
  },
] as const;

export default function LoadingSplash({
  message,
  progress,
  fullScreen = true,
}: LoadingSplashProps) {
  const prefersReducedMotion = useReducedMotion();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const timer = window.setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [message]);

  const activeMessage = message ?? LOADING_MESSAGES[msgIndex];
  const clampedProgress =
    typeof progress === "number"
      ? Math.max(0, Math.min(100, progress))
      : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#FFFBEB] px-6 py-12 text-center ${
        fullScreen ? "min-h-screen" : "min-h-[24rem] rounded-3xl"
      }`}
    >
      {/* Subtle warm sensory radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22)_0%,rgba(255,251,235,0)_62%)]"
      />

      {/* Centered 3D 'G' Logo + 3 Orbiting Celestial Elements */}
      <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
        {/* Soft dashed orbit track */}
        <div
          aria-hidden
          className="absolute inset-4 rounded-full border-2 border-dashed border-amber-300/70"
        />

        {/* Smoothly rotating orbital ring */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {ORBIT_ITEMS.map(({ id, angle, Icon, badgeClass }) => (
            <div
              key={id}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `rotate(${angle}deg) translateY(-96px) translate(-50%, -50%)`,
              }}
            >
              <motion.span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-md ring-4 ${badgeClass}`}
                animate={prefersReducedMotion ? undefined : { rotate: -360 }}
                transition={{
                  duration: 9,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Icon className="h-5 w-5" strokeWidth={2.4} />
              </motion.span>
            </div>
          ))}
        </motion.div>

        {/* Floating / bobbing 3D 'G' mascot logo */}
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, -10, 0],
                  rotate: [-1.5, 1.5, -1.5],
                  scale: [1, 1.03, 1],
                }
          }
          transition={{
            duration: 2.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative z-10 flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/growvajuniorstudio-logo-transparent.png"
            alt="Growva Junior Studio"
            className="h-28 w-auto select-none object-contain drop-shadow-[0_12px_20px_rgba(245,158,11,0.3)] sm:h-32"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* Dynamic Loading Messages (Ages 1-9) */}
      <div className="relative mt-6 flex min-h-[2.25rem] items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeMessage}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-xl font-extrabold tracking-tight text-amber-900"
          >
            {activeMessage}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Rounded Pill Progress Bar with Vibrant Energy Gradient */}
      <div className="relative mt-5 w-full max-w-xs sm:max-w-sm">
        <div className="h-4 w-full overflow-hidden rounded-full border-2 border-white bg-amber-100/90 p-0.5 shadow-inner">
          {clampedProgress !== null ? (
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-sky-400"
              initial={{ width: "8%" }}
              animate={{ width: `${Math.max(8, clampedProgress)}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          ) : (
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-sky-400"
              initial={{ width: "18%", x: "-20%" }}
              animate={
                prefersReducedMotion
                  ? { width: "75%", x: "0%" }
                  : {
                      width: ["22%", "68%", "35%", "82%", "22%"],
                      x: ["-10%", "25%", "95%", "15%", "-10%"],
                    }
              }
              transition={{
                duration: 2.6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
