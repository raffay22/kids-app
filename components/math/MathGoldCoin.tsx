"use client";

import { motion, type PanInfo } from "framer-motion";
import { Coins } from "lucide-react";

export type PointerPoint = { x: number; y: number };

type MathGoldCoinProps = {
  id: string;
  spent?: boolean;
  glowing?: boolean;
  selected?: boolean;
  drag?: boolean;
  onDragEnd?: (point: PointerPoint) => void;
  onTap?: () => void;
  ariaLabel?: string;
  size?: "sm" | "md";
};

const SIZE = {
  sm: "h-11 w-11 text-xs",
  md: "h-14 w-14 text-sm",
};

function pointFromDrag(
  event: MouseEvent | TouchEvent | PointerEvent,
  info: PanInfo,
): PointerPoint {
  if ("changedTouches" in event && event.changedTouches?.[0]) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }
  if ("clientX" in event && Number.isFinite(event.clientX)) {
    return { x: event.clientX, y: event.clientY };
  }
  return { x: info.point.x, y: info.point.y };
}

/** Matches /games/coin-shop gold coin tray style — CSS only, no new rasters. */
export default function MathGoldCoin({
  id,
  spent = false,
  glowing = false,
  selected = false,
  drag = false,
  onDragEnd,
  onTap,
  ariaLabel = "Gold coin",
  size = "md",
}: MathGoldCoinProps) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={spent}
      drag={drag && !spent}
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.18}
      onDragEnd={(event, info) => onDragEnd?.(pointFromDrag(event, info))}
      onClick={onTap}
      animate={{
        scale: glowing ? [1, 1.12, 1] : selected ? 1.08 : 1,
        boxShadow: glowing
          ? [
              "0 0 0 0 rgba(251,191,36,0.0)",
              "0 0 0 10px rgba(251,191,36,0.35)",
              "0 0 0 4px rgba(251,191,36,0.2)",
            ]
          : selected
            ? "0 0 0 4px rgba(59,130,246,0.45)"
            : "0 10px 18px rgba(0,0,0,0.12)",
      }}
      transition={{
        scale: { duration: 0.9, repeat: glowing ? Infinity : 0 },
        boxShadow: { duration: 0.9, repeat: glowing ? Infinity : 0 },
      }}
      whileDrag={{ scale: 1.15, zIndex: 40 }}
      whileTap={{ scale: 0.92 }}
      className={`relative flex cursor-grab items-center justify-center rounded-full border-b-4 font-black active:cursor-grabbing ${SIZE[size]} ${
        spent
          ? "border-amber-200 bg-amber-100 text-amber-300"
          : selected
            ? "border-sky-500 bg-gradient-to-b from-yellow-200 via-amber-300 to-amber-500 text-amber-950 ring-4 ring-sky-200"
            : "border-amber-600 bg-gradient-to-b from-yellow-200 via-amber-300 to-amber-500 text-amber-950"
      }`}
      data-coin-id={id}
    >
      <Coins className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1 h-2 rounded-full bg-white/50"
      />
    </motion.button>
  );
}
