"use client";

import { motion } from "framer-motion";
import { WORD_EMOJI } from "@/utils/wordSearch";

type TargetWordTrayProps = {
  words: string[];
  found: string[];
};

export default function TargetWordTray({ words, found }: TargetWordTrayProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {words.map((word) => {
        const isFound = found.includes(word);
        return (
          <motion.div
            key={word}
            layout
            animate={isFound ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.4, times: [0, 0.4, 1] }}
            className={`relative flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 shadow-sm ${
              isFound
                ? "border-rose-300 bg-rose-50"
                : "border-amber-900/20 bg-[#FFF8E7]"
            }`}
          >
            <span className="text-base" aria-hidden>
              {WORD_EMOJI[word] ?? (isFound ? "✨" : "🔖")}
            </span>
            <span
              className={`relative text-sm font-extrabold tracking-wide text-slate-800 ${
                isFound ? "text-rose-800" : ""
              }`}
            >
              {word}
              {isFound && (
                <span
                  aria-hidden
                  className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rotate-[-6deg] rounded-full bg-rose-500/90"
                />
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
