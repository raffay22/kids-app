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

  if (category === "objects") {
    return (
      <motion.svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        <motion.rect
          x="8"
          y="12"
          width="24"
          height="18"
          rx="4"
          fill="#f59e0b"
          animate={{ y: [12, 10, 12] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <rect x="14" y="8" width="12" height="5" rx="2" fill="#fbbf24" />
        <circle cx="16" cy="21" r="2.2" fill="#fff7ed" />
        <circle cx="24" cy="21" r="2.2" fill="#fff7ed" />
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

  if (category === "pronouns") {
    return (
      <motion.svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        <motion.circle
          cx="14"
          cy="16"
          r="6"
          fill="#fb7185"
          animate={{ cx: [14, 15, 14] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="26"
          cy="16"
          r="6"
          fill="#f472b6"
          animate={{ cx: [26, 25, 26] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <path
          d="M10 28 Q20 34 30 28"
          stroke="#be123c"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>
    );
  }

  if (category === "adjectives") {
    return (
      <motion.svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        <motion.polygon
          points="20,4 24.5,14.5 36,15.5 27,23 29.8,34.5 20,28.2 10.2,34.5 13,23 4,15.5 15.5,14.5"
          fill="#14b8a6"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "20px 20px" }}
        />
        <circle cx="20" cy="20" r="5" fill="#ccfbf1" />
      </motion.svg>
    );
  }

  if (category === "vowels_consonants") {
    return (
      <motion.svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        <motion.circle
          cx="14"
          cy="20"
          r="9"
          fill="#6366f1"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="21"
          y="11"
          width="14"
          height="18"
          rx="4"
          fill="#f59e0b"
          animate={{ y: [11, 13, 11] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="14" cy="20" r="3.5" fill="#e0e7ff" />
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
