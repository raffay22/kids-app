"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type FlashcardActionVideoProps = {
  videoSrc: string;
  posterSrc?: string;
  alt: string;
  celebrate?: boolean;
  className?: string;
};

/** Short muted looping 3D action clip for verb flashcards. */
export default function FlashcardActionVideo({
  videoSrc,
  posterSrc,
  alt,
  celebrate = false,
  className = "",
}: FlashcardActionVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }, [videoSrc]);

  return (
    <motion.div
      className={`relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-[1.75rem] border-4 border-white bg-emerald-50 shadow-xl ${className}`}
      animate={celebrate ? { scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] } : { scale: 1 }}
      transition={{ duration: 0.55 }}
    >
      {!videoFailed ? (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          poster={posterSrc}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label={alt}
          onError={() => setVideoFailed(true)}
        />
      ) : posterSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt={alt}
          className="h-full w-full object-cover"
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
