"use client";

import { useId } from "react";
import { motion } from "framer-motion";

export type BadgeTheme =
  | "school"
  | "social"
  | "food"
  | "bedtime"
  | "outdoor"
  | "weather"
  | "family"
  | "celebration"
  | "safety"
  | "time"
  | "hygiene"
  | "sparkle";

const THEME_COLORS: Record<BadgeTheme, [string, string]> = {
  school: ["#a78bfa", "#7c3aed"],
  social: ["#fbbf24", "#f59e0b"],
  food: ["#fb923c", "#ea580c"],
  bedtime: ["#c4b5fd", "#8b5cf6"],
  outdoor: ["#4ade80", "#16a34a"],
  weather: ["#38bdf8", "#0284c7"],
  family: ["#fb7185", "#e11d48"],
  celebration: ["#f472b6", "#db2777"],
  safety: ["#fbbf24", "#d97706"],
  time: ["#38bdf8", "#6366f1"],
  hygiene: ["#5eead4", "#0d9488"],
  sparkle: ["#a78bfa", "#ec4899"],
};

/** Small vector glyph rendered inside each theme badge (pure SVG paths, no emoji/text glyphs). */
function ThemeGlyph({ theme }: { theme: BadgeTheme }) {
  switch (theme) {
    case "school":
      return <path d="M-20 4 L0 -10 L20 4 L0 18Z M-14 8 v14 M14 8 v14" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case "food":
      return <circle r="14" fill="#fff" opacity="0.9" />;
    case "bedtime":
      return <path d="M10 -14a18 18 0 1 0 0 30 14 14 0 1 1 0-30Z" fill="#fff" opacity="0.9" />;
    case "outdoor":
      return <path d="M0 -16 L18 12 L-18 12Z" fill="#fff" opacity="0.9" />;
    case "weather":
      return <ellipse rx="18" ry="10" fill="#fff" opacity="0.9" />;
    case "family":
      return (
        <>
          <circle cx="-8" cy="-4" r="7" fill="#fff" opacity="0.9" />
          <circle cx="8" cy="-4" r="7" fill="#fff" opacity="0.9" />
          <rect x="-16" y="4" width="32" height="12" rx="6" fill="#fff" opacity="0.9" />
        </>
      );
    case "celebration":
      return <path d="M0 -16 L4 -4 L16 -4 L6 4 L10 16 L0 8 L-10 16 L-6 4 L-16 -4 L-4 -4Z" fill="#fff" opacity="0.9" />;
    case "safety":
      return <path d="M0 -16 L14 -8 V6 Q14 16 0 20 Q-14 16 -14 6 V-8Z" fill="#fff" opacity="0.9" />;
    case "time":
      return (
        <>
          <circle r="15" fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
          <line x1="0" y1="0" x2="0" y2="-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="3" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "hygiene":
      return <path d="M0 -16 C10 -2 14 6 14 12a14 14 0 1 1-28 0c0-6 4-14 14-28Z" fill="#fff" opacity="0.9" />;
    case "social":
      return (
        <>
          <circle cx="-9" cy="-2" r="8" fill="#fff" opacity="0.9" />
          <circle cx="9" cy="-2" r="8" fill="#fff" opacity="0.9" />
        </>
      );
    default:
      return <path d="M0 -18 L5 -5 L18 -5 L7 3 L11 16 L0 8 L-11 16 L-7 3 L-18 -5 L-5 -5Z" fill="#fff" opacity="0.9" />;
  }
}

/**
 * Colorful rotating-ring badge used as the fallback illustration for long-tail
 * vocabulary (sentence/phonics words) that don't have a dedicated hand-drawn scene.
 * Fully vector, animated, zero emoji/raster.
 */
export function ThemeBadgeScene({ theme, size }: { theme: BadgeTheme; size: number }) {
  const uid = useId().replace(/[:]/g, "");
  const g = `badge-${uid}`;
  const [a, b] = THEME_COLORS[theme];

  return (
    <motion.svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={theme}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      <motion.circle
        cx="100"
        cy="100"
        r="82"
        fill="none"
        stroke={a}
        strokeWidth="6"
        strokeDasharray="14 12"
        opacity="0.5"
        style={{ transformOrigin: "100px 100px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        cx="100"
        cy="100"
        r="58"
        fill={`url(#${g})`}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 100px" }}
      />
      <g transform="translate(100 100)">
        <ThemeGlyph theme={theme} />
      </g>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={100 + Math.cos((i * 2 * Math.PI) / 3) * 82}
          cy={100 + Math.sin((i * 2 * Math.PI) / 3) * 82}
          r="6"
          fill={a}
          animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </motion.svg>
  );
}
