"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FlashcardStillImageProps = {
  src: string;
  alt: string;
  celebrate?: boolean;
  className?: string;
};

/**
 * Clean 3D still for noun/object flashcards (no SVG, no video).
 */
export default function FlashcardStillImage({
  src,
  alt,
  celebrate = false,
  className = "",
}: FlashcardStillImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.div
      className={`relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-[1.75rem] border-4 border-white bg-sky-50 shadow-xl ${className}`}
      animate={celebrate ? { scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] } : { scale: 1 }}
      transition={{ duration: 0.55 }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-sky-100 px-4 text-center">
          <p className="text-2xl font-extrabold text-sky-800">{alt}</p>
        </div>
      )}
    </motion.div>
  );
}
