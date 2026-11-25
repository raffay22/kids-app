"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { pecsTapFeedback } from "@/utils/asdAudio";
import { EMERGENCY_PECS_CARDS } from "@/utils/asdSensory";
import { speakEnglish, stopKidsSpeech } from "@/utils/speech";
import { getSensoryTtsSpeed } from "@/utils/sensoryPrefs";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";

const spring = { type: "spring" as const, stiffness: 420, damping: 22 };

/**
 * Activity 1 — Emergency PECS Grid (safety cards).
 * Always free / never paywalled. Lucide vectors only — no raster images.
 */
export default function EmergencyPecsGrid() {
  const { prefs } = useSensoryPrefs();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  const onTap = (card: (typeof EMERGENCY_PECS_CARDS)[number]) => {
    setActiveId(card.id);
    pecsTapFeedback({ vibrateMs: 40, freq: card.freq });
    stopKidsSpeech();
    // Slightly stronger delivery for emergency phrases.
    const rate = Math.min(0.95, Math.max(0.55, getSensoryTtsSpeed() + 0.05));
    speakEnglish(card.speak, { rate, pitch: 1.08 });
    setLastSpoken(card.speak);
    window.setTimeout(() => setActiveId(null), prefs.reducedMotion ? 200 : 700);
  };

  return (
    <div className="min-h-[70vh] space-y-5 bg-slate-50 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/asd"
          className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-xl backdrop-blur-xl"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Sensory Hub
        </Link>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-emerald-800">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Always free · safety
        </p>
      </div>

      <section className="rounded-3xl border-4 border-white bg-white/95 p-5 shadow-xl backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Emergency PECS
        </h1>
        <p className="mt-1 text-base font-medium text-slate-600">
          Tap a big card to say what you need right now.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {EMERGENCY_PECS_CARDS.map((card) => {
          const Icon = card.Icon;
          const lit = activeId === card.id;
          return (
            <motion.button
              key={card.id}
              type="button"
              whileHover={prefs.reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              onClick={() => onTap(card)}
              aria-label={card.speak}
              className={`flex min-h-[10.5rem] flex-col items-center justify-center gap-4 rounded-3xl border-4 border-b-8 p-6 shadow-xl backdrop-blur-xl sm:min-h-[12rem] sm:p-8 ${card.cardClass} ${
                lit ? "ring-4 ring-emerald-400 ring-offset-2" : ""
              }`}
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-[1.35rem] border-4 border-white shadow-lg sm:h-20 sm:w-20 ${card.iconWellClass}`}
              >
                <Icon
                  className={`h-9 w-9 sm:h-10 sm:w-10 ${card.iconClass}`}
                  strokeWidth={2.1}
                  aria-hidden
                />
              </span>
              <span className="text-xl font-extrabold sm:text-2xl">{card.label}</span>
            </motion.button>
          );
        })}
      </div>

      {lastSpoken && (
        <p
          className="rounded-3xl border-4 border-white bg-white/95 px-4 py-3 text-center text-base font-bold text-slate-700 shadow-xl backdrop-blur-xl"
          role="status"
          aria-live="polite"
        >
          Speaking: “{lastSpoken}”
        </p>
      )}
    </div>
  );
}
