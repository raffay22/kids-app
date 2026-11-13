"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { MemoryCardData } from "@/utils/memoryGame";

type MemoryCardProps = {
  card: MemoryCardData;
  flipped: boolean;
  matched: boolean;
  mismatched: boolean;
  disabled: boolean;
  onFlip: () => void;
};

/**
 * Both faces stay mounted. No rotateY / backfaceVisibility on the video layer —
 * Chromium often paints blank media inside 3D CSS flips.
 */
export default function MemoryCard({
  card,
  flipped,
  matched,
  mismatched,
  disabled,
  onFlip,
}: MemoryCardProps) {
  const showFace = flipped || matched;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [card.videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;

    // Warm-load even while face-down so the first flip is not blank.
    video.load();
    if (showFace) {
      video.currentTime = 0;
      void video.play().catch(() => setVideoFailed(true));
    } else {
      video.pause();
    }
  }, [showFace, videoFailed, card.videoSrc]);

  return (
    <button
      type="button"
      aria-label={
        showFace
          ? `${card.letter} is for ${card.word}`
          : "Flip memory card"
      }
      disabled={disabled || matched}
      onClick={onFlip}
      className="relative block w-full focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
    >
      <span className="block w-full pb-[100%]" aria-hidden />

      <motion.div
        className="absolute inset-0"
        animate={{
          x: mismatched ? [-6, 6, -6, 0] : 0,
          scale: matched ? [1, 1.07, 1] : showFace ? 1.02 : 1,
        }}
        transition={{
          x: { duration: 0.35, ease: "easeInOut" },
          // Multi-keyframe bounce must be tween — springs only allow 2 frames.
          scale: matched
            ? { type: "tween", duration: 0.4, times: [0, 0.4, 1], ease: "easeOut" }
            : { type: "spring", stiffness: 420, damping: 16 },
        }}
      >
        {/* FACE — phonics video (always in DOM, toggled with opacity) */}
        <div
          className={`absolute inset-0 overflow-hidden rounded-3xl border-4 border-white bg-sky-100 shadow-xl transition-opacity duration-200 ${
            matched
              ? "ring-4 ring-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.65)]"
              : "ring-2 ring-sky-200/80"
          } ${showFace ? "z-20 opacity-100" : "z-0 opacity-0"}`}
          aria-hidden={!showFace}
        >
          {!videoFailed ? (
            <video
              ref={videoRef}
              src={card.videoSrc}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              loop
              preload="auto"
              onLoadedData={() => {
                if (showFace) void videoRef.current?.play().catch(() => undefined);
              }}
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 to-amber-100 px-2">
              <p className="text-5xl font-black text-sky-800">{card.letter}</p>
              <p className="mt-1 text-lg font-bold text-amber-800">{card.word}</p>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-900/80 to-transparent px-2 pb-2 pt-8 text-center">
            <p className="text-lg font-black text-white drop-shadow sm:text-xl">{card.letter}</p>
            <p className="truncate text-xs font-bold text-amber-100 sm:text-sm">{card.word}</p>
          </div>
        </div>

        {/* BACK — star (covers face until flipped) */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-sky-200 via-white to-amber-100 shadow-xl transition-opacity duration-200 ${
            mismatched ? "ring-4 ring-rose-300/70" : "ring-2 ring-sky-200/80"
          } ${showFace ? "z-0 opacity-0" : "z-20 opacity-100"}`}
          aria-hidden={showFace}
        >
          <span
            className="text-5xl drop-shadow-[0_0_14px_rgba(251,191,36,0.95)] sm:text-6xl"
            aria-hidden
          >
            ⭐️
          </span>
        </div>
      </motion.div>
    </button>
  );
}
