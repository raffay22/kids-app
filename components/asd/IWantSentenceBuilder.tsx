"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Apple,
  ArrowLeft,
  Droplets,
  FerrisWheel,
  Hand,
  HeartHandshake,
  Milk,
  RotateCcw,
  ToyBrick,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { pecsTapFeedback } from "@/utils/asdAudio";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";
import { getSensoryTtsSpeed } from "@/utils/sensoryPrefs";
import { speakEnglish, stopKidsSpeech } from "@/utils/speech";

type NounCard = {
  id: string;
  label: string;
  Icon: LucideIcon;
  color: string;
};

const NOUNS: NounCard[] = [
  { id: "water", label: "Water", Icon: Droplets, color: "text-cyan-600" },
  { id: "milk", label: "Milk", Icon: Milk, color: "text-blue-600" },
  { id: "apple", label: "Apple", Icon: Apple, color: "text-red-500" },
  { id: "toy", label: "Toy", Icon: ToyBrick, color: "text-green-600" },
  { id: "park", label: "Park", Icon: FerrisWheel, color: "text-amber-600" },
  { id: "hug", label: "Hug", Icon: HeartHandshake, color: "text-pink-500" },
];

const spring = { type: "spring" as const, stiffness: 380, damping: 24 };

/**
 * Activity 3 — "I Want..." 2-card AAC sentence strip.
 * Lucide vectors only — no raster assets.
 */
export default function IWantSentenceBuilder() {
  const { prefs } = useSensoryPrefs();
  const [selected, setSelected] = useState<NounCard | null>(null);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  const pickNoun = (noun: NounCard) => {
    setSelected(noun);
    pecsTapFeedback({ vibrateMs: 25, freq: 587.33 });
  };

  const clearSlot = () => {
    setSelected(null);
    setLastSpoken(null);
    stopKidsSpeech();
    pecsTapFeedback({ vibrateMs: 20, freq: 392 });
  };

  const speakSentence = () => {
    if (!selected) {
      speakEnglish("Select an item below first.", {
        rate: getSensoryTtsSpeed(),
      });
      return;
    }
    const line = `I want ${selected.label}, please!`;
    pecsTapFeedback({ vibrateMs: 30, freq: 659.25 });
    stopKidsSpeech();
    speakEnglish(line, { rate: getSensoryTtsSpeed(), pitch: 1.05 });
    setLastSpoken(line);
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
          I Want… Builder
        </h1>
        <p className="mt-1 text-base font-medium text-slate-600">
          Pick a card below, then tap Speak Sentence.
        </p>
      </section>

      <LayoutGroup>
        {/* AAC strip */}
        <div className="flex min-h-[100px] items-center gap-4 rounded-3xl border-4 border-amber-300 bg-amber-100/80 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex min-w-[7.5rem] flex-col items-center justify-center gap-1 rounded-2xl border-4 border-white bg-white/95 px-4 py-3 shadow-md">
            <Hand className="h-7 w-7 text-amber-600" aria-hidden />
            <span className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
              I Want
            </span>
          </div>

          <div className="flex min-h-[88px] flex-1 items-center justify-center rounded-2xl border-4 border-dashed border-amber-400/80 bg-white/50 p-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  layoutId={`noun-${selected.id}`}
                  initial={prefs.reducedMotion ? false : { scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={spring}
                  className="flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-3 shadow-lg"
                >
                  <selected.Icon
                    className={`h-8 w-8 ${selected.color}`}
                    aria-hidden
                  />
                  <span className="text-xl font-extrabold text-slate-800">
                    {selected.label}
                  </span>
                </motion.div>
              ) : (
                <motion.p
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm font-bold text-amber-700/80"
                >
                  Select Item Below
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Choice tray */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NOUNS.map((noun) => {
            const Icon = noun.Icon;
            const isSelected = selected?.id === noun.id;
            return (
              <motion.button
                key={noun.id}
                type="button"
                layoutId={isSelected ? undefined : `noun-${noun.id}`}
                whileTap={{ scale: 0.94 }}
                transition={spring}
                onClick={() => pickNoun(noun)}
                aria-label={`Choose ${noun.label}`}
                aria-pressed={isSelected}
                className={`flex min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-3xl border-4 border-white bg-white/95 p-4 shadow-xl backdrop-blur-xl ${
                  isSelected ? "opacity-40" : ""
                }`}
              >
                <Icon className={`h-9 w-9 ${noun.color}`} aria-hidden />
                <span className="text-lg font-bold text-slate-800">
                  {noun.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      {lastSpoken && (
        <p
          className="rounded-3xl border-4 border-white bg-white/95 px-4 py-3 text-center text-base font-bold text-slate-700 shadow-xl"
          role="status"
          aria-live="polite"
        >
          Speaking: “{lastSpoken}”
        </p>
      )}

      {/* Floating actions */}
      <div className="fixed bottom-4 left-1/2 z-30 flex w-[min(100%-2rem,28rem)] -translate-x-1/2 gap-3">
        <button
          type="button"
          onClick={speakSentence}
          className="flex flex-1 items-center justify-center gap-2 rounded-3xl border-b-8 border-emerald-700 bg-emerald-500 px-4 py-4 text-base font-extrabold text-white shadow-xl"
        >
          <Volume2 className="h-5 w-5" aria-hidden />
          Speak Sentence
        </button>
        <button
          type="button"
          onClick={clearSlot}
          aria-label="Clear selection"
          className="flex items-center justify-center gap-2 rounded-3xl border-b-8 border-rose-700 bg-rose-500 px-5 py-4 text-base font-extrabold text-white shadow-xl"
        >
          <RotateCcw className="h-5 w-5" aria-hidden />
          Clear
        </button>
      </div>
    </div>
  );
}
