"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAnimationLoopController } from "@/hooks/useAnimationLoopController";

type FlashcardActionVideoProps = {
  videoSrc: string;
  posterSrc?: string;
  alt: string;
  celebrate?: boolean;
  className?: string;
};

/** Short muted 3D action clip — loops capped by sensory prefs (max 3 / or static). */
export default function FlashcardActionVideo({
  videoSrc,
  posterSrc,
  alt,
  celebrate = false,
  className = "",
}: FlashcardActionVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const { reducedMotion, frozen, bindVideo, onLoopOrEnded } =
    useAnimationLoopController(videoSrc);

  useEffect(() => {
    setVideoFailed(false);
  }, [videoSrc]);

  useEffect(() => {
    return bindVideo(videoRef.current);
  }, [bindVideo, videoSrc, reducedMotion]);

  const usePosterOnly = reducedMotion || videoFailed || (frozen && Boolean(posterSrc));

  return (
    <motion.div
      className={`relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-[1.75rem] border-4 border-white bg-emerald-50 shadow-xl ${className}`}
      animate={
        celebrate && !reducedMotion
          ? { scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] }
          : { scale: 1 }
      }
      transition={{ duration: 0.55 }}
    >
      {!usePosterOnly ? (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          poster={posterSrc}
          className="h-full w-full object-cover"
          muted
          playsInline
          autoPlay
          preload="metadata"
          aria-label={alt}
          onEnded={() => onLoopOrEnded(videoRef.current)}
          onError={() => setVideoFailed(true)}
        />
      ) : posterSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt={alt}
          className={`h-full w-full object-cover ${
            reducedMotion ? "contrast-125" : ""
          }`}
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-emerald-100 px-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-800">{alt}</p>
        </div>
      )}
    </motion.div>
  );
}
