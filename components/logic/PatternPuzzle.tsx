"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LogicObjectCard from "@/components/logic/LogicObjectCard";
import type { PatternPuzzle as PatternPuzzleData } from "@/utils/logicPuzzles";

type PatternPuzzleProps = {
  puzzle: PatternPuzzleData;
  locked: boolean;
  onSolve: () => void;
  onMiss: () => void;
};

export default function PatternPuzzleBoard({
  puzzle,
  locked,
  onSolve,
  onMiss,
}: PatternPuzzleProps) {
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const [wiggleId, setWiggleId] = useState<string | null>(null);

  useEffect(() => {
    setCelebrateId(null);
    setWiggleId(null);
  }, [puzzle.id]);

  const onChoose = (choice: string) => {
    if (locked) return;
    if (choice === puzzle.answer) {
      setCelebrateId(choice);
      onSolve();
      return;
    }
    setWiggleId(choice);
    window.setTimeout(() => setWiggleId(null), 400);
    onMiss();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.75rem] border-4 border-white bg-white/90 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-6"
      >
        <p className="mb-4 text-center text-sm font-extrabold uppercase tracking-wide text-violet-600">
          {puzzle.patternLabel} pattern
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {puzzle.sequence.map((id, index) => (
            <div key={`${puzzle.id}-seq-${index}`} className="flex items-center gap-3">
              <LogicObjectCard objectId={id} size="md" />
              <span className="text-2xl font-black text-violet-300" aria-hidden>
                →
              </span>
            </div>
          ))}
          <LogicObjectCard objectId="mystery" size="md" />
        </div>
      </motion.div>

      <div>
        <p className="mb-3 text-center text-base font-bold text-slate-700">
          Pick what comes next
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {puzzle.choices.map((choice) => (
            <LogicObjectCard
              key={`${puzzle.id}-${choice}`}
              objectId={choice}
              size="lg"
              celebrate={celebrateId === choice}
              wiggle={wiggleId === choice}
              onClick={() => onChoose(choice)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
