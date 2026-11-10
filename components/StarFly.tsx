"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";

type StarFlyProps = {
  /** Increment this counter to fire a new +10 star pop-up */
  trigger: number;
  amount?: number;
};

/**
 * Floating "+10 ★" pop-up that springs up toward the star counter
 * in the header whenever `trigger` changes.
 */
export default function StarFly({ trigger, amount = 10 }: StarFlyProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex justify-center">
      <AnimatePresence>
        {trigger > 0 && (
          <motion.div
            key={trigger}
            initial={{ opacity: 0, y: 40, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -180, scale: [0.5, 1.4, 1.2, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-3 text-2xl font-bold text-amber-900 shadow-xl"
          >
            <Star className="h-7 w-7 fill-amber-900 text-amber-900" aria-hidden />
            +{amount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
