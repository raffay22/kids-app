"use client";

import { useEffect, useState } from "react";
import NumberCard from "@/components/math/NumberCard";
import type { LogicMultiplyPuzzle } from "@/utils/logicPuzzles";

type LogicMultiplyBoardProps = {
  puzzle: LogicMultiplyPuzzle;
  locked: boolean;
  onSolve: () => void;
  onMiss: () => void;
};

function OpBadge({ children }: { children: string }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-amber-100 text-2xl font-black text-amber-800 shadow-md">
      {children}
    </span>
  );
}

function BigNumber({
  value,
  label,
}: {
  value: number | null;
  label?: string;
}) {
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center justify-center rounded-[1.35rem] border-4 border-white bg-gradient-to-b from-amber-50 to-orange-100 px-4 py-3 shadow-lg">
      {label && (
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-700">
          {label}
        </p>
      )}
      <p className="text-3xl font-black text-amber-950 sm:text-4xl">
        {value == null ? "?" : value}
      </p>
    </div>
  );
}

export default function LogicMultiplyBoard({
  puzzle,
  locked,
  onSolve,
  onMiss,
}: LogicMultiplyBoardProps) {
  const [celebrateChoice, setCelebrateChoice] = useState<number | null>(null);
  const [wiggleChoice, setWiggleChoice] = useState<number | null>(null);

  useEffect(() => {
    setCelebrateChoice(null);
    setWiggleChoice(null);
  }, [puzzle.id]);

  const onPick = (value: number) => {
    if (locked) return;
    if (value === puzzle.answer) {
      setCelebrateChoice(value);
      onSolve();
      return;
    }
    setWiggleChoice(value);
    window.setTimeout(() => setWiggleChoice(null), 400);
    onMiss();
  };

  const showDots =
    puzzle.kind === "multiply" && puzzle.left * puzzle.right <= 36;

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border-4 border-white bg-white/90 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-6">
        <p className="mb-1 text-center text-sm font-extrabold uppercase tracking-wide text-amber-700">
          Times tables · ages 7–8
        </p>
        <p className="mb-4 text-center text-lg font-extrabold text-slate-800 sm:text-xl">
          {puzzle.prompt}
        </p>

        {puzzle.kind === "multiply" ? (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <BigNumber value={puzzle.left} label="groups" />
            <OpBadge>×</OpBadge>
            <BigNumber value={puzzle.right} label="in each" />
            <OpBadge>=</OpBadge>
            <BigNumber value={celebrateChoice} label="?" />
          </div>
        ) : (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <BigNumber value={puzzle.left} />
            <OpBadge>×</OpBadge>
            <BigNumber value={celebrateChoice} label="?" />
            <OpBadge>=</OpBadge>
            <BigNumber value={puzzle.right} label="total" />
          </div>
        )}

        {showDots && (
          <div className="mx-auto max-w-lg space-y-2 rounded-[1.5rem] border-4 border-amber-100 bg-gradient-to-b from-amber-50 to-orange-50 p-3 shadow-inner">
            <p className="text-center text-[10px] font-extrabold uppercase tracking-wide text-amber-700">
              {puzzle.left} groups of {puzzle.right}
            </p>
            <div className="space-y-1.5">
              {Array.from({ length: puzzle.left }, (_, r) => (
                <div key={`row-${r}`} className="flex flex-wrap justify-center gap-1.5">
                  {Array.from({ length: puzzle.right }, (_, c) => (
                    <span
                      key={`${r}-${c}`}
                      className="inline-block h-3.5 w-3.5 rounded-full bg-amber-400 shadow-sm"
                      aria-hidden
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-center text-base font-bold text-slate-700">
          Pick the answer
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {puzzle.choices.map((choice) => (
            <NumberCard
              key={`${puzzle.id}-${choice}`}
              value={choice}
              locked={locked}
              celebrate={celebrateChoice === choice}
              wiggle={wiggleChoice === choice}
              onPick={() => onPick(choice)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
