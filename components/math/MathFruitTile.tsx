"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MATH_FRUITS, type MathFruitId } from "@/utils/mathLab";

type MathFruitTileProps = {
  fruit: MathFruitId;
  counted?: boolean;
  celebrate?: boolean;
  onTap?: () => void;
  ariaLabel: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "h-16 w-16 sm:h-20 sm:w-20",
  md: "h-20 w-20 sm:h-24 sm:w-24",
  lg: "h-24 w-24 sm:h-28 sm:w-28",
};

export default function MathFruitTile({
  fruit,
  counted = false,
  celebrate = false,
  onTap,
  ariaLabel,
  size = "md",
}: MathFruitTileProps) {
  const visual = MATH_FRUITS[fruit];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const video = videoRef.current;
    if (!video) return;
    video.load();
    void video.play().catch(() => setFailed(true));
  }, [visual.videoSrc]);

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={!onTap}
      onClick={onTap}
      animate={{
        scale: celebrate ? [1, 1.2, 1] : counted ? 1.06 : 1,
        y: celebrate ? [0, -10, 0] : 0,
      }}
      transition={{
        scale: celebrate
          ? { type: "tween", duration: 0.45, times: [0, 0.4, 1] }
          : { type: "spring", stiffness: 420, damping: 18 },
        y: { duration: 0.45 },
      }}
      whileTap={onTap ? { scale: 0.92, y: 3 } : undefined}
      className={`relative overflow-hidden rounded-[1.35rem] border-4 bg-gradient-to-br shadow-[0_12px_24px_rgba(0,0,0,0.12),inset_0_2px_0_rgba(255,255,255,0.65)] ${SIZE_CLASS[size]} ${visual.rim} ${visual.face} ${
        counted ? "ring-4 ring-amber-300" : ""
      } ${onTap ? "cursor-pointer" : "cursor-default"}`}
    >
      {!failed ? (
        <video
          ref={videoRef}
          src={visual.videoSrc}
          muted
          loop
          playsInline
          autoPlay
          aria-hidden
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="relative z-[1] text-4xl sm:text-5xl" aria-hidden>
          {visual.emoji}
        </span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1.5 h-1/3 rounded-full bg-white/30"
      />
    </motion.button>
  );
}
