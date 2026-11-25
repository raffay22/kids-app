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

/** Crystal-style fruit / veggie / vehicle icons for Group 2. */
export function renderGroup2Glyph(
  shape: BloomShapeKind,
  { uid, fill, glow, svgProps }: GlyphProps,
): ReactNode | null {
  const stroke = { stroke: glow, strokeWidth: 2 as const };

  if (shape === "apple") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-ap`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <path
          d="M32 18 C20 18 12 28 12 40 C12 52 20 58 32 58 C44 58 52 52 52 40 C52 28 44 18 32 18 Z"
          fill={`url(#${uid}-ap)`}
          {...stroke}
        />
        <path d="M32 18 C32 12 36 8 40 6" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="38" cy="14" rx="6" ry="3" fill="#22c55e" opacity="0.9" />
      </svg>
    );
  }

  if (shape === "banana") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-ban`} x1="0.2" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Classic curved crescent banana (not a triangle flag) */}
        <path
          d="M18 48
             C16 36 20 24 30 16
             C36 12 44 12 50 16
             C46 18 42 22 40 28
             C38 36 38 44 42 50
             C34 54 24 54 18 48 Z"
          fill={`url(#${uid}-ban)`}
          {...stroke}
          strokeLinejoin="round"
        />
        {/* Stem tip */}
        <path
          d="M48 14 C52 12 54 10 55 8"
          fill="none"
          stroke="#854d0e"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Inner ridge */}
        <path
          d="M24 44 C26 34 30 26 38 20"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          opacity="0.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (shape === "strawberry") {
    return (
      <svg {...svgProps}>
        <path
          d="M32 56 C18 46 12 34 14 24 C16 16 24 14 32 18 C40 14 48 16 50 24 C52 34 46 46 32 56 Z"
          fill={fill}
          {...stroke}
        />
        <path d="M22 16 L32 8 L42 16" fill="#16a34a" stroke="#166534" strokeWidth="1.5" />
        {[
          [24, 28],
          [32, 26],
          [40, 28],
          [26, 36],
          [34, 38],
          [30, 46],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#fff" opacity="0.85" />
        ))}
      </svg>
    );
  }

  if (shape === "orange_fruit" || shape === "peach" || shape === "lemon") {
    const squash = shape === "lemon" ? 0.85 : 1;
    return (
      <svg {...svgProps}>
        <ellipse
          cx="32"
          cy="34"
          rx={20 * squash}
          ry={18}
          fill={fill}
          {...stroke}
        />
        <path d="M32 16 C34 12 38 10 40 8" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="28" r="4" fill="#fff" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "grapes") {
    return (
      <svg {...svgProps}>
        <circle cx="28" cy="28" r="8" fill={fill} {...stroke} />
        <circle cx="40" cy="28" r="8" fill={fill} {...stroke} />
        <circle cx="34" cy="38" r="8" fill={fill} {...stroke} />
        <circle cx="24" cy="40" r="7" fill={fill} {...stroke} />
        <circle cx="42" cy="40" r="7" fill={fill} {...stroke} />
        <path d="M34 20 L34 10 L40 8" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "watermelon") {
    return (
      <svg {...svgProps}>
        <path
          d="M10 40 A22 22 0 0 1 54 40 L32 56 Z"
          fill={fill}
          {...stroke}
          strokeLinejoin="round"
        />
        <path d="M14 40 A18 18 0 0 1 50 40" fill="#fb7185" opacity="0.9" />
        <circle cx="24" cy="44" r="1.5" fill="#111" />
        <circle cx="32" cy="46" r="1.5" fill="#111" />
        <circle cx="40" cy="44" r="1.5" fill="#111" />
      </svg>
    );
  }

  if (shape === "mango") {
    return (
      <svg {...svgProps}>
        <path
          d="M28 12 C18 18 14 30 18 42 C22 52 34 58 44 52 C52 46 52 32 46 22 C40 12 32 10 28 12 Z"
          fill={fill}
          {...stroke}
        />
        <path d="M30 14 C34 10 40 8 44 10" fill="none" stroke="#166534" strokeWidth="2" />
      </svg>
    );
  }

  if (shape === "pear") {
    return (
      <svg {...svgProps}>
        <path
          d="M32 12 C26 12 24 20 26 26 C18 30 14 40 18 48 C22 56 42 56 46 48 C50 40 46 30 38 26 C40 20 38 12 32 12 Z"
          fill={fill}
          {...stroke}
        />
        <path d="M32 12 L34 6" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "cherry") {
    return (
      <svg {...svgProps}>
        <circle cx="24" cy="40" r="10" fill={fill} {...stroke} />
        <circle cx="42" cy="38" r="10" fill={fill} {...stroke} />
        <path d="M24 30 C28 18 36 12 42 10" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 28 C40 18 40 12 42 10" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "pineapple") {
    return (
      <svg {...svgProps}>
        <path d="M22 10 L32 4 L42 10 L36 18 L28 18 Z" fill="#16a34a" stroke="#166534" strokeWidth="1.5" />
        <ellipse cx="32" cy="38" rx="14" ry="18" fill={fill} {...stroke} />
        <path d="M22 30 L42 46 M22 46 L42 30 M32 20 L32 56" stroke={glow} strokeWidth="1.5" opacity="0.5" />
      </svg>
    );
  }

  if (shape === "kiwi") {
    return (
      <svg {...svgProps}>
        <ellipse cx="32" cy="34" rx="20" ry="16" fill={fill} {...stroke} />
        <ellipse cx="32" cy="34" rx="12" ry="9" fill="#fef9c3" opacity="0.95" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <circle
              key={deg}
              cx={32 + Math.cos(rad) * 7}
              cy={34 + Math.sin(rad) * 5}
              r="1.2"
              fill="#713f12"
            />
          );
        })}
      </svg>
    );
  }

  if (shape === "blueberry") {
    return (
      <svg {...svgProps}>
        <circle cx="24" cy="34" r="10" fill={fill} {...stroke} />
        <circle cx="40" cy="32" r="11" fill={fill} {...stroke} />
        <circle cx="32" cy="44" r="9" fill={fill} {...stroke} />
        <circle cx="36" cy="26" r="2" fill="#fff" opacity="0.4" />
      </svg>
    );
  }

  if (shape === "carrot") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-car`} x1="0.25" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Leafy green tops */}
        <path
          d="M28 20 C22 14 18 8 20 4 C24 8 28 12 30 18"
          fill="#22c55e"
          stroke="#166534"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M32 18 C32 10 34 4 36 2 C36 8 34 14 34 18"
          fill="#4ade80"
          stroke="#166534"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M36 20 C42 14 46 8 44 4 C40 8 38 12 36 18"
          fill="#16a34a"
          stroke="#166534"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Tapered carrot body */}
        <path
          d="M24 20
             C22 28 24 40 30 54
             C31 56 33 56 34 54
             C40 40 42 28 40 20
             C36 18 28 18 24 20 Z"
          fill={`url(#${uid}-car)`}
          {...stroke}
          strokeLinejoin="round"
        />
        {/* Ridges */}
        <path
          d="M26 28 Q32 30 38 28 M27 38 Q32 40 37 38 M29 46 Q32 48 35 46"
          fill="none"
          stroke="#c2410c"
          strokeWidth="1.4"
          opacity="0.45"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (shape === "broccoli") {
    return (
      <svg {...svgProps}>
        <rect x="28" y="36" width="8" height="16" rx="2" fill="#a3e635" stroke={glow} strokeWidth="1.5" />
        <circle cx="24" cy="28" r="10" fill={fill} {...stroke} />
        <circle cx="40" cy="28" r="10" fill={fill} {...stroke} />
        <circle cx="32" cy="20" r="11" fill={fill} {...stroke} />
      </svg>
    );
  }

  if (shape === "tomato" || shape === "radish") {
    return (
      <svg {...svgProps}>
        <circle cx="32" cy="36" r="16" fill={fill} {...stroke} />
        <path d="M24 22 L32 16 L40 22 L32 26 Z" fill="#16a34a" stroke="#166534" strokeWidth="1.5" />
        <circle cx="26" cy="30" r="3" fill="#fff" opacity="0.35" />
      </svg>
    );
  }

  if (shape === "corn") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-corn`} x1="0.3" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Green husk leaves behind the cob */}
        <path
          d="M18 28 C12 36 14 50 22 56 L28 48 C22 42 20 34 22 28 Z"
          fill="#16a34a"
          stroke="#166534"
          strokeWidth="1.5"
        />
        <path
          d="M46 28 C52 36 50 50 42 56 L36 48 C42 42 44 34 42 28 Z"
          fill="#22c55e"
          stroke="#166534"
          strokeWidth="1.5"
        />
        {/* Ear of corn — pointed cob */}
        <path
          d="M32 8
             C38 10 44 18 44 30
             C44 44 40 54 32 58
             C24 54 20 44 20 30
             C20 18 26 10 32 8 Z"
          fill={`url(#${uid}-corn)`}
          {...stroke}
          strokeLinejoin="round"
        />
        {/* Kernel rows */}
        {[22, 28, 34, 40, 46].map((y, row) =>
          [24, 32, 40].map((x, col) => (
            <ellipse
              key={`${x}-${y}`}
              cx={x + (row % 2 === 0 ? 0 : 2)}
              cy={y}
              rx="3.2"
              ry="2.4"
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth="0.8"
              opacity="0.95"
            />
          )),
        )}
        {/* Top husk tip */}
        <path
          d="M28 12 C30 4 34 4 36 12"
          fill="#4ade80"
          stroke="#166534"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (shape === "peas") {
    return (
      <svg {...svgProps}>
        <path
          d="M14 36 C18 20 46 20 50 36 C46 48 18 48 14 36 Z"
          fill="#86efac"
          stroke={glow}
          strokeWidth="2"
        />
        <circle cx="24" cy="34" r="5" fill={fill} {...stroke} />
        <circle cx="34" cy="34" r="5" fill={fill} {...stroke} />
        <circle cx="44" cy="34" r="5" fill={fill} {...stroke} />
      </svg>
    );
  }

  if (shape === "pumpkin") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-pump`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.65" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </radialGradient>
        </defs>
        {/* Round pumpkin body with clear lobes */}
        <ellipse cx="18" cy="38" rx="11" ry="15" fill={`url(#${uid}-pump)`} {...stroke} />
        <ellipse cx="46" cy="38" rx="11" ry="15" fill={`url(#${uid}-pump)`} {...stroke} />
        <ellipse cx="32" cy="36" rx="16" ry="18" fill={`url(#${uid}-pump)`} {...stroke} />
        {/* Rib lines */}
        <path
          d="M24 24 Q26 36 24 50 M32 20 Q32 36 32 54 M40 24 Q38 36 40 50"
          fill="none"
          stroke="#c2410c"
          strokeWidth="1.6"
          opacity="0.4"
          strokeLinecap="round"
        />
        {/* Curved stem */}
        <path
          d="M30 22 C30 14 34 10 40 8"
          fill="none"
          stroke="#166534"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Leaf */}
        <path
          d="M36 14 C42 10 48 12 50 16 C44 18 40 18 36 16 Z"
          fill="#22c55e"
          stroke="#166534"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (shape === "cucumber") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-cuke`} x1="0.15" y1="0.3" x2="0.9" y2="0.7">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Long slim cucumber — no stripes */}
        <path
          d="M6 32
             C8 26 16 24 32 24
             C48 24 56 26 58 32
             C56 38 48 40 32 40
             C16 40 8 38 6 32 Z"
          fill={`url(#${uid}-cuke)`}
          {...stroke}
          strokeLinejoin="round"
        />
        {/* Soft bumps */}
        {[
          [14, 30],
          [24, 29],
          [34, 31],
          [44, 29],
          [52, 31],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="#bbf7d0" opacity="0.55" />
        ))}
      </svg>
    );
  }

  if (shape === "potato") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-pot`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="50%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.95" />
          </radialGradient>
        </defs>
        {/* Lumpy potato silhouette */}
        <path
          d="M14 36
             C12 26 18 18 28 16
             C36 14 44 18 50 24
             C56 30 54 42 46 48
             C38 54 24 54 18 46
             C12 40 14 36 14 36 Z"
          fill={`url(#${uid}-pot)`}
          {...stroke}
          strokeLinejoin="round"
        />
        {/* Potato eyes */}
        <ellipse cx="24" cy="28" rx="3" ry="2" fill="#713f12" opacity="0.55" />
        <ellipse cx="38" cy="26" rx="2.5" ry="1.8" fill="#713f12" opacity="0.5" />
        <ellipse cx="32" cy="40" rx="3.2" ry="2.2" fill="#713f12" opacity="0.55" />
        <ellipse cx="44" cy="38" rx="2.2" ry="1.6" fill="#713f12" opacity="0.45" />
        {/* Soft highlight */}
        <ellipse cx="26" cy="24" rx="5" ry="3" fill="#fff" opacity="0.25" />
      </svg>
    );
  }

  if (shape === "onion") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-oni`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#f5e1ff" stopOpacity="0.95" />
            <stop offset="35%" stopColor={fill} />
            <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        {/* Dried stem tuft (classic onion top) */}
        <path
          d="M28 18 L24 6 M30 16 L30 4 M34 16 L36 4 M36 18 L42 8"
          fill="none"
          stroke="#a16207"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Teardrop bulb — fat middle, pointed top, flat bottom */}
        <path
          d="M32 16
             C24 18 16 28 15 38
             C14 48 20 54 32 55
             C44 54 50 48 49 38
             C48 28 40 18 32 16 Z"
          fill={`url(#${uid}-oni)`}
          stroke={glow}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Concentric skin rings (read as onion layers) */}
        <ellipse
          cx="32"
          cy="36"
          rx="12"
          ry="14"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          opacity="0.4"
        />
        <ellipse
          cx="32"
          cy="38"
          rx="7"
          ry="9"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          opacity="0.35"
        />
        <ellipse
          cx="32"
          cy="40"
          rx="3"
          ry="4"
          fill="none"
          stroke="#fff"
          strokeWidth="1.2"
          opacity="0.35"
        />
        {/* Root whiskers */}
        <path
          d="M26 55 L24 61 M30 55 L29 62 M34 55 L35 62 M38 55 L40 61"
          stroke="#854d0e"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (shape === "cabbage") {
    return (
      <svg {...svgProps}>
        <defs>
          <radialGradient id={`${uid}-cab`} cx="42%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ecfccb" stopOpacity="0.95" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor="#365314" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        {/* Outer ruffled leaves (side flaps) */}
        <path
          d="M18 22
             C8 26 4 36 8 46
             C12 54 22 56 26 50
             C20 44 16 34 18 22 Z"
          fill="#86efac"
          stroke="#166534"
          strokeWidth="1.8"
        />
        <path
          d="M46 22
             C56 26 60 36 56 46
             C52 54 42 56 38 50
             C44 44 48 34 46 22 Z"
          fill="#bef264"
          stroke="#166534"
          strokeWidth="1.8"
        />
        {/* Bottom ruffle */}
        <path
          d="M16 44
             C20 56 28 60 32 58
             C36 60 44 56 48 44
             C40 50 24 50 16 44 Z"
          fill="#65a30d"
          stroke="#166534"
          strokeWidth="1.6"
        />
        {/* Main round head */}
        <circle
          cx="32"
          cy="32"
          r="17"
          fill={`url(#${uid}-cab)`}
          stroke="#166534"
          strokeWidth="2.2"
        />
        {/* Nested leaf wraps — cabbage layers */}
        <path
          d="M18 30
             C22 18 42 18 46 30
             C42 24 22 24 18 30 Z"
          fill="#a3e635"
          stroke="#166534"
          strokeWidth="1.4"
          opacity="0.9"
        />
        <path
          d="M20 36
             C24 26 40 26 44 36
             C40 30 24 30 20 36 Z"
          fill="#d9f99d"
          stroke="#166534"
          strokeWidth="1.2"
          opacity="0.85"
        />
        {/* Center heart */}
        <ellipse
          cx="32"
          cy="34"
          rx="6"
          ry="7"
          fill="#ecfccb"
          stroke="#166534"
          strokeWidth="1.2"
        />
        {/* Leaf veins */}
        <path
          d="M32 20 L32 40 M24 28 Q32 32 40 28 M22 36 Q32 40 42 36"
          fill="none"
          stroke="#3f6212"
          strokeWidth="1.3"
          opacity="0.55"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (shape === "spinach") {
    return (
      <svg {...svgProps}>
        <ellipse cx="32" cy="34" rx="20" ry="16" fill={fill} {...stroke} />
        <path d="M18 34 Q32 20 46 34 Q32 48 18 34" fill="none" stroke={glow} strokeWidth="2" />
        <path d="M32 20 L32 48" stroke={glow} strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  }

  if (shape === "pepper") {
    return (
      <svg {...svgProps}>
        <path
          d="M26 18 C18 22 16 36 20 48 C24 56 40 56 44 48 C48 36 46 22 38 18 C36 14 28 14 26 18 Z"
          fill={fill}
          {...stroke}
        />
        <path d="M30 16 L34 8 L38 14" fill="#16a34a" stroke="#166534" strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "eggplant") {
    return (
      <svg {...svgProps}>
        <path
          d="M30 14 C20 18 14 30 16 42 C18 54 30 58 40 52 C50 46 52 30 46 20 C42 14 34 12 30 14 Z"
          fill={fill}
          {...stroke}
        />
        <path d="M30 14 L28 8 L36 10" fill="#16a34a" stroke="#166534" strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "car" || shape === "taxi") {
    return (
      <svg {...svgProps}>
        <rect x="10" y="30" width="44" height="16" rx="4" fill={fill} {...stroke} />
        <path d="M18 30 L24 18 L40 18 L46 30 Z" fill={fill} {...stroke} strokeLinejoin="round" />
        <circle cx="20" cy="48" r="5" fill="#1e293b" />
        <circle cx="44" cy="48" r="5" fill="#1e293b" />
        {shape === "taxi" && (
          <rect x="28" y="22" width="8" height="4" rx="1" fill="#fff" opacity="0.9" />
        )}
      </svg>
    );
  }

  if (shape === "airplane") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-plane`} x1="0" y1="0.3" x2="1" y2="0.7">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Main wings — clear left/right stretch */}
        <path
          d="M28 30 L6 22 L4 26 L28 36 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M28 34 L6 48 L10 50 L32 38 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Fuselage body */}
        <ellipse
          cx="34"
          cy="32"
          rx="22"
          ry="7"
          fill={`url(#${uid}-plane)`}
          stroke={glow}
          strokeWidth="2"
        />
        {/* Nose */}
        <path
          d="M52 32 L60 30 L60 34 Z"
          fill={glow}
          stroke={glow}
          strokeWidth="1"
        />
        {/* Cockpit windows */}
        <ellipse cx="48" cy="30" rx="4" ry="2.5" fill="#e0f2fe" opacity="0.95" />
        <rect x="28" y="28" width="5" height="3.5" rx="0.8" fill="#e0f2fe" opacity="0.9" />
        <rect x="36" y="28" width="5" height="3.5" rx="0.8" fill="#e0f2fe" opacity="0.9" />
        {/* Tail fin */}
        <path
          d="M16 32 L8 18 L14 18 L22 30 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M16 32 L10 42 L14 42 L22 34 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shape === "rocket") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-rok`} x1="0.3" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="40%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Side fins */}
        <path
          d="M22 40 L10 54 L22 50 Z"
          fill={glow}
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M42 40 L54 54 L42 50 Z"
          fill={glow}
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Tall cylinder body */}
        <rect
          x="22"
          y="16"
          width="20"
          height="34"
          rx="4"
          fill={`url(#${uid}-rok)`}
          stroke={glow}
          strokeWidth="2"
        />
        {/* Nose cone */}
        <path
          d="M22 18 L32 4 L42 18 Z"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Window */}
        <circle cx="32" cy="28" r="5" fill="#e0f2fe" stroke="#1e293b" strokeWidth="1.5" />
        <circle cx="30" cy="26" r="1.5" fill="#fff" opacity="0.8" />
        {/* Body stripe */}
        <rect x="22" y="38" width="20" height="4" fill="#fff" opacity="0.35" />
        {/* Exhaust flames */}
        <path d="M26 50 L28 60 L32 54 L36 60 L38 50 Z" fill="#f97316" />
        <path d="M29 50 L32 58 L35 50 Z" fill="#fde047" />
      </svg>
    );
  }

  if (shape === "train") {
    return (
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-trn`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.65" />
            <stop offset="45%" stopColor={fill} />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Long thin passenger car behind */}
        <rect
          x="2"
          y="28"
          width="22"
          height="14"
          rx="2"
          fill={fill}
          stroke={glow}
          strokeWidth="1.8"
          opacity="0.9"
        />
        <rect x="5" y="31" width="5" height="5" rx="0.8" fill="#e0f2fe" />
        <rect x="13" y="31" width="5" height="5" rx="0.8" fill="#e0f2fe" />
        {/* Coupler */}
        <rect x="22" y="33" width="5" height="3" fill="#64748b" />
        {/* Long thin engine */}
        <rect
          x="26"
          y="24"
          width="30"
          height="18"
          rx="3"
          fill={`url(#${uid}-trn)`}
          stroke={glow}
          strokeWidth="2"
        />
        {/* Cabin front */}
        <rect
          x="48"
          y="16"
          width="12"
          height="26"
          rx="2"
          fill={fill}
          stroke={glow}
          strokeWidth="2"
        />
        {/* Windows row */}
        <rect x="30" y="28" width="5" height="6" rx="0.8" fill="#e0f2fe" />
        <rect x="38" y="28" width="5" height="6" rx="0.8" fill="#e0f2fe" />
        <rect x="51" y="20" width="6" height="8" rx="1" fill="#e0f2fe" />
        {/* Chimney (choo-choo) */}
        <rect x="34" y="10" width="6" height="14" rx="1" fill="#334155" />
        <ellipse cx="37" cy="10" rx="5" ry="2.5" fill="#64748b" />
        {/* Smoke puffs */}
        <circle cx="34" cy="6" r="2.5" fill="#cbd5e1" opacity="0.8" />
        <circle cx="28" cy="4" r="3" fill="#e2e8f0" opacity="0.7" />
        {/* Cowcatcher / nose */}
        <path
          d="M60 30 L64 42 L60 42 Z"
          fill="#fbbf24"
          stroke="#b45309"
          strokeWidth="1"
        />
        {/* Wheels — many small ones for a long train */}
        <circle cx="10" cy="46" r="3.5" fill="#1e293b" />
        <circle cx="18" cy="46" r="3.5" fill="#1e293b" />
        <circle cx="32" cy="46" r="4" fill="#1e293b" />
        <circle cx="42" cy="46" r="4" fill="#1e293b" />
        <circle cx="54" cy="46" r="4" fill="#1e293b" />
      </svg>
    );
  }

  if (shape === "boat") {
    return (
      <svg {...svgProps}>
        <path d="M10 40 L54 40 L46 52 L18 52 Z" fill={fill} {...stroke} strokeLinejoin="round" />
        <path d="M32 40 L32 14 L48 40 Z" fill="#e2e8f0" stroke={glow} strokeWidth="2" />
      </svg>
    );
  }

  if (shape === "bicycle" || shape === "scooter") {
    return (
      <svg {...svgProps}>
        <circle cx="18" cy="42" r="10" fill="none" stroke={glow} strokeWidth="3" />
        <circle cx="46" cy="42" r="10" fill="none" stroke={glow} strokeWidth="3" />
        <path d="M18 42 L30 24 L42 42 M30 24 L30 16" stroke={fill} strokeWidth="3" strokeLinecap="round" fill="none" />
        {shape === "scooter" ? (
          <path d="M30 24 L46 42" stroke={fill} strokeWidth="3" />
        ) : (
          <path d="M30 24 L46 42 M24 42 L36 30" stroke={fill} strokeWidth="2.5" fill="none" />
        )}
      </svg>
    );
  }

  if (shape === "bus" || shape === "truck") {
    return (
      <svg {...svgProps}>
        <rect x="8" y="22" width={shape === "truck" ? 28 : 48} height="22" rx="3" fill={fill} {...stroke} />
        {shape === "truck" && (
          <rect x="36" y="28" width="18" height="16" rx="2" fill={fill} {...stroke} />
        )}
        <rect x="14" y="26" width="10" height="8" rx="1" fill="#e2e8f0" />
        {shape === "bus" && <rect x="28" y="26" width="10" height="8" rx="1" fill="#e2e8f0" />}
        <circle cx="18" cy="48" r="5" fill="#1e293b" />
        <circle cx="44" cy="48" r="5" fill="#1e293b" />
      </svg>
    );
  }

  if (shape === "helicopter") {
    return (
      <svg {...svgProps}>
        <rect x="18" y="30" width="28" height="14" rx="6" fill={fill} {...stroke} />
        <path d="M8 28 L56 28" stroke={glow} strokeWidth="3" strokeLinecap="round" />
        <path d="M46 36 L56 40" stroke={glow} strokeWidth="3" strokeLinecap="round" />
        <circle cx="26" cy="48" r="4" fill="#1e293b" />
        <circle cx="38" cy="48" r="4" fill="#1e293b" />
      </svg>
    );
  }

  if (shape === "submarine") {
    return (
      <svg {...svgProps}>
        <ellipse cx="32" cy="36" rx="24" ry="12" fill={fill} {...stroke} />
        <rect x="28" y="18" width="10" height="12" rx="2" fill={fill} {...stroke} />
        <circle cx="44" cy="34" r="3" fill="#e2e8f0" />
        <path d="M8 36 L2 32 M8 36 L2 40" stroke={glow} strokeWidth="2" />
      </svg>
    );
  }

  return null;
}

export const GROUP2_SHAPES = new Set<BloomShapeKind>([
  "apple",
  "banana",
  "strawberry",
  "orange_fruit",
  "grapes",
  "watermelon",
  "mango",
  "pear",
  "cherry",
  "pineapple",
  "kiwi",
  "peach",
  "lemon",
  "blueberry",
  "carrot",
  "broccoli",
  "tomato",
  "corn",
  "peas",
  "pumpkin",
  "cucumber",
  "potato",
  "onion",
  "cabbage",
  "spinach",
  "pepper",
  "radish",
  "eggplant",
  "car",
  "airplane",
  "rocket",
  "train",
  "boat",
  "bicycle",
  "bus",
  "truck",
  "helicopter",
  "scooter",
  "submarine",
  "taxi",
]);
