"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import {
  PRONOUN_CARDS,
  type FlashcardDifficultyLevel,
  type PronounFlashcard,
} from "@/utils/pronounFlashcards";
import { useTTS } from "@/hooks/useTTS";
import { triggerHaptic } from "@/utils/haptics";

const LEVEL_PILLS: {
  id: FlashcardDifficultyLevel;
  label: string;
  activeClass: string;
}[] = [
  {
    id: "basic",
    label: "Level 1: Basic",
    activeClass: "border-emerald-500 bg-emerald-500 text-white shadow-emerald-200",
  },
  {
    id: "advanced",
    label: "Level 2: Advanced",
    activeClass: "border-amber-500 bg-amber-500 text-white shadow-amber-200",
  },
  {
    id: "pro",
    label: "Level 3: Pro",
    activeClass: "border-rose-500 bg-rose-500 text-white shadow-rose-200",
  },
];

export default function PronounFlashcardBoard() {
  const { speakPlainWord } = useTTS();
  const [activeLevel, setActiveLevel] =
    useState<FlashcardDifficultyLevel>("basic");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const visibleCards = PRONOUN_CARDS.filter(
    (card) => card.level === activeLevel,
  );

  const handleCardTap = (card: PronounFlashcard) => {
    triggerHaptic(25);
    setSpeakingId(card.id);
    speakPlainWord(`${card.word}. ${card.sentence}`);
    window.setTimeout(() => {
      setSpeakingId((current) => (current === card.id ? null : current));
    }, 1400);
  };

  return (
    <div className="space-y-5">
      {/* Top Level Filter Pills */}
      <div
        role="tablist"
        aria-label="Pronoun difficulty levels"
        className="flex flex-wrap items-center justify-center gap-3 rounded-3xl border-2 border-rose-100 bg-white/95 p-3 shadow-sm"
      >
        {LEVEL_PILLS.map((pill) => {
          const isActive = activeLevel === pill.id;
          return (
            <motion.button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                triggerHaptic(20);
                setActiveLevel(pill.id);
              }}
              className={`min-h-[48px] rounded-full border-2 border-b-4 px-6 py-2.5 text-base font-extrabold transition shadow-md ${
                isActive
                  ? pill.activeClass
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-rose-50 hover:border-rose-200"
              }`}
            >
              {pill.label}
            </motion.button>
          );
        })}
      </div>

      {/* Clean 3D Pronoun Cards Grid — tap any card to hear audio */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCards.map((card) => {
          const isSpeaking = speakingId === card.id;
          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => handleCardTap(card)}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.97 }}
              animate={
                isSpeaking
                  ? { scale: [1, 1.03, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.35 }}
              aria-label={`Hear ${card.word}: ${card.sentence}`}
              className={`group flex flex-col overflow-hidden rounded-[2rem] border-4 border-b-8 bg-white text-left shadow-lg transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-400 ${
                isSpeaking
                  ? "border-rose-400 ring-4 ring-rose-200"
                  : "border-white hover:border-rose-200"
              }`}
            >
              {/* 3D Image Frame */}
              <div className="relative aspect-video w-full overflow-hidden bg-rose-50">
                {card.secondaryImageSrc ? (
                  <div className="grid h-full w-full grid-cols-2 gap-0.5 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.imageSrc}
                      alt={card.word}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.secondaryImageSrc}
                      alt={card.word}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.imageSrc}
                    alt={card.word}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                {/* Audio badge */}
                <span
                  className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition ${
                    isSpeaking
                      ? "bg-rose-500 text-white scale-110"
                      : "bg-white/90 text-rose-600 group-hover:bg-rose-500 group-hover:text-white"
                  }`}
                >
                  <Volume2 className="h-5 w-5" aria-hidden />
                </span>
              </div>

              {/* Clean Pronoun Label */}
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <span className="text-2xl font-black tracking-tight text-slate-800">
                  {card.word}
                </span>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                  Tap to hear
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
