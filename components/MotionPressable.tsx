"use client";

import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";

type MotionPressableProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "button" | "div";
  ariaLabel?: string;
};

const springTransition = { type: "spring" as const, stiffness: 400, damping: 22 };

export default function MotionPressable({
  children,
  className = "",
  onClick,
  as = "button",
  ariaLabel,
}: MotionPressableProps) {
  const handleTap = () => {
    triggerHaptic(30);
    onClick?.();
  };

  if (as === "div") {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={springTransition}
        onClick={handleTap}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleTap();
          }
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={springTransition}
      onClick={handleTap}
      className={className}
    >
      {children}
    </motion.button>
  );
}
