"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Apple,
  ArrowLeft,
  Bandage,
  HeartHandshake,
  Milk,
  Moon,
  ToyBrick,
  type LucideIcon,
} from "lucide-react";
import { pecsTapFeedback } from "@/utils/asdAudio";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";
import { getSensoryTtsSpeed } from "@/utils/sensoryPrefs";
import { speakEnglish, stopKidsSpeech } from "@/utils/speech";

type DailyCard = {
  id: string;
  label: string;
  speak: string;
  Icon: LucideIcon;
  borderClass: string;
  iconClass: string;
  freq: number;
};

const DAILY_CARDS: DailyCard[] = [
  {
    id: "food",
    label: "Food / Snack",
    speak: "I want a snack, please!",
    Icon: Apple,
    borderClass: "border-red-400",
    iconClass: "text-red-500",
    freq: 523.25,
  },
  {
    id: "milk",
    label: "Milk / Juice",
    speak: "I want milk, please!",
    Icon: Milk,
    borderClass: "border-blue-400",
    iconClass: "text-blue-500",
    freq: 554.37,
  },
  {
    id: "sleep",
    label: "Sleep / Tired",
    speak: "I am tired. I want to sleep, please!",
    Icon: Moon,
    borderClass: "border-indigo-400",
    iconClass: "text-indigo-500",
    freq: 493.88,
  },
  {
    id: "pain",
    label: "Pain / Hurt",
    speak: "I am hurt. I need help, please!",
    Icon: Bandage,
    borderClass: "border-rose-400",
    iconClass: "text-rose-500",
    freq: 587.33,
  },
  {
    id: "hug",
    label: "Hug",
    speak: "I want a hug!",
    Icon: HeartHandshake,
    borderClass: "border-pink-400",
    iconClass: "text-pink-500",
    freq: 659.25,
  },
  {
    id: "play",
    label: "Play / Toys",
    speak: "I want to play, please!",
    Icon: ToyBrick,
    borderClass: "border-green-400",
    iconClass: "text-green-600",
    freq: 698.46,
  },
];

const spring = { type: "spring" as const, stiffness: 420, damping: 22 };

/**
 * Activity 2 — Daily Needs & Food PECS Grid.
 * Lucide vectors only — no JPG/PNG/GIF.
 */
export default function DailyNeedsPecsGrid() {
  const { prefs } = useSensoryPrefs();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  const onTap = (card: DailyCard) => {
    setActiveId(card.id);
    pecsTapFeedback({ vibrateMs: 25, freq: card.freq });
    stopKidsSpeech();
    speakEnglish(card.speak, {
      rate: getSensoryTtsSpeed(),
      pitch: 1.05,
    });
    setLastSpoken(card.speak);
    window.setTimeout(
      () => setActiveId(null),
      prefs.reducedMotion ? 250 : 1000,
    );
  };

  return (
    <div className="min-h-[70vh] space-y-5 bg-slate-50 pb-8">
      <Link
        href="/asd"
        className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-xl backdrop-blur-xl"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Sensory Hub
      </Link>

      <section className="rounded-3xl border-4 border-white bg-white/95 p-5 shadow-xl backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Daily Needs &amp; Food
        </h1>
        <p className="mt-1 text-base font-medium text-slate-600">
          Tap a card to tell someone what you need.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {DAILY_CARDS.map((card) => {
          const Icon = card.Icon;
          const lit = activeId === card.id;
          return (
            <motion.button
              key={card.id}
              type="button"
              whileHover={prefs.reducedMotion ? undefined : { scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              transition={spring}
              onClick={() => onTap(card)}
              aria-label={card.speak}
              className={`flex min-h-[9.5rem] flex-col items-center justify-center gap-3 rounded-3xl border-4 bg-white/90 p-6 shadow-lg backdrop-blur-xl sm:min-h-[11rem] ${card.borderClass} ${
                lit
                  ? "ring-4 ring-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.55)]"
                  : ""
              }`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-white/95 shadow-md">
                <Icon
                  className={`h-8 w-8 ${card.iconClass}`}
                  strokeWidth={2.4}
                  aria-hidden
                />
              </span>
              <span className="text-center text-xl font-bold text-slate-800">
                {card.label}
              </span>
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
