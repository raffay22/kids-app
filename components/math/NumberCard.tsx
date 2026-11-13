"use client";

import { motion } from "framer-motion";

type NumberCardProps = {
  value: number;
  celebrate?: boolean;
  wiggle?: boolean;
  wrongFlash?: boolean;
  locked?: boolean;
  onPick: () => void;
};

export default function NumberCard({
  value,
  celebrate = false,
  wiggle = false,
  wrongFlash = false,
  locked = false,
  onPick,
}: NumberCardProps) {
  return (
    <motion.button
      type="button"
      aria-label={`Choose number ${value}`}
      disabled={locked}
      onClick={onPick}
      animate={{
        scale: celebrate ? [1, 1.25, 1] : 1,
        x: wiggle ? [-5, 5, -5, 0] : 0,
      }}
      transition={{
        scale: celebrate
          ? { type: "tween", duration: 0.45, times: [0, 0.4, 1] }
          : { type: "spring", stiffness: 420, damping: 16 },
        x: { duration: 0.35 },
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93, y: 4 }}
      className={`relative flex h-20 w-20 items-center justify-center rounded-[1.4rem] border-4 border-b-8 text-3xl font-black shadow-[0_14px_26px_rgba(0,0,0,0.12),inset_0_2px_0_rgba(255,255,255,0.7)] sm:h-24 sm:w-24 sm:text-4xl ${
        wrongFlash
          ? "border-rose-300 bg-rose-100/90 text-rose-700"
          : "border-indigo-200 bg-gradient-to-br from-white via-violet-50 to-sky-100 text-indigo-800"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-2 h-1/3 rounded-full bg-white/45"
      />
      <span className="relative z-[1]">{value}</span>
    </motion.button>
  );
}
