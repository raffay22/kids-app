"use client";

import { motion } from "framer-motion";
import type { StoryPuzzle } from "@/utils/iqStories";
import { triggerHaptic } from "@/utils/haptics";

type IQPuzzleRendererProps = {
  puzzle: StoryPuzzle;
  onCorrect: () => void;
  onWrong: () => void;
  /** Hide technical labels like "color match" for kid-facing IQ stories. */
  hideTypeLabel?: boolean;
};

const COLOR_SWATCH: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  pink: "bg-pink-400",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  black: "bg-slate-900",
  brown: "bg-amber-800",
  white: "bg-white border border-slate-200",
};

const SHAPE_LABEL: Record<string, string> = {
  triangle: "Triangle",
  square: "Square",
  circle: "Circle",
  hexagon: "Hexagon",
};

export default function IQPuzzleRenderer({
  puzzle,
  onCorrect,
  onWrong,
  hideTypeLabel = false,
}: IQPuzzleRendererProps) {
  const options = puzzle.options ?? [];

  const checkAnswer = (choice: string) => {
    triggerHaptic(30);
    let correct = false;

    switch (puzzle.type) {
      case "shape_tangram":
        correct = choice === puzzle.correct_shape;
        break;
      case "pattern_sequence":
      case "color_match":
        correct = choice === puzzle.correct_answer || choice === puzzle.target_color;
        break;
      case "odd_one_out":
        correct = choice === puzzle.correct_odd_item;
        break;
      case "object_match":
        correct = choice === puzzle.correct_answer;
        break;
      default:
        correct = false;
    }

    if (correct) onCorrect();
    else onWrong();
  };

  const labelFor = (option: string) => {
    if (puzzle.type === "color_match") return option.charAt(0).toUpperCase() + option.slice(1);
    if (puzzle.type === "shape_tangram") return SHAPE_LABEL[option] ?? option;
    return option.replace(/_/g, " ");
  };

  return (
    <div className="space-y-3">
      {!hideTypeLabel && (
        <p className="text-center text-sm font-bold uppercase tracking-wide text-indigo-500">
          {puzzle.type.replace(/_/g, " ")}
        </p>
      )}
      {puzzle.type === "pattern_sequence" && puzzle.sequence && (
        <div className="flex flex-wrap justify-center gap-2">
          {puzzle.sequence.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="rounded-xl bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-800"
            >
              {item.replace(/_/g, " ")}
            </span>
          ))}
          <span className="rounded-xl border-2 border-dashed border-indigo-300 px-3 py-1.5 text-sm font-bold text-indigo-400">
            ?
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {options.map((option) => (
          <motion.button
            key={option}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => checkAnswer(option)}
            className="kid-card flex min-h-[56px] items-center justify-center gap-2 border-indigo-200 bg-white p-3 text-base font-bold text-slate-800"
          >
            {puzzle.type === "color_match" && (
              <span
                className={`h-5 w-5 rounded-full ${COLOR_SWATCH[option] ?? "bg-slate-300"}`}
                aria-hidden
              />
            )}
            {puzzle.type === "shape_tangram" && option === "circle" && (
              <span className="h-6 w-6 rounded-full bg-amber-200" aria-hidden />
            )}
            {puzzle.type === "shape_tangram" && option === "square" && (
              <span className="h-6 w-6 rounded-sm bg-amber-200" aria-hidden />
            )}
            {puzzle.type === "shape_tangram" && option === "triangle" && (
              <span
                className="h-0 w-0 border-x-[12px] border-b-[22px] border-x-transparent border-b-amber-200"
                aria-hidden
              />
            )}
            {labelFor(option)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
