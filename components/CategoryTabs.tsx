"use client";

import { motion } from "framer-motion";
import CategoryBadge from "@/components/scenes/CategoryBadge";
import {
  CATEGORY_STYLES,
  type FlashcardCategory,
} from "@/utils/flashcards";
import { triggerHaptic } from "@/utils/haptics";

type CategoryTabsProps = {
  active: FlashcardCategory;
  onChange: (category: FlashcardCategory) => void;
};

const CATEGORIES: FlashcardCategory[] = ["nouns", "verbs", "abc"];

const springTransition = { type: "spring" as const, stiffness: 400, damping: 22 };

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {CATEGORIES.map((category) => {
        const style = CATEGORY_STYLES[category];
        const isActive = active === category;

        return (
          <motion.button
            key={category}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={springTransition}
            onClick={() => {
              triggerHaptic(30);
              onChange(category);
            }}
            aria-pressed={isActive}
            className={`flex items-center gap-2 rounded-3xl border-4 border-b-8 px-5 py-3 text-base font-bold shadow-xl transition-colors active:translate-y-0.5 ${
              isActive
                ? `${style.tab} ring-4 ring-indigo-300 ring-offset-2`
                : "border-white bg-white/80 text-slate-600 hover:bg-white"
            }`}
          >
            <CategoryBadge category={category} size={24} />
            {style.label}
          </motion.button>
        );
      })}
    </div>
  );
}
