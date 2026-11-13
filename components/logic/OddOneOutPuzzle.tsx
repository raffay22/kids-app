"use client";

import { useEffect, useState } from "react";
import LogicObjectCard from "@/components/logic/LogicObjectCard";
import {
  LOGIC_OBJECTS,
  oddOneOutHint,
  type OddOneOutPuzzle as OddPuzzleData,
} from "@/utils/logicPuzzles";

type OddOneOutPuzzleProps = {
  puzzle: OddPuzzleData;
  locked: boolean;
  onSolve: () => void;
  onMiss: () => void;
};

export default function OddOneOutPuzzleBoard({
  puzzle,
  locked,
  onSolve,
  onMiss,
}: OddOneOutPuzzleProps) {
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const isAdvanced = puzzle.hideLabels || !puzzle.revealHint;
  const itemCount = puzzle.items.length;

  useEffect(() => {
    setCelebrateId(null);
    setWiggleId(null);
  }, [puzzle.id]);

  const onChoose = (choice: string) => {
    if (locked) return;
    if (choice === puzzle.oddOne) {
      setCelebrateId(choice);
      onSolve();
      return;
    }
    setWiggleId(choice);
    window.setTimeout(() => setWiggleId(null), 400);
    onMiss();
  };

  const gridClass =
    itemCount >= 6
      ? "grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-3"
      : itemCount >= 5
        ? "grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4"
        : "grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5";

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border-4 border-white bg-white/90 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-6">
        <p className="mb-2 text-center text-sm font-extrabold uppercase tracking-wide text-rose-600">
          Category sorting
        </p>
        <p className="mb-2 text-center text-lg font-extrabold text-slate-800 sm:text-xl">
          Find the odd one out
        </p>
        {puzzle.revealHint ? (
          <>
            <p className="mb-2 text-center text-base font-bold text-violet-700 sm:text-lg">
              Three match as{" "}
              <span className="underline decoration-violet-300">{puzzle.categoryHint}</span>.
            </p>
            <p className="mb-5 rounded-2xl bg-violet-50 px-4 py-3 text-center text-sm font-semibold text-violet-800 sm:text-base">
              {oddOneOutHint(puzzle)}
            </p>
          </>
        ) : (
          <p className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-800 sm:text-base">
            {itemCount >= 6 ? "Pro" : "Advanced"}: {itemCount} pictures · no
            labels · no category hint · near-miss trap!
          </p>
        )}
        <div className={gridClass}>
          {puzzle.items.map((item) => {
            const label = LOGIC_OBJECTS[item].label;
            return (
              <div
                key={`${puzzle.id}-${item}`}
                className="flex flex-col items-center gap-2"
              >
                <LogicObjectCard
                  objectId={item}
                  size="xl"
                  celebrate={celebrateId === item}
                  wiggle={wiggleId === item}
                  dim={celebrateId !== null && celebrateId !== item}
                  onClick={() => onChoose(item)}
                  ariaLabel={`Choose ${label}`}
                  className={
                    isAdvanced
                      ? "!h-28 !w-28 !text-5xl sm:!h-36 sm:!w-36 sm:!text-6xl"
                      : "!h-40 !w-40 !text-7xl sm:!h-48 sm:!w-48 sm:!text-8xl"
                  }
                />
                {!puzzle.hideLabels && (
                  <span className="text-center text-sm font-extrabold text-slate-700 sm:text-base">
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
