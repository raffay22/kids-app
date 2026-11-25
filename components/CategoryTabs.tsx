"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import CategoryBadge from "@/components/scenes/CategoryBadge";
import {
  PRO_LOCKED_FLASHCARD_CATEGORIES,
  useProAccess,
} from "@/hooks/useProAccess";
import {
  CATEGORY_STYLES,
  type FlashcardCategory,
} from "@/utils/flashcards";
import { triggerHaptic } from "@/utils/haptics";

type CategoryTabsProps = {
  active: FlashcardCategory;
  onChange: (category: FlashcardCategory) => void;
};

const CATEGORIES: FlashcardCategory[] = [
  "nouns",
  "objects",
  "verbs",
  "pronouns",
  "adjectives",
  "vowels_consonants",
  "abc",
];

const springTransition = { type: "spring" as const, stiffness: 400, damping: 22 };

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const { isPro } = useProAccess();
  const [lockedLabel, setLockedLabel] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {CATEGORIES.map((category) => {
          const style = CATEGORY_STYLES[category];
          const isActive = active === category;
          const isLocked = !isPro && PRO_LOCKED_FLASHCARD_CATEGORIES.has(category);

          return (
            <motion.button
              key={category}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={springTransition}
              onClick={() => {
                triggerHaptic(30);
                if (isLocked) {
                  setLockedLabel(style.label);
                  return;
                }
                onChange(category);
              }}
              aria-pressed={isActive}
              className={`flex items-center gap-2 rounded-3xl border-4 border-b-8 px-5 py-3 text-base font-bold shadow-xl transition-colors active:translate-y-0.5 ${
                isActive
                  ? `${style.tab} ring-4 ring-indigo-300 ring-offset-2`
                  : isLocked
                    ? "border-amber-200 bg-amber-50/70 text-slate-700 hover:bg-amber-50"
                    : "border-white bg-white/80 text-slate-600 hover:bg-white"
              }`}
            >
              <CategoryBadge category={category} size={24} />
              {style.label}
              {isLocked && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-amber-950">
                  <Lock className="h-3 w-3" aria-hidden />
                  🔒
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <ProUpgradeModal
        open={Boolean(lockedLabel)}
        onClose={() => setLockedLabel(null)}
        title={`Unlock ${lockedLabel ?? "Grammar"} Flashcards`}
        description="Pronouns, Adjectives, and Action Verbs flashcards are part of Growva Junior Pro. Upgrade to unlock all grammar categories!"
      />
    </>
  );
}
