"use client";

import { useId } from "react";
import type {
  BloomShapeKind,
  BloomTileSize,
} from "@/components/games/bloom-blast/levelsConfig";
import {
  GROUP2_SHAPES,
  renderGroup2Glyph,
} from "@/components/games/bloom-blast/Group2Glyphs";
import {
  GROUP3_SHAPES,
  renderGroup3Glyph,
} from "@/components/games/bloom-blast/Group3Glyphs";

/** Crystal 3D-ish glyph inside a garden box. */
export default function ShapeGlyph({
  shape,
  fill,
  glow,
  size = "big",
  sizeLabel,
}: {
  shape: BloomShapeKind;
  fill: string;
  glow: string;
  size?: BloomTileSize;
  /** Level 4 rotate word — TALL / TINY look different from BIG / SMALL */
  sizeLabel?: string;
}) {
  const uid = useId().replace(/:/g, "");
  /**
   * Level 4 teaching: kids learn by SEEING contrast, not reading tags.
   * `size` = this tile (big vs small). `sizeLabel` = learning mode only.
   * NEVER draw every tile as SHORT just because the round is “Blast SHORT”.
   * Tall tiles stay tall beside short tiles so kids can compare.
   */
  const mode = (sizeLabel || "").toUpperCase();
  const isBigTile = size === "big";
  let scaleClass = isBigTile
    ? "h-[58%] w-[58%] max-h-14 max-w-14"
    : "h-[28%] w-[28%] max-h-7 max-w-7 opacity-95";

  if (mode === "TALL" || mode === "SHORT") {
    // Pair on board: clearly TALL vs clearly SHORT
    scaleClass = isBigTile
      ? "h-[88%] w-[42%] max-h-[4.25rem] max-w-11"
      : "h-[32%] w-[55%] max-h-8 max-w-14 opacity-95";
  } else if (mode === "FAT" || mode === "THIN") {
    scaleClass = isBigTile
      ? "h-[48%] w-[78%] max-h-12 max-w-[4.5rem]"
      : "h-[55%] w-[28%] max-h-14 max-w-7 opacity-95";
  } else if (mode === "TINY") {
    scaleClass = isBigTile
      ? "h-[62%] w-[62%] max-h-14 max-w-14"
      : "h-[16%] w-[16%] max-h-4 max-w-4 opacity-95";
  } else if (mode === "BIG" || mode === "SMALL") {
    scaleClass = isBigTile
      ? "h-[70%] w-[70%] max-h-16 max-w-16"
      : "h-[24%] w-[24%] max-h-6 max-w-6 opacity-95";
  }
  // Levels 1–3: sizeLabel undefined → default big/small above

  const common = {
    filter: `drop-shadow(0 4px 6px rgba(15,23,42,0.35)) drop-shadow(0 0 10px ${glow}88)`,
  };

  const svgProps = {
    className: scaleClass,
    viewBox: "0 0 64 64",
    "aria-hidden": true as const,
    style: common,
  };

  if (GROUP2_SHAPES.has(shape)) {
    const g2 = renderGroup2Glyph(shape, { uid, fill, glow, svgProps });
    if (g2) return g2;
  }

  if (GROUP3_SHAPES.has(shape)) {
    const g3 = renderGroup3Glyph(shape, { uid, fill, glow, svgProps });
    if (g3) return g3;
  }

  if (shape === "circle") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-circ`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="24"
          fill={`url(#${uid}-circ)`}
          stroke={glow}
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  if (shape === "square") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-sq`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect
          x="12"
          y="12"
          width="40"
          height="40"
          rx="8"
          fill={`url(#${uid}-sq)`}
          stroke={glow}
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  if (shape === "triangle") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-tri`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="55%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          d="M32 10 L54 50 L10 50 Z"
          fill={`url(#${uid}-tri)`}
          stroke={glow}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shape === "star") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-star`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <path
          d="M32 6 L38.5 24 L58 24 L42 36 L48 54 L32 43 L16 54 L22 36 L6 24 L25.5 24 Z"
          fill={`url(#${uid}-star)`}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shape === "heart") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-heart`} cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <path
          d="M32 52 C32 52 8 36 8 22 C8 14 14 10 20 10 C26 10 30 14 32 18 C34 14 38 10 44 10 C50 10 56 14 56 22 C56 36 32 52 32 52 Z"
          fill={`url(#${uid}-heart)`}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shape === "oval") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-oval`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <ellipse
          cx="32"
          cy="32"
          rx="18"
          ry="26"
          fill={`url(#${uid}-oval)`}
          stroke={glow}
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  if (shape === "sun") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-sun`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 32 + Math.cos(rad) * 28;
          const y2 = 32 + Math.sin(rad) * 28;
          return (
            <line
              key={deg}
              x1={32 + Math.cos(rad) * 16}
              y1={32 + Math.sin(rad) * 16}
              x2={x2}
              y2={y2}
              stroke={glow}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        <circle
          cx="32"
          cy="32"
          r="12"
          fill={`url(#${uid}-sun)`}
          stroke={glow}
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (shape === "moon") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-moon`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="55%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        {/* Tilt like a crescent in the night sky (not standing upright) */}
        <g transform="rotate(-28 32 32)">
          <path
            d="M38 10 C22 12 12 26 14 42 C16 54 28 60 40 58 C28 56 20 44 22 32 C24 20 32 12 38 10 Z"
            fill={`url(#${uid}-moon)`}
            stroke={glow}
            strokeWidth="2"
          />
        </g>
      </svg>
    );
  }

  if (shape === "flower") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-fl`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </radialGradient>
        </defs>
        {[0, 72, 144, 216, 288].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 32 + Math.cos(rad) * 12;
          const cy = 32 + Math.sin(rad) * 12;
          return (
            <circle
              key={deg}
              cx={cx}
              cy={cy}
              r="9"
              fill={`url(#${uid}-fl)`}
              stroke={glow}
              strokeWidth="1.5"
            />
          );
        })}
        <circle cx="32" cy="32" r="7" fill="#fde047" stroke={glow} strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "tree") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-tree`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect x="28" y="40" width="8" height="14" rx="2" fill="#92400e" />
        <path
          d="M32 8 L48 36 L16 36 Z"
          fill={`url(#${uid}-tree)`}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M32 18 L46 42 L18 42 Z"
          fill={`url(#${uid}-tree)`}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>
    );
  }

  if (shape === "leaf") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-leaf`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          d="M32 8 C48 18 52 36 32 56 C12 36 16 18 32 8 Z"
          fill={`url(#${uid}-leaf)`}
          stroke={glow}
          strokeWidth="2"
        />
        <path
          d="M32 14 L32 50"
          stroke={glow}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    );
  }

  if (shape === "bamboo") {
    // Tall thin stalks — clear “tiny bamboo” vs “big bamboo” for Level 4 TINY
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-bam`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor="#3f6212" />
          </linearGradient>
        </defs>
        {[18, 32, 46].map((x) => (
          <g key={x}>
            <rect
              x={x - 3}
              y="8"
              width="6"
              height="46"
              rx="2"
              fill={`url(#${uid}-bam)`}
              stroke={glow}
              strokeWidth="1.5"
            />
            <line x1={x - 3} y1="20" x2={x + 3} y2="20" stroke={glow} strokeWidth="1.5" />
            <line x1={x - 3} y1="34" x2={x + 3} y2="34" stroke={glow} strokeWidth="1.5" />
            <path
              d={`M${x + 2} 14 Q${x + 12} 10 ${x + 10} 4`}
              fill="none"
              stroke="#86efac"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    );
  }

  if (shape === "cloud") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-cloud`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="70%" stopColor={fill} />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
        </defs>
        <ellipse cx="24" cy="36" rx="14" ry="10" fill={`url(#${uid}-cloud)`} stroke={glow} strokeWidth="1.5" />
        <ellipse cx="38" cy="34" rx="16" ry="12" fill={`url(#${uid}-cloud)`} stroke={glow} strokeWidth="1.5" />
        <ellipse cx="30" cy="28" rx="11" ry="9" fill={`url(#${uid}-cloud)`} stroke={glow} strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "rainbow") {
    return (
      <svg {...svgProps}>
        <path d="M10 48 A22 22 0 0 1 54 48" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <path d="M14 48 A18 18 0 0 1 50 48" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        <path d="M18 48 A14 14 0 0 1 46 48" fill="none" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
        <path d="M22 48 A10 10 0 0 1 42 48" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 48 A6 6 0 0 1 38 48" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
        <path d="M28 48 A4 4 0 0 1 36 48" fill="none" stroke={fill} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "bird") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-bird`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <ellipse cx="30" cy="34" rx="14" ry="10" fill={`url(#${uid}-bird)`} stroke={glow} strokeWidth="2" />
        <path d="M40 30 L54 22 L44 36 Z" fill={fill} stroke={glow} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M18 32 L6 26 L16 38 Z" fill={fill} stroke={glow} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="36" cy="30" r="2.2" fill="#0f172a" />
        <path d="M42 34 L48 36" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "mountain") {
    // Classic twin peaks + snow — reads clearly as “mountain” for toddlers
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-mt-rock`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#a8b5c4" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor="#3f4a3a" />
          </linearGradient>
          <linearGradient id={`${uid}-mt-green`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        {/* Back peak */}
        <path
          d="M6 52 L22 18 L34 40 L40 30 L58 52 Z"
          fill={`url(#${uid}-mt-rock)`}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Front green foothill */}
        <path
          d="M4 52 L18 34 L28 46 L38 28 L52 44 L60 52 Z"
          fill={`url(#${uid}-mt-green)`}
          stroke={glow}
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.95"
        />
        {/* Snow caps */}
        <path
          d="M22 18 L27 28 L17 28 Z"
          fill="#fff"
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M40 30 L44 38 L36 38 Z"
          fill="#fff"
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shape === "boy") {
    return (
      <svg {...svgProps}>
        <circle cx="32" cy="14" r="8" fill={fill} stroke={glow} strokeWidth="2" />
        <path
          d="M20 56 L24 28 L40 28 L44 56 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M24 34 L14 48" stroke={glow} strokeWidth="3" strokeLinecap="round" />
        <path d="M40 34 L50 48" stroke={glow} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "girl") {
    return (
      <svg {...svgProps}>
        <circle cx="32" cy="14" r="8" fill={fill} stroke={glow} strokeWidth="2" />
        <path
          d="M32 26 L48 56 L16 56 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M24 34 L14 44" stroke={glow} strokeWidth="3" strokeLinecap="round" />
        <path d="M40 34 L50 44" stroke={glow} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "house") {
    return (
      <svg {...svgProps}>
        <path
          d="M8 30 L32 10 L56 30"
          fill="none"
          stroke={glow}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M12 30 L12 54 L52 54 L52 30 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
        />
        <rect x="26" y="38" width="12" height="16" rx="1" fill="#fff7ed" stroke={glow} strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "building") {
    return (
      <svg {...svgProps}>
        <rect
          x="16"
          y="8"
          width="32"
          height="48"
          rx="2"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
        />
        {[18, 28, 38].map((y) =>
          [22, 32, 42].map((x) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="6"
              height="6"
              rx="0.5"
              fill="#e2e8f0"
              opacity="0.9"
            />
          )),
        )}
      </svg>
    );
  }

  if (shape === "chair") {
    return (
      <svg {...svgProps}>
        <path
          d="M18 28 L46 28 L46 36 L18 36 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
        />
        <path d="M18 28 L18 14 L28 14" fill="none" stroke={glow} strokeWidth="3" strokeLinecap="round" />
        <path d="M20 36 L20 52" stroke={glow} strokeWidth="3" strokeLinecap="round" />
        <path d="M44 36 L44 52" stroke={glow} strokeWidth="3" strokeLinecap="round" />
        <path d="M28 36 L28 48" stroke={glow} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "bug") {
    return (
      <svg {...svgProps}>
        <ellipse cx="32" cy="34" rx="16" ry="12" fill={fill} stroke={glow} strokeWidth="2" />
        <circle cx="32" cy="20" r="8" fill={fill} stroke={glow} strokeWidth="2" />
        <path d="M26 14 L22 6" stroke={glow} strokeWidth="2" strokeLinecap="round" />
        <path d="M38 14 L42 6" stroke={glow} strokeWidth="2" strokeLinecap="round" />
        <path d="M16 34 L8 30" stroke={glow} strokeWidth="2" strokeLinecap="round" />
        <path d="M48 34 L56 30" stroke={glow} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "seed") {
    return (
      <svg {...svgProps}>
        <ellipse
          cx="32"
          cy="34"
          rx="12"
          ry="18"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
        />
        <path d="M32 18 L32 50" stroke={glow} strokeWidth="2" opacity="0.7" />
      </svg>
    );
  }

  if (shape === "button") {
    return (
      <svg {...svgProps}>
        <circle cx="32" cy="32" r="20" fill={fill} stroke={glow} strokeWidth="2.5" />
        <circle cx="26" cy="28" r="3" fill="#fff" opacity="0.9" />
        <circle cx="38" cy="28" r="3" fill="#fff" opacity="0.9" />
        <circle cx="26" cy="38" r="3" fill="#fff" opacity="0.9" />
        <circle cx="38" cy="38" r="3" fill="#fff" opacity="0.9" />
      </svg>
    );
  }

  // diamond
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id={`${uid}-dia`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="50%" stopColor={fill} />
          <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d="M32 6 L56 32 L32 58 L8 32 Z"
        fill={`url(#${uid}-dia)`}
        stroke={glow}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
