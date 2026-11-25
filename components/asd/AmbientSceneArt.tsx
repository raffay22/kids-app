"use client";

import { CloudRain, Droplets, Sun, Trees, Wind } from "lucide-react";
import type { AmbientKind } from "@/utils/asdAudio";

/**
 * Bright vector “3D-feel” scene art for each ambient sound.
 * Lucide + SVG gradients only — no JPG/PNG rasters (ASD hub rule).
 */
export default function AmbientSceneArt({
  kind,
}: {
  kind: AmbientKind | null;
}) {
  if (kind === "rain") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-slate-200 to-emerald-100" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="rainCloud" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="70" rx="70" ry="36" fill="url(#rainCloud)" opacity="0.95" />
          <ellipse cx="170" cy="62" rx="55" ry="30" fill="#cbd5e1" opacity="0.9" />
          <ellipse cx="280" cy="78" rx="80" ry="38" fill="url(#rainCloud)" opacity="0.95" />
          {Array.from({ length: 18 }).map((_, i) => (
            <line
              key={i}
              x1={40 + i * 20}
              y1={100 + (i % 3) * 8}
              x2={32 + i * 20}
              y2={160 + (i % 4) * 12}
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.45"
            />
          ))}
          <ellipse cx="200" cy="270" rx="160" ry="28" fill="#86efac" opacity="0.55" />
        </svg>
        <CloudRain className="absolute left-1/2 top-[38%] h-28 w-28 -translate-x-1/2 text-sky-600/80 drop-shadow-lg sm:h-36 sm:w-36" strokeWidth={1.5} />
      </div>
    );
  }

  if (kind === "ocean") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-cyan-200 to-teal-300" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <circle cx="320" cy="60" r="36" fill="#fde047" opacity="0.95" />
          <path d="M0 180 Q100 150 200 180 T400 180 V300 H0 Z" fill="#22d3ee" opacity="0.55" />
          <path d="M0 200 Q120 170 220 205 T400 195 V300 H0 Z" fill="#06b6d4" opacity="0.5" />
          <path d="M0 230 Q140 210 240 235 T400 225 V300 H0 Z" fill="#0891b2" opacity="0.45" />
          <ellipse cx="70" cy="250" rx="40" ry="14" fill="#fef3c7" opacity="0.7" />
        </svg>
        <Sun className="absolute right-[12%] top-[10%] h-14 w-14 text-yellow-400 drop-shadow-md sm:h-16 sm:w-16" strokeWidth={1.6} />
        <Droplets className="absolute left-1/2 top-[42%] h-28 w-28 -translate-x-1/2 text-cyan-700/75 drop-shadow-lg sm:h-36 sm:w-36" strokeWidth={1.5} />
      </div>
    );
  }

  if (kind === "wind") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-lime-100 via-emerald-100 to-sky-200" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <path d="M0 210 Q100 180 200 210 T400 200 V300 H0 Z" fill="#86efac" opacity="0.7" />
          <path d="M0 240 Q150 220 250 245 T400 235 V300 H0 Z" fill="#4ade80" opacity="0.55" />
          {Array.from({ length: 10 }).map((_, i) => (
            <path
              key={i}
              d={`M${30 + i * 36} ${90 + (i % 3) * 20} q20 -8 40 0`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              opacity="0.5"
            />
          ))}
        </svg>
        <Trees className="absolute bottom-[18%] left-[12%] h-20 w-20 text-emerald-700/70 drop-shadow-md sm:h-24 sm:w-24" strokeWidth={1.5} />
        <Wind className="absolute left-1/2 top-[36%] h-28 w-28 -translate-x-1/2 text-emerald-600/80 drop-shadow-lg sm:h-36 sm:w-36" strokeWidth={1.5} />
      </div>
    );
  }

  // Default calm pond
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-violet-100 via-sky-100 to-cyan-100" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="200" cy="210" rx="150" ry="50" fill="#67e8f9" opacity="0.45" />
        <ellipse cx="200" cy="210" rx="110" ry="34" fill="#a5f3fc" opacity="0.5" />
        <circle cx="80" cy="70" r="28" fill="#fde68a" opacity="0.85" />
      </svg>
      <Droplets className="absolute left-1/2 top-[40%] h-24 w-24 -translate-x-1/2 text-violet-400/70 drop-shadow-md sm:h-32 sm:w-32" strokeWidth={1.5} />
    </div>
  );
}
