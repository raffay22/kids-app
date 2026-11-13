"use client";

import { motion } from "framer-motion";
import {
  LOGIC_OBJECTS,
  type LogicObjectId,
} from "@/utils/logicPuzzles";

type LogicObjectCardProps = {
  objectId: LogicObjectId | "mystery";
  size?: "sm" | "md" | "lg" | "xl";
  selected?: boolean;
  celebrate?: boolean;
  wiggle?: boolean;
  dim?: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  interactive?: boolean;
};

const SIZES = {
  sm: "h-16 w-16 text-3xl sm:h-20 sm:w-20 sm:text-4xl",
  md: "h-24 w-24 text-5xl sm:h-28 sm:w-28 sm:text-6xl",
  lg: "h-28 w-28 text-6xl sm:h-32 sm:w-32 sm:text-7xl",
  xl: "h-36 w-36 text-7xl sm:h-44 sm:w-44 sm:text-8xl",
};

export default function LogicObjectCard({
  objectId,
  size = "md",
  selected = false,
  celebrate = false,
  wiggle = false,
  dim = false,
  onClick,
  className = "",
  ariaLabel,
  interactive = Boolean(onClick),
}: LogicObjectCardProps) {
  const visual =
    objectId === "mystery"
      ? null
      : LOGIC_OBJECTS[objectId];

  const body = (
    <motion.div
      animate={{
        x: wiggle ? [-6, 6, -6, 0] : 0,
        scale: celebrate ? [1, 1.2, 1] : selected ? 1.05 : 1,
      }}
      transition={{
        x: { duration: 0.35, ease: "easeInOut" },
        scale: celebrate
          ? { type: "tween", duration: 0.45, times: [0, 0.4, 1], ease: "easeOut" }
          : { type: "spring", stiffness: 420, damping: 18 },
      }}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.93, y: 4 } : undefined}
      className={`relative flex items-center justify-center rounded-[1.6rem] border-4 bg-gradient-to-br shadow-[0_15px_30px_rgba(0,0,0,0.12),inset_0_2px_0_rgba(255,255,255,0.65)] ${SIZES[size]} ${
        objectId === "mystery"
          ? "border-white from-indigo-200 via-violet-200 to-fuchsia-200"
          : `${visual?.rim ?? "border-white"} ${visual?.face ?? ""}`
      } ${selected ? "ring-4 ring-amber-300" : ""} ${
        wiggle ? "shadow-[0_0_0_6px_rgba(248,113,113,0.28)]" : ""
      } ${dim ? "opacity-55 grayscale-[0.2]" : ""} ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-2 h-1/3 rounded-full bg-white/35 blur-[1px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 bottom-2 h-2 rounded-full bg-black/10 blur-[2px]"
      />
      <span className="relative z-[1] drop-shadow-md">
        {objectId === "mystery" ? "❓" : visual?.emoji}
      </span>
    </motion.div>
  );

  if (!interactive) {
    return (
      <div aria-label={ariaLabel ?? visual?.label ?? "Mystery"} className="inline-flex">
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (visual ? `Choose ${visual.label}` : "Mystery card")}
      className="inline-flex focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
    >
      {body}
    </button>
  );
}
