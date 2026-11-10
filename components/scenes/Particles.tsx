"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";

type ParticlesProps = {
  color?: string;
};

/**
 * Soft ambient sparkle ring drifting behind the hero illustration — a loose
 * halo of small vector stars orbiting near the frame edge, not scattered
 * randomly across the whole card. Pure SVG, no raster sprites.
 */
export default function Particles({ color = "#fbbf24" }: ParticlesProps) {
  const uid = useId();
  const items = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * 2 * Math.PI + 0.3;
        const radius = 42; // percent from center
        return {
          id: `${uid}-${i}`,
          left: 50 + Math.cos(angle) * radius,
          top: 50 + Math.sin(angle) * radius,
          delay: i * 0.35,
          duration: 3.2 + (i % 3) * 0.5,
          scale: 0.55 + (i % 3) * 0.15,
        };
      }),
    [uid],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((p) => (
        <motion.svg
          key={p.id}
          viewBox="0 0 20 20"
          width={13 * p.scale}
          height={13 * p.scale}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.75, 0], scale: [0.7, 1, 0.7] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        >
          <path d="M10 0 L12.5 7 L20 7.5 L14 12.5 L16 20 L10 15.5 L4 20 L6 12.5 L0 7.5 L7.5 7Z" fill={color} />
        </motion.svg>
      ))}
    </div>
  );
}
