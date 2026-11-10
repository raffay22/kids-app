"use client";

import { useId } from "react";

export type KidPose = "run" | "drink" | "eat" | "jump" | "sleep";

type KidCharacterProps = {
  pose: KidPose;
  size: number;
};

const POSE_SHIRT: Record<KidPose, [string, string]> = {
  run: ["#60a5fa", "#2563eb"],
  drink: ["#2dd4bf", "#0f766e"],
  eat: ["#fb923c", "#c2410c"],
  jump: ["#c084fc", "#7c3aed"],
  sleep: ["#a5b4fc", "#6366f1"],
};

/** Static pose illustrations for action verbs — no looping motion. */
export default function KidCharacter({ pose, size }: KidCharacterProps) {
  const uid = useId().replace(/[:]/g, "");
  const [shirtA, shirtB] = POSE_SHIRT[pose];
  const skinId = `skin-${uid}`;
  const shirtId = `shirt-${uid}`;

  const isSleep = pose === "sleep";
  const isJump = pose === "jump";
  const isRun = pose === "run";
  const isDrink = pose === "drink";
  const isEat = pose === "eat";

  return (
    <svg viewBox="0 0 220 220" width={size} height={size} role="img" aria-label={`Character ${pose}`}>
      <defs>
        <radialGradient id={skinId} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#ffe8cc" />
          <stop offset="100%" stopColor="#f0b27a" />
        </radialGradient>
        <linearGradient id={shirtId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shirtA} />
          <stop offset="100%" stopColor={shirtB} />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="198" rx={isJump || isRun ? 32 : 42} ry="8" fill="#0f172a" opacity="0.1" />

      {!isSleep && (
        <>
          <g transform={isRun ? "rotate(22 96 150)" : isJump ? "rotate(10 96 150)" : "rotate(4 96 150)"}>
            <path d="M88 148 C88 148 84 188 90 192 C96 196 104 190 102 184 C100 172 100 152 100 152Z" fill="#1e293b" />
            <ellipse cx="98" cy="194" rx="12" ry="6" fill="#0f172a" />
          </g>
          <g transform={isRun ? "rotate(-22 124 150)" : isJump ? "rotate(-10 124 150)" : "rotate(-4 124 150)"}>
            <path d="M120 148 C120 148 116 188 122 192 C128 196 136 190 134 184 C132 172 132 152 132 152Z" fill="#334155" />
            <ellipse cx="130" cy="194" rx="12" ry="6" fill="#0f172a" />
          </g>
        </>
      )}

      <ellipse cx="110" cy="128" rx="38" ry="36" fill={`url(#${shirtId})`} />
      {isSleep && <ellipse cx="110" cy="168" rx="34" ry="18" fill={`url(#${shirtId})`} />}

      <g transform={isRun ? "rotate(-28 72 110)" : isJump ? "rotate(-68 72 110)" : isDrink ? "rotate(-92 72 110)" : isEat ? "rotate(-62 72 110)" : "rotate(-12 72 110)"}>
        <path d="M72 108 C60 118 52 140 58 148 C64 156 74 148 76 138 C78 124 76 112 72 108Z" fill={`url(#${skinId})`} />
      </g>

      <g transform={isRun ? "rotate(28 148 110)" : isJump ? "rotate(68 148 110)" : "rotate(12 148 110)"}>
        <path d="M148 108 C160 118 168 140 162 148 C156 156 146 148 144 138 C142 124 144 112 148 108Z" fill={`url(#${skinId})`} />
      </g>

      {isDrink && (
        <g transform="translate(0 -2) rotate(-18 48 78)">
          <rect x="34" y="62" width="28" height="36" rx="6" fill="#7dd3fc" stroke="#0284c7" strokeWidth="3" />
          <rect x="38" y="76" width="20" height="14" rx="3" fill="#0ea5e9" />
        </g>
      )}

      {isEat && (
        <g transform="translate(0 -6)">
          <circle cx="48" cy="72" r="14" fill="#f87171" stroke="#b91c1c" strokeWidth="3" />
          <path d="M48 60 Q56 56 58 64" fill="#4ade80" />
        </g>
      )}

      <circle cx="110" cy="72" r="40" fill={`url(#${skinId})`} />
      <ellipse cx="88" cy="86" rx="9" ry="6" fill="#fb7185" opacity="0.45" />
      <ellipse cx="132" cy="86" rx="9" ry="6" fill="#fb7185" opacity="0.45" />

      <path d="M72 62 Q74 28 110 30 Q146 28 148 62 Q132 44 110 46 Q88 44 72 62 Z" fill="#3f2a1a" />
      <ellipse cx="92" cy="44" rx="10" ry="7" fill="#5a3a22" opacity="0.5" />

      {isSleep ? (
        <>
          <path d="M92 72 q8 -6 14 0" stroke="#3f2d1a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M114 72 q8 -6 14 0" stroke="#3f2d1a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <text x="152" y="30" fontSize="22" fontWeight="800" fill="#818cf8">
            z
          </text>
          <text x="166" y="18" fontSize="16" fontWeight="800" fill="#a5b4fc">
            z
          </text>
        </>
      ) : (
        <>
          <circle cx="98" cy="70" r="5.5" fill="#1e293b" />
          <circle cx="122" cy="70" r="5.5" fill="#1e293b" />
          <circle cx="96" cy="68" r="2" fill="#fff" />
          <circle cx="120" cy="68" r="2" fill="#fff" />
          <path d="M96 86 Q110 100 124 86" stroke="#9a3412" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )}
    </svg>
  );
}
