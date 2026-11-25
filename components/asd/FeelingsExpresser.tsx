"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Angry,
  ArrowLeft,
  Eye,
  Frown,
  Heart,
  Moon,
  Smile,
  X,
  type LucideIcon,
} from "lucide-react";
import { pecsTapFeedback } from "@/utils/asdAudio";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";
import { getSensoryTtsSpeed } from "@/utils/sensoryPrefs";
import { speakEnglish, stopKidsSpeech } from "@/utils/speech";

const spring = { type: "spring" as const, stiffness: 420, damping: 24 };

type FeelingCard = {
  id: string;
  label: string;
  phrase: string;
  speak: string;
  Icon: LucideIcon;
  cardClass: string;
  iconClass: string;
  accent: string;
  freq: number;
};

const FEELINGS: FeelingCard[] = [
  {
    id: "happy",
    label: "Happy",
    phrase: "I feel joyful and calm.",
    speak: "I am feeling happy right now.",
    Icon: Smile,
    cardClass:
      "border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 text-yellow-900",
    iconClass: "text-yellow-500",
    accent: "from-yellow-50 to-amber-50",
    freq: 659.25,
  },
  {
    id: "sad",
    label: "Sad",
    phrase: "I need comfort and kindness.",
    speak: "I am feeling sad right now.",
    Icon: Frown,
    cardClass:
      "border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 text-sky-900",
    iconClass: "text-sky-500",
    accent: "from-sky-50 to-blue-50",
    freq: 440,
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    phrase: "Too much right now — quiet please.",
    speak: "I am feeling overwhelmed right now. I need a quiet space.",
    Icon: Angry,
    cardClass:
      "border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-900",
    iconClass: "text-rose-500",
    accent: "from-rose-50 to-orange-50",
    freq: 392,
  },
  {
    id: "tired",
    label: "Tired",
    phrase: "My body needs rest.",
    speak: "I am feeling tired right now.",
    Icon: Moon,
    cardClass:
      "border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 text-violet-900",
    iconClass: "text-violet-500",
    accent: "from-violet-50 to-purple-50",
    freq: 349.23,
  },
  {
    id: "scared",
    label: "Scared",
    phrase: "I need to feel safe.",
    speak: "I am feeling scared right now.",
    Icon: Eye,
    cardClass:
      "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-900",
    iconClass: "text-amber-500",
    accent: "from-amber-50 to-yellow-50",
    freq: 493.88,
  },
];

/**
 * Activity 6 — Emotion & Feelings Expresser.
 * Lucide vectors only — no raster images. Always free.
 */
export default function FeelingsExpresser() {
  const { prefs } = useSensoryPrefs();
  const [active, setActive] = useState<FeelingCard | null>(null);

  const openFeeling = (card: FeelingCard) => {
    setActive(card);
    pecsTapFeedback({ vibrateMs: 30, freq: card.freq });
    stopKidsSpeech();
    speakEnglish(card.speak, {
      rate: getSensoryTtsSpeed(),
      pitch: 1.02,
    });
  };

  const closeFeeling = () => {
    setActive(null);
    stopKidsSpeech();
  };

  return (
    <div className="relative min-h-[70vh] space-y-5 bg-slate-50 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/asd"
          className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-xl backdrop-blur-xl"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Sensory Hub
        </Link>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-yellow-900">
          <Heart className="h-3.5 w-3.5" aria-hidden />
          Always free · feelings
        </p>
      </div>

      <section className="rounded-3xl border-4 border-white bg-white/95 p-5 shadow-xl backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
          How I Feel
        </h1>
        <p className="mt-1 text-base font-medium text-slate-600">
          Tap a card to tell a grown-up how you feel.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEELINGS.map((card) => {
          const Icon = card.Icon;
          return (
            <motion.button
              key={card.id}
              type="button"
              whileHover={prefs.reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              onClick={() => openFeeling(card)}
              aria-label={`${card.label}. ${card.speak}`}
              className={`flex min-h-[9.5rem] flex-col items-center justify-center gap-3 rounded-3xl border-4 border-b-8 p-5 text-center shadow-xl backdrop-blur-xl sm:min-h-[11rem] ${card.cardClass}`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-white/95 shadow-lg">
                <Icon
                  className={`h-9 w-9 ${card.iconClass}`}
                  strokeWidth={2.4}
                  aria-hidden
                />
              </span>
              <span className="text-xl font-extrabold">{card.label}</span>
              <span className="text-sm font-semibold opacity-80">{card.phrase}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.button
              type="button"
              aria-label="Close feeling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFeeling}
              className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={active.label}
              initial={
                prefs.reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.92, y: 16 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefs.reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92, y: 16 }
              }
              transition={spring}
              className="fixed inset-x-4 top-1/2 z-[61] mx-auto max-w-md -translate-y-1/2"
            >
              <div
                className={`rounded-3xl border-4 border-b-8 bg-gradient-to-br p-6 shadow-2xl ${active.cardClass} ${active.accent}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-white/95 shadow-lg">
                      <active.Icon
                        className={`h-9 w-9 ${active.iconClass}`}
                        strokeWidth={2.4}
                        aria-hidden
                      />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wide opacity-70">
                        How I feel
                      </p>
                      <h2 className="text-2xl font-extrabold">{active.label}</h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeFeeling}
                    className="rounded-xl bg-white/80 p-2 text-slate-600 shadow"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <p
                  className="mt-5 rounded-2xl border-4 border-white/80 bg-white/90 px-4 py-4 text-lg font-bold text-slate-800 shadow-md"
                  role="status"
                  aria-live="polite"
                >
                  {active.speak}
                </p>
                <button
                  type="button"
                  onClick={() => openFeeling(active)}
                  className="mt-4 w-full rounded-2xl border-b-4 border-slate-700/20 bg-white px-4 py-3 text-sm font-extrabold text-slate-800 shadow-md"
                >
                  Say it again
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
