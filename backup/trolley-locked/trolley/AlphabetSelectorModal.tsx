"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Home,
  Lock,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Volume2,
} from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import {
  FREE_MAX_TROLLEY_LETTERS,
  PRO_MAX_TROLLEY_LETTERS,
} from "@/utils/membership";
import {
  getTargetWordsForLetter,
  TROLLEY_LETTERS,
  type ShopperChoice,
} from "@/utils/trolleyCatalog";
import { triggerHaptic } from "@/utils/haptics";
import { playBoop, playDing } from "@/utils/celebrate";
import { speakEnglish } from "@/utils/speech";

type AlphabetSelectorModalProps = {
  selected: string[];
  maxLetters: number;
  isPro: boolean;
  onChangeSelected: (letters: string[]) => void;
  shopper: ShopperChoice;
  onChangeShopper: (shopper: ShopperChoice) => void;
  onStartShopping: () => void;
};

const spring = { type: "spring" as const, stiffness: 420, damping: 24 };

export default function AlphabetSelectorModal({
  selected,
  maxLetters,
  isPro,
  onChangeSelected,
  shopper,
  onChangeShopper,
  onStartShopping,
}: AlphabetSelectorModalProps) {
  const router = useRouter();
  const [capNotice, setCapNotice] = useState<string | null>(null);

  const toggleLetter = (letter: string) => {
    triggerHaptic(25);
    setCapNotice(null);

    if (selected.includes(letter)) {
      onChangeSelected(selected.filter((l) => l !== letter));
      return;
    }

    if (selected.length >= maxLetters) {
      playBoop();
      const msg = isPro
        ? `You picked ${PRO_MAX_TROLLEY_LETTERS} letters — tap one to swap!`
        : `Free accounts can pick up to ${FREE_MAX_TROLLEY_LETTERS} letters. Pro unlocks ${PRO_MAX_TROLLEY_LETTERS}!`;
      setCapNotice(msg);
      speakEnglish(msg, { rate: 0.95, pitch: 1.05 });
      return;
    }

    playDing();
    const previewWord = getTargetWordsForLetter(letter)[0] ?? letter;
    speakEnglish(`Letter ${letter}, like ${previewWord}!`, {
      rate: 0.95,
      pitch: 1.08,
    });
    onChangeSelected([...selected, letter]);
  };

  const quickFill = () => {
    triggerHaptic(30);
    playDing();
    const next = TROLLEY_LETTERS.slice(0, maxLetters);
    onChangeSelected(next);
    setCapNotice(null);
    speakEnglish(
      `Picked the first ${maxLetters} letters. Ready to shop!`,
      { rate: 0.95, pitch: 1.08 },
    );
  };

  const clearAll = () => {
    triggerHaptic(25);
    onChangeSelected([]);
    setCapNotice(null);
  };

  const canStart = selected.length > 0;

  return (
    <div className="min-h-[75vh] rounded-3xl bg-gradient-to-b from-indigo-50/60 via-purple-50/40 to-slate-50 p-3 sm:p-5">
      <motion.section
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
        className="mx-auto max-w-4xl space-y-5 rounded-3xl border-4 border-white/90 bg-white/85 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-7"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
              Supermarket Trolley · Step 1
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-800 sm:text-3xl">
              Pick Your Shopping Letters
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">
              Each letter is a shop aisle: 5 treats, toys, and groceries that
              start with that letter, plus 10 other items. Collect all 5 for +5 stars!
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span
              className={`inline-flex items-center gap-1.5 rounded-2xl border-2 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide shadow-sm ${
                isPro
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-sky-200 bg-sky-50 text-sky-900"
              }`}
            >
              {isPro ? (
                <>
                  <Crown className="h-4 w-4 text-amber-500" aria-hidden />
                  Pro Pass · Up to {PRO_MAX_TROLLEY_LETTERS} Letters
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-sky-600" aria-hidden />
                  Free Plan · Up to {FREE_MAX_TROLLEY_LETTERS} Letters (Pro ={" "}
                  {PRO_MAX_TROLLEY_LETTERS})
                </>
              )}
            </span>
            <span className="text-sm font-extrabold text-slate-700">
              Selected: {selected.length} / {maxLetters}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-extrabold text-slate-700">Who is shopping?</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(
              [
                { id: "boy" as const, label: "Boy", detail: "Blue shirt, short hair" },
                { id: "girl" as const, label: "Girl", detail: "Pink shirt, long hair" },
              ]
            ).map((choice) => {
              const active = shopper === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    onChangeShopper(choice.id);
                    playDing();
                    speakEnglish(`${choice.label} is pushing the trolley.`, {
                      rate: 0.95,
                      pitch: 1.08,
                    });
                  }}
                  className={`rounded-3xl border-4 px-4 py-4 text-left shadow-sm ${
                    active
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="block text-2xl" aria-hidden>
                    {choice.id === "boy" ? "👦" : "👧"}
                  </span>
                  <span className="mt-1 block text-lg font-black text-slate-800">
                    {choice.label}
                  </span>
                  <span className="block text-xs font-semibold text-slate-500">
                    {choice.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MotionPressable
            onClick={quickFill}
            ariaLabel={`Auto pick ${maxLetters} letters`}
            className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Quick pick {maxLetters} ({TROLLEY_LETTERS.slice(0, maxLetters).join(", ")})
          </MotionPressable>
          {selected.length > 0 && (
            <MotionPressable
              onClick={clearAll}
              ariaLabel="Clear selected letters"
              className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Clear
            </MotionPressable>
          )}
          <MotionPressable
            onClick={() =>
              speakEnglish(
                `Pick up to ${maxLetters} letters for your supermarket trolley ride!`,
                { rate: 0.95, pitch: 1.08 },
              )
            }
            ariaLabel="Hear instructions"
            className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-sky-200 bg-white px-3.5 py-2 text-xs font-bold text-sky-800 shadow-sm"
          >
            <Volume2 className="h-3.5 w-3.5" aria-hidden />
            Hear instructions
          </MotionPressable>
        </div>

        {capNotice && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-bold text-amber-900"
          >
            {capNotice}
          </motion.p>
        )}

        <div
          role="group"
          aria-label="Alphabet letters A to Z"
          className="grid grid-cols-6 gap-2.5 sm:grid-cols-9 md:grid-cols-9"
        >
          {TROLLEY_LETTERS.map((letter) => {
            const isPicked = selected.includes(letter);
            const orderBadge = isPicked ? selected.indexOf(letter) + 1 : null;
            const atCap = !isPicked && selected.length >= maxLetters;

            return (
              <motion.button
                key={letter}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92, y: 4 }}
                transition={spring}
                onClick={() => toggleLetter(letter)}
                aria-pressed={isPicked}
                aria-label={`Letter ${letter}${isPicked ? ", selected" : ""}`}
                className={`relative flex h-14 flex-col items-center justify-center rounded-2xl border-4 font-extrabold shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition ${
                  isPicked
                    ? "border-emerald-400 bg-gradient-to-b from-emerald-400 to-teal-500 text-white"
                    : atCap
                      ? "border-white/80 bg-white/60 text-slate-400"
                      : "border-white bg-white/95 text-slate-800 hover:border-sky-200"
                }`}
              >
                <span className="text-xl leading-none sm:text-2xl">{letter}</span>
                {orderBadge != null && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-300 text-[11px] font-black text-amber-950 shadow">
                    {orderBadge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <MotionPressable
              onClick={() => router.push("/games")}
              ariaLabel="Back to Games"
              className="inline-flex items-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow"
            >
              Back to Games
            </MotionPressable>
            <MotionPressable
              onClick={() => router.push("/")}
              ariaLabel="Go to homepage"
              className="inline-flex items-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow"
            >
              <Home className="h-4 w-4" aria-hidden />
              Home
            </MotionPressable>
          </div>

          <MotionPressable
            onClick={() => {
              if (!canStart) {
                playBoop();
                speakEnglish("Pick at least one letter to start shopping!", {
                  rate: 0.95,
                  pitch: 1.05,
                });
                return;
              }
              playDing();
              onStartShopping();
            }}
            ariaLabel="Take trolley and start shopping"
            className={`inline-flex items-center justify-center gap-2 rounded-3xl border-b-8 px-7 py-4 text-lg font-extrabold text-white shadow-xl ${
              canStart
                ? "border-emerald-700 bg-gradient-to-b from-emerald-400 to-teal-500"
                : "border-slate-400 bg-slate-300"
            }`}
          >
            <Check className="h-5 w-5" aria-hidden />
            Take Trolley &amp; Start ({selected.length}{" "}
            {selected.length === 1 ? "Shelf" : "Shelves"})
          </MotionPressable>
        </div>
      </motion.section>
    </div>
  );
}
