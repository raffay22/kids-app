"use client";

import { motion } from "framer-motion";
import type { FlashcardCategory } from "@/utils/flashcards";

type CategoryBadgeProps = {
  category: FlashcardCategory;
  size?: number;
};

/**
 * Small colorful animated SVG badge for category tabs — replaces text emoji
 * (🧸 🏃 🔤) with a custom vector glyph consistent with the hero illustration style.
 */
export default function CategoryBadge({ category, size = 26 }: CategoryBadgeProps) {
  if (category === "nouns") {
    return (
      <motion.svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        <motion.rect
          x="6" y="6" width="28" height="28" rx="8"
          fill="#38bdf8"
          animate={{ rotate: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "20px 20px" }}
        />
        <circle cx="20" cy="20" r="7" fill="#f0f9ff" />
      </motion.svg>
    );
  }

  if (category === "verbs") {
    return (
      <motion.svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        <motion.path
          d="M8 30 L18 10 L22 20 L32 8"
          stroke="#22c55e"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{ pathLength: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="32" cy="8" r="3.5" fill="#16a34a" />
      </motion.svg>
    );
  }

  return (
    <motion.svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={6 + i * 10}
          y="14"
          width="8"
          height="16"
          rx="3"
          fill={["#a78bfa", "#c084fc", "#e879f9"][i]}
          animate={{ y: [14, 10, 14] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </motion.svg>
  );
}
