"use client";

import type { CSSProperties, ReactNode } from "react";
import type { BloomShapeKind } from "@/components/games/bloom-blast/levelsConfig";

type GlyphProps = {
  uid: string;
  fill: string;
  glow: string;
  svgProps: {
    className: string;
    viewBox: string;
    "aria-hidden": true;
    style: CSSProperties;
  };
};

/** High-quality modern crystal icons for Group 3 Master Champions. */
export function renderGroup3Glyph(
  shape: BloomShapeKind,
  { uid, fill, glow, svgProps }: GlyphProps,
): ReactNode | null {
  if (shape === "earth_planet") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-earth`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill={`url(#${uid}-earth)`} stroke={glow} strokeWidth="2.2" />
        <path
          d="M14 26 C22 22 30 24 36 20 C42 28 48 30 50 36 C44 40 36 38 30 42 C24 36 18 34 14 26 Z"
          fill="#22c55e"
          opacity="0.9"
        />
        <path
          d="M20 40 C26 44 34 46 42 44"
          fill="none"
          stroke="#86efac"
          strokeWidth="2"
          opacity="0.7"
        />
        <circle cx="24" cy="22" r="3" fill="#fff" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "saturn") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-sat`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
        </defs>
        <ellipse
          cx="32"
          cy="34"
          rx="28"
          ry="7"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3.5"
          opacity="0.95"
          transform="rotate(-18 32 34)"
        />
        <ellipse
          cx="32"
          cy="34"
          rx="28"
          ry="7"
          fill="none"
          stroke="#fef3c7"
          strokeWidth="1.2"
          opacity="0.7"
          transform="rotate(-18 32 34)"
        />
        <circle cx="32" cy="32" r="14" fill={`url(#${uid}-sat)`} stroke={glow} strokeWidth="2" />
        <ellipse cx="28" cy="28" rx="4" ry="2.5" fill="#fff" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "shooting_star") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-shoot`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={fill} stopOpacity="0.15" />
            <stop offset="70%" stopColor={glow} />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
        </defs>
        <path
          d="M8 52 L36 28"
          stroke={`url(#${uid}-shoot)`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M12 48 L34 30"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M40 18 L44 28 L54 30 L46 36 L48 46 L40 40 L32 46 L34 36 L26 30 L36 28 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shape === "rain_cloud") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-rc`} x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor={fill} />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="26" rx="12" ry="10" fill={`url(#${uid}-rc)`} />
        <ellipse cx="40" cy="24" rx="14" ry="12" fill={`url(#${uid}-rc)`} stroke={glow} strokeWidth="1.5" />
        <ellipse cx="32" cy="30" rx="18" ry="12" fill={`url(#${uid}-rc)`} stroke={glow} strokeWidth="2" />
        <path d="M20 42 L18 52" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 44 L26 54" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M36 42 L34 52" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M44 44 L42 54" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "roots") {
    return (
      <svg {...svgProps}>
        <path d="M28 8 L36 8 L34 22 L30 22 Z" fill="#15803d" stroke={glow} strokeWidth="1.5" />
        <path
          d="M32 22 C28 30 18 36 14 48 M32 22 C36 32 46 38 50 50 M32 24 C30 34 32 42 30 54 M32 24 C34 36 38 44 42 54"
          fill="none"
          stroke={fill}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M24 34 C20 40 16 46 12 52 M40 36 C44 42 48 48 52 54"
          fill="none"
          stroke={glow}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    );
  }

  if (shape === "petal") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-pet`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="32"
            cy="20"
            rx="9"
            ry="14"
            fill={`url(#${uid}-pet)`}
            stroke={glow}
            strokeWidth="1.4"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
        <circle cx="32" cy="32" r="7" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "stem_plant") {
    return (
      <svg {...svgProps}>
        <path
          d="M32 56 L32 18"
          stroke={fill}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M32 28 C22 24 16 20 12 14"
          fill="none"
          stroke="#86efac"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M32 36 C42 32 48 28 52 22"
          fill="none"
          stroke="#4ade80"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="14" cy="14" rx="8" ry="5" fill="#22c55e" stroke={glow} strokeWidth="1.5" transform="rotate(-30 14 14)" />
        <ellipse cx="50" cy="22" rx="8" ry="5" fill="#16a34a" stroke={glow} strokeWidth="1.5" transform="rotate(30 50 22)" />
        <circle cx="32" cy="14" r="5" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "human") {
    return (
      <svg {...svgProps}>
        <circle cx="32" cy="14" r="9" fill={fill} stroke={glow} strokeWidth="2" />
        <path
          d="M18 56 L22 28 L42 28 L46 56 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M22 34 L12 44 M42 34 L52 44" stroke={glow} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "fish") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-fish`} x1="0" y1="0.3" x2="1" y2="0.7">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <ellipse cx="30" cy="32" rx="18" ry="12" fill={`url(#${uid}-fish)`} stroke={glow} strokeWidth="2" />
        <path d="M46 32 L58 22 L56 32 L58 42 Z" fill={fill} stroke={glow} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="22" cy="30" r="2.5" fill="#0f172a" />
        <circle cx="21" cy="29" r="1" fill="#fff" />
        <path d="M30 24 L34 20 M30 40 L34 44" stroke={glow} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "rock") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-rock`} x1="0.2" y1="0.1" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#e7e5e4" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor="#44403c" />
          </linearGradient>
        </defs>
        <path
          d="M12 40 L18 22 L34 16 L50 24 L54 42 L40 52 L20 50 Z"
          fill={`url(#${uid}-rock)`}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M22 30 L30 26 L36 34" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "book") {
    return (
      <svg {...svgProps}>
        <path
          d="M12 16 L32 12 L32 52 L12 54 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M52 16 L32 12 L32 52 L52 54 Z"
          fill={glow}
          stroke={fill}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <path d="M32 12 L32 52" stroke="#0f172a" strokeWidth="2" opacity="0.35" />
        <path d="M18 24 L26 22 M18 32 L26 30 M18 40 L26 38" stroke="#fff" strokeWidth="1.5" opacity="0.5" />
      </svg>
    );
  }

  if (shape === "ice_cube") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-ice`} x1="0.2" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path
          d="M16 24 L32 14 L48 24 L48 44 L32 54 L16 44 Z"
          fill={`url(#${uid}-ice)`}
          stroke={glow}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M16 24 L32 34 L48 24 M32 34 L32 54" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.55" />
      </svg>
    );
  }

  if (shape === "wood_block") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>
        <rect x="14" y="16" width="36" height="36" rx="4" fill={`url(#${uid}-wood)`} stroke={glow} strokeWidth="2.2" />
        <path d="M14 28 H50 M14 40 H50" stroke="#78350f" strokeWidth="1.5" opacity="0.45" />
        <path d="M24 16 V52 M38 16 V52" stroke="#92400e" strokeWidth="1.2" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "water_splash") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-wat`} cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>
        <path
          d="M32 10 C32 10 14 30 14 40 C14 50 22 56 32 56 C42 56 50 50 50 40 C50 30 32 10 32 10 Z"
          fill={`url(#${uid}-wat)`}
          stroke={glow}
          strokeWidth="2.2"
        />
        <ellipse cx="26" cy="34" rx="4" ry="6" fill="#fff" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "juice_bottle" || shape === "milk_bottle") {
    const liquid = shape === "milk_bottle" ? "#f8fafc" : fill;
    return (
      <svg {...svgProps}>
        <rect x="26" y="8" width="12" height="10" rx="2" fill="#94a3b8" stroke={glow} strokeWidth="1.5" />
        <path
          d="M20 20 L44 20 L42 54 C42 58 22 58 22 54 Z"
          fill={liquid}
          stroke={glow}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <rect x="24" y="28" width="16" height="18" rx="2" fill="#fff" opacity="0.25" />
        <ellipse cx="32" cy="18" rx="10" ry="3" fill="#64748b" opacity="0.5" />
      </svg>
    );
  }

  if (shape === "steam" || shape === "smoke") {
    return (
      <svg {...svgProps}>
        <ellipse cx="22" cy="40" rx="10" ry="8" fill={fill} opacity="0.55" />
        <ellipse cx="36" cy="36" rx="12" ry="10" fill={fill} opacity="0.7" stroke={glow} strokeWidth="1.5" />
        <ellipse cx="28" cy="24" rx="11" ry="9" fill={glow} opacity="0.65" />
        <ellipse cx="40" cy="18" rx="9" ry="7" fill="#fff" opacity="0.55" />
        <ellipse cx="24" cy="14" rx="7" ry="6" fill="#fff" opacity="0.4" />
      </svg>
    );
  }

  if (shape === "helium_balloon") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-bal`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="26" rx="16" ry="20" fill={`url(#${uid}-bal)`} stroke={glow} strokeWidth="2.2" />
        <path d="M32 46 L28 50 L32 48 L36 50 Z" fill={fill} stroke={glow} strokeWidth="1.2" />
        <path d="M32 50 C30 56 34 58 32 62" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="26" cy="20" rx="4" ry="6" fill="#fff" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "word_gem") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-gem`} x1="0.2" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path
          d="M32 6 L52 20 L46 48 L18 48 L12 20 Z"
          fill={`url(#${uid}-gem)`}
          stroke={glow}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M32 6 L32 48 M12 20 L52 20 M18 48 L32 20 L46 48" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "math_bubble") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-bub`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="28" r="22" fill={`url(#${uid}-bub)`} stroke={glow} strokeWidth="2.4" />
        <ellipse cx="24" cy="20" rx="6" ry="4" fill="#fff" opacity="0.45" />
        <path
          d="M32 50 C28 56 30 60 32 62 C34 60 36 56 32 50 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="1.5"
        />
        <circle cx="32" cy="28" r="14" fill="#fff" opacity="0.18" />
      </svg>
    );
  }

  return null;
}

export const GROUP3_SHAPES = new Set<BloomShapeKind>([
  "earth_planet",
  "saturn",
  "shooting_star",
  "rain_cloud",
  "roots",
  "petal",
  "stem_plant",
  "human",
  "fish",
  "rock",
  "book",
  "ice_cube",
  "wood_block",
  "water_splash",
  "juice_bottle",
  "milk_bottle",
  "steam",
  "helium_balloon",
  "smoke",
  "word_gem",
  "math_bubble",
]);
