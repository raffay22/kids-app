"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import MathFruitTile from "@/components/math/MathFruitTile";
import NumberCard from "@/components/math/NumberCard";
import {
  MATH_FRUITS,
  type ToddlerPuzzle,
} from "@/utils/mathLab";

type ToddlerVisualMathProps = {
  puzzle: ToddlerPuzzle;
  locked: boolean;
  onSolve: (choice: number) => void;
  onMiss: (coach?: string) => void;
  onCountSpeak: (n: number) => void;
};

export default function ToddlerVisualMath({
  puzzle,
  locked,
  onSolve,
  onMiss,
  onCountSpeak,
}: ToddlerVisualMathProps) {
  const fruit = MATH_FRUITS[puzzle.fruit];
  const [counted, setCounted] = useState<boolean[]>([]);
  const [celebrateChoice, setCelebrateChoice] = useState<number | null>(null);
  const [wiggleChoice, setWiggleChoice] = useState<number | null>(null);
  const [popAll, setPopAll] = useState(false);

  const totalSlots = useMemo(
    () => Array.from({ length: puzzle.left + puzzle.right }, (_, i) => i),
    [puzzle.left, puzzle.right],
  );

  useEffect(() => {
    setCounted(Array.from({ length: puzzle.left + puzzle.right }, () => false));
    setCelebrateChoice(null);
    setWiggleChoice(null);
    setPopAll(false);
  }, [puzzle.id, puzzle.left, puzzle.right]);

  const onFruitTap = (index: number) => {
    if (locked) return;
    setCounted((prev) => {
      const next = [...prev];
      if (!next[index]) {
        next[index] = true;
        const spoken = next.filter(Boolean).length;
        onCountSpeak(spoken);
      }
      return next;
    });
  };

  const onPick = (value: number) => {
    if (locked) return;
    if (value === puzzle.answer) {
      setCelebrateChoice(value);
      setPopAll(true);
      onSolve(value);
      return;
    }
    setWiggleChoice(value);
    window.setTimeout(() => setWiggleChoice(null), 400);
    onMiss();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border-4 border-white bg-white/90 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-6">
        <p className="mb-1 text-center text-sm font-extrabold uppercase tracking-wide text-rose-600">
          Toddler visual math
        </p>
        <p className="mb-4 text-center text-lg font-extrabold text-slate-800 sm:text-xl">
          {puzzle.prompt}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <GlassTray label="Tray 1">
            {Array.from({ length: puzzle.left }, (_, i) => (
              <MathFruitTile
                key={`L-${puzzle.id}-${i}`}
                fruit={puzzle.fruit}
                counted={counted[i]}
                celebrate={popAll}
                onTap={() => onFruitTap(i)}
                ariaLabel={`${fruit.singular} ${i + 1}`}
              />
            ))}
          </GlassTray>

          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-violet-100 text-3xl font-black text-violet-700 shadow-lg"
            aria-label="plus"
          >
            +
          </span>

          <GlassTray label="Tray 2">
            {Array.from({ length: puzzle.right }, (_, i) => {
              const idx = puzzle.left + i;
              return (
                <MathFruitTile
                  key={`R-${puzzle.id}-${i}`}
                  fruit={puzzle.fruit}
                  counted={counted[idx]}
                  celebrate={popAll}
                  onTap={() => onFruitTap(idx)}
                  ariaLabel={`${fruit.singular} ${idx + 1}`}
                />
              );
            })}
          </GlassTray>

          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-dashed border-amber-300 bg-amber-50 text-3xl font-black text-amber-600 shadow-inner"
            aria-label="question"
          >
            ?
          </span>
        </div>

        <p className="mt-4 text-center text-sm font-bold text-slate-500">
          Tap each {fruit.singular.toLowerCase()} to count · counted{" "}
          {counted.filter(Boolean).length}/{totalSlots.length}
        </p>
      </div>

      <div>
        <p className="mb-3 text-center text-base font-bold text-slate-700">
          Pick the total · 3 number cards
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {puzzle.choices.map((n) => (
            <NumberCard
              key={`${puzzle.id}-${n}`}
              value={n}
              locked={locked}
              celebrate={celebrateChoice === n}
              wiggle={wiggleChoice === n}
              wrongFlash={wiggleChoice === n}
              onPick={() => onPick(n)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GlassTray({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-[9rem] rounded-[1.5rem] border-4 border-white/80 bg-white/70 p-3 shadow-[inset_0_8px_20px_rgba(79,70,229,0.08)] backdrop-blur-xl">
      <p className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-indigo-500">
        {label}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {children}
      </div>
    </div>
  );
}
