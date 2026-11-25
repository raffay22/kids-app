"use client";

import { useEffect, useState } from "react";
import MathFruitTile from "@/components/math/MathFruitTile";
import MathGoldCoin from "@/components/math/MathGoldCoin";
import NumberCard from "@/components/math/NumberCard";
import { MATH_FRUITS, type ProPuzzle } from "@/utils/mathLab";

type ProMathChallengeProps = {
  puzzle: ProPuzzle;
  locked: boolean;
  onSolve: (choice: number) => void;
  onMiss: (coach?: string) => void;
};

function OpBadge({ children }: { children: string }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-violet-100 text-2xl font-black text-violet-700 shadow-md">
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
    <div className="flex min-w-[4.5rem] flex-col items-center justify-center rounded-[1.35rem] border-4 border-white bg-gradient-to-b from-violet-50 to-indigo-100 px-4 py-3 shadow-lg">
      {label && (
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-violet-600">
          {label}
        </p>
      )}
      <p className="text-3xl font-black text-violet-900 sm:text-4xl">
        {value == null ? "?" : value}
      </p>
    </div>
  );
}

export default function ProMathChallenge({
  puzzle,
  locked,
  onSolve,
  onMiss,
}: ProMathChallengeProps) {
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
      onSolve(value);
      return;
    }
    setWiggleChoice(value);
    window.setTimeout(() => setWiggleChoice(null), 400);
    const tip =
      puzzle.kind === "multiply"
        ? "Count each row in the array, then try again!"
        : puzzle.kind === "missingFactor"
          ? "Think: how many groups make that total?"
          : puzzle.kind === "hardSub"
            ? "Start big, take away carefully!"
            : "Add the two numbers step by step!";
    onMiss(tip);
  };

  const fruit = MATH_FRUITS[puzzle.fruit];
  const showArray =
    puzzle.kind === "multiply" && puzzle.left * puzzle.right <= 36;

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border-4 border-white bg-white/90 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-6">
        <p className="mb-1 text-center text-sm font-extrabold uppercase tracking-wide text-violet-700">
          Pro challenge · 7–8 · {puzzle.kind}
        </p>
        <p className="mb-4 text-center text-lg font-extrabold text-slate-800 sm:text-xl">
          {puzzle.prompt}
        </p>

        {(puzzle.kind === "hardAdd" || puzzle.kind === "hardSub") && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <BigNumber value={puzzle.left} label="start" />
            <OpBadge>{puzzle.kind === "hardAdd" ? "+" : "−"}</OpBadge>
            <BigNumber value={puzzle.right} label={puzzle.kind === "hardAdd" ? "add" : "take away"} />
            <OpBadge>=</OpBadge>
            <BigNumber value={celebrateChoice} label="?" />
          </div>
        )}

        {puzzle.kind === "missingFactor" && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <BigNumber value={puzzle.left} />
            <OpBadge>×</OpBadge>
            <BigNumber value={celebrateChoice} label="?" />
            <OpBadge>=</OpBadge>
            <BigNumber value={puzzle.right} label="total" />
          </div>
        )}

        {puzzle.kind === "multiply" && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <BigNumber value={puzzle.left} label="rows" />
            <OpBadge>×</OpBadge>
            <BigNumber value={puzzle.right} label="in each" />
            <OpBadge>=</OpBadge>
            <BigNumber value={celebrateChoice} label="?" />
          </div>
        )}

        {/* Visual array for multiply */}
        {showArray && (
          <div className="mx-auto max-w-lg space-y-2 rounded-[1.5rem] border-4 border-violet-100 bg-gradient-to-b from-violet-50 to-indigo-50 p-3 shadow-inner">
            <p className="text-center text-[10px] font-extrabold uppercase tracking-wide text-violet-600">
              {puzzle.left} rows of {puzzle.right} {fruit.label.toLowerCase()}
            </p>
            <div className="space-y-1.5">
              {Array.from({ length: puzzle.left }, (_, r) => (
                <div key={`row-${r}`} className="flex flex-wrap justify-center gap-1.5">
                  {Array.from({ length: puzzle.right }, (_, c) => (
                    <MathFruitTile
                      key={`${r}-${c}`}
                      fruit={puzzle.fruit}
                      size="sm"
                      ariaLabel={`${fruit.singular} ${r + 1}-${c + 1}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {puzzle.kind === "missingFactor" && (
          <p className="mt-2 text-center text-sm font-bold text-slate-500">
            Hint: {puzzle.left} groups make {puzzle.right} {fruit.label.toLowerCase()} altogether.
          </p>
        )}

        {/* Compact coin hint for harder add/sub when numbers aren't huge */}
        {(puzzle.kind === "hardAdd" || puzzle.kind === "hardSub") &&
          puzzle.left + puzzle.right <= 28 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <div className="flex max-w-[11rem] flex-wrap justify-center gap-1 rounded-2xl bg-amber-50 p-2">
                {Array.from({ length: Math.min(puzzle.left, 12) }, (_, i) => (
                  <MathGoldCoin key={`L-${i}`} id={`L-${i}`} size="sm" />
                ))}
                {puzzle.left > 12 && (
                  <span className="text-xs font-bold text-amber-800">+{puzzle.left - 12}</span>
                )}
              </div>
              <span className="text-lg font-black text-violet-600">
                {puzzle.kind === "hardAdd" ? "+" : "−"}
              </span>
              <div className="flex max-w-[11rem] flex-wrap justify-center gap-1 rounded-2xl bg-rose-50 p-2">
                {Array.from({ length: Math.min(puzzle.right, 12) }, (_, i) => (
                  <MathGoldCoin key={`R-${i}`} id={`R-${i}`} size="sm" />
                ))}
                {puzzle.right > 12 && (
                  <span className="text-xs font-bold text-rose-800">+{puzzle.right - 12}</span>
                )}
              </div>
            </div>
          )}
      </div>

      <div>
        <p className="mb-3 text-center text-base font-bold text-slate-700">
          Pick the answer
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
