"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Sparkles } from "lucide-react";
import Illustration from "@/components/Illustration";
import MotionPressable from "@/components/MotionPressable";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { getPhonicSound } from "@/utils/phonicsSounds";
import { logProgress } from "@/utils/logProgress";
import { burstConfetti, playDing } from "@/utils/celebrate";
import { triggerHaptic } from "@/utils/haptics";

type AisleItem = {
  id: string;
  letter: string;
  exampleWord: string;
};

/** Deterministic shuffle seeded by today's date */
function seededShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) | 0;
    const j = Math.abs(hash) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ABC_ITEMS: AisleItem[] = "abcdefghijklmnopqrstuvwxyz".split("").map((letter) => {
  const phonic = getPhonicSound(letter)!;
  return {
    id: `aisle-${letter}`,
    letter: letter.toUpperCase(),
    exampleWord: phonic.example,
  };
});

export default function TrolleyGame() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { speakWord, speak } = useTTS();

  const [collected, setCollected] = useState<string[]>([]);
  const [lastCollect, setLastCollect] = useState<string | null>(null);

  const todaySeed = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const aisleItems = useMemo(
    () => seededShuffle(ABC_ITEMS, todaySeed),
    [todaySeed],
  );

  const handleCollect = useCallback(
    async (item: AisleItem) => {
      triggerHaptic(30);
      playDing();
      setCollected((prev) => (prev.includes(item.letter) ? prev : [...prev, item.letter]));
      setLastCollect(item.letter);
      speakWord(item.letter);

      if (user && activeChild) {
        void logProgress({
          user_id: user.id,
          child_id: activeChild.id,
          feature_route: "/games/trolley",
          attempt_type: "tap",
          target_word: item.letter,
          is_correct: true,
        });
      }

      if (collected.length + 1 >= 5) {
        burstConfetti();
        speak("Great shopping! You collected five letters!", 0.95);
      }
    },
    [user, activeChild, collected.length, speakWord, speak],
  );

  return (
    <div className="space-y-5">
      <section className="kid-card border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-lime-50 p-5">
        <p className="flex items-center gap-1.5 text-sm font-bold uppercase text-emerald-600">
          <ShoppingCart className="h-4 w-4" aria-hidden />
          Alphabet Supermarket
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">Fill your trolley!</h2>
        <p className="mt-1 text-sm text-slate-600">
          Today&apos;s aisle shuffle · Collected {collected.length} letters
        </p>
      </section>

      <div className="relative overflow-hidden rounded-3xl border-4 border-emerald-200 bg-gradient-to-b from-slate-100 to-emerald-50/40 p-4">
        <motion.div
          className="flex gap-4 overflow-x-auto pb-4 pt-2"
          drag="x"
          dragConstraints={{ left: -800, right: 0 }}
        >
          {aisleItems.map((item, index) => {
            const done = collected.includes(item.letter);
            return (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => void handleCollect(item)}
                className={`kid-card flex w-[140px] shrink-0 flex-col items-center gap-2 p-4 ${
                  done
                    ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300"
                    : "border-white bg-white/90"
                }`}
              >
                <Illustration word={item.exampleWord} size="sm" />
                <span className="text-2xl font-bold text-purple-700">{item.letter}</span>
                <span className="text-xs font-medium text-slate-600">{item.exampleWord}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow-lg"
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShoppingCart className="h-6 w-6 text-emerald-600" aria-hidden />
          <span className="text-sm font-bold text-slate-700">Trolley</span>
        </motion.div>
      </div>

      <AnimatePresence>
        {lastCollect && (
          <motion.p
            key={lastCollect}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-center text-lg font-bold text-emerald-700"
          >
            <Sparkles className="h-5 w-5" aria-hidden />
            Added {lastCollect} to your trolley!
          </motion.p>
        )}
      </AnimatePresence>

      <MotionPressable
        onClick={() => {
          setCollected([]);
          setLastCollect(null);
          speak("Let's shop again!", 0.9);
        }}
        ariaLabel="Reset trolley"
        className="btn-3d-white mx-auto block px-8 py-3 text-base font-bold"
      >
        Shop again
      </MotionPressable>
    </div>
  );
}
