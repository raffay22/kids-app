"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Cloud } from "lucide-react";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";
import { getSensoryTtsSpeed } from "@/utils/sensoryPrefs";
import { speakEnglish, stopKidsSpeech } from "@/utils/speech";
import { triggerHaptic } from "@/utils/haptics";

type Phase = "idle" | "inhale" | "exhale";

const PHASE_MS = 4000;

/**
 * Activity 4 — Guided paced breathing (hold-to-breathe).
 * SVG / Lucide vector mascot only — no raster images, no scores/timers UI.
 */
export default function BreathingMascot() {
  const { prefs } = useSensoryPrefs();
  const [holding, setHolding] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [prompt, setPrompt] = useState("Press and Hold to Breathe");
  const timerRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const holdingRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleNext = (next: Phase) => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (!holdingRef.current) return;
      runPhase(next);
    }, PHASE_MS);
  };

  const runPhase = (next: Phase) => {
    if (!holdingRef.current && next !== "idle") return;
    phaseRef.current = next;
    setPhase(next);
    if (next === "inhale") {
      setPrompt("Inhale slowly...");
      scheduleNext("exhale");
      return;
    }
    if (next === "exhale") {
      setPrompt("Exhale slowly...");
      scheduleNext("inhale");
    }
  };

  const beginHold = () => {
    holdingRef.current = true;
    setHolding(true);
    triggerHaptic(25);
    stopKidsSpeech();
    runPhase("inhale");
  };

  const endHold = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    clearTimer();
    phaseRef.current = "idle";
    setPhase("idle");
    setPrompt("Hold to continue breathing together");
    speakEnglish("Hold to continue breathing together", {
      rate: getSensoryTtsSpeed(),
      pitch: 1.0,
    });
  };

  useEffect(() => () => clearTimer(), []);

  const scale =
    prefs.reducedMotion || phase === "idle"
      ? 1
      : phase === "inhale"
        ? 1.4
        : 1;
  const ringClass =
    phase === "inhale"
      ? "border-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.55)]"
      : phase === "exhale"
        ? "border-cyan-300 shadow-[0_0_40px_rgba(103,232,249,0.5)]"
        : "border-violet-200 shadow-[0_0_24px_rgba(167,139,250,0.35)]";

  return (
    <div className="flex min-h-[75vh] flex-col bg-gradient-to-b from-indigo-100 via-purple-50 to-sky-100 pb-8">
      <div className="p-4">
        <Link
          href="/asd"
          className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-xl backdrop-blur-xl"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Sensory Hub
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
        <p
          className="rounded-full bg-white/80 px-5 py-2 text-center text-lg font-extrabold text-violet-800 shadow-md"
          aria-live="polite"
        >
          {prompt}
        </p>

        <button
          type="button"
          aria-label="Press and hold to breathe with the mascot"
          onPointerDown={(e) => {
            e.preventDefault();
            beginHold();
          }}
          onPointerUp={endHold}
          onPointerLeave={() => {
            if (holding) endHold();
          }}
          onPointerCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
          className="relative touch-none select-none"
        >
          {/* Outer aura */}
          <motion.div
            className={`absolute inset-[-28px] rounded-full border-4 ${ringClass}`}
            animate={
              prefs.reducedMotion || !holding
                ? { scale: 1, opacity: 0.55 }
                : { scale: [1, 1.08, 1], opacity: [0.45, 0.8, 0.45] }
            }
            transition={
              prefs.reducedMotion
                ? { duration: 0 }
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
          />
          {/* Inner aura */}
          <motion.div
            className={`absolute inset-[-14px] rounded-full border-4 ${ringClass}`}
            animate={
              prefs.reducedMotion || !holding
                ? { scale: 1, opacity: 0.7 }
                : { scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }
            }
            transition={
              prefs.reducedMotion
                ? { duration: 0 }
                : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
            }
          />

          <motion.div
            animate={{ scale }}
            transition={
              prefs.reducedMotion
                ? { duration: 0 }
                : { duration: 4, ease: "easeInOut" }
            }
            className="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-white bg-white/95 shadow-xl backdrop-blur-xl sm:h-52 sm:w-52"
          >
            {/* Soft SVG star glow behind Lucide cloud */}
            <svg
              viewBox="0 0 120 120"
              className="absolute h-28 w-28 text-amber-200 sm:h-32 sm:w-32"
              aria-hidden
            >
              <circle cx="60" cy="60" r="36" fill="currentColor" opacity="0.55" />
              <path
                d="M60 18 L68 48 L98 48 L74 66 L82 96 L60 78 L38 96 L46 66 L22 48 L52 48 Z"
                fill="#fde68a"
                opacity="0.85"
              />
            </svg>
            <Cloud
              className="relative h-16 w-16 text-sky-500 sm:h-20 sm:w-20"
              strokeWidth={2.2}
              aria-hidden
            />
          </motion.div>
        </button>

        <p className="max-w-sm text-center text-sm font-medium text-slate-600">
          No scores · no timers · just breathe together.
        </p>
      </div>
    </div>
  );
}
