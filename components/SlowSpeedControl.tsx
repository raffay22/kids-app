"use client";

import { useKidsPlaybackSpeed } from "@/hooks/useKidsPlaybackSpeed";
import {
  KIDS_SLOW_SPEED_LABEL,
  type KidsSlowSpeed,
} from "@/utils/kidsPlaybackSpeed";
import { triggerHaptic } from "@/utils/haptics";

const OPTIONS: KidsSlowSpeed[] = ["normal", "slower", "slowest"];

type SlowSpeedControlProps = {
  /** Short label context, e.g. Phonics or Stories */
  label?: string;
  className?: string;
};

/** Slow-only speed picker for phonics + Under-3 stories (no fast). */
export default function SlowSpeedControl({
  label = "Voice speed",
  className = "",
}: SlowSpeedControlProps) {
  const { speed, ready, setSlowSpeed } = useKidsPlaybackSpeed();

  return (
    <section
      aria-label={label}
      className={`flex flex-col gap-2 rounded-3xl border-4 border-white/90 bg-white/85 p-3 shadow-lg ring-2 ring-sky-200/60 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0 text-left">
        <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-700">
          Slow only · no fast option
        </p>
      </div>
      <div
        className="grid grid-cols-3 gap-2 sm:w-72"
        role="group"
        aria-label="Choose slower playback"
      >
        {OPTIONS.map((option) => {
          const active = speed === option;
          return (
            <button
              key={option}
              type="button"
              disabled={!ready}
              aria-pressed={active}
              onClick={() => {
                if (option === speed) return;
                triggerHaptic(20);
                setSlowSpeed(option);
              }}
              className={`rounded-2xl border-b-4 px-2 py-2.5 text-xs font-extrabold shadow-md transition sm:text-sm ${
                active
                  ? "border-sky-700 bg-sky-500 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {KIDS_SLOW_SPEED_LABEL[option]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
