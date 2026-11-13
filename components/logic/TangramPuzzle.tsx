"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import {
  LOGIC_OBJECTS,
  tangramTrayOrder,
  type TangramPuzzle as TangramPuzzleData,
  type TangramShapeId,
} from "@/utils/logicPuzzles";

type TangramPuzzleProps = {
  puzzle: TangramPuzzleData;
  locked: boolean;
  onSolve: () => void;
  onMiss: () => void;
};

type PieceState = {
  id: TangramShapeId;
  placed: boolean;
  wiggle: boolean;
};

const SHAPE_EMOJI: Record<TangramShapeId, string> = {
  circle: "🔵",
  star: "⭐",
  triangle: "🔺",
  square: "🟩",
  heart: "❤️",
  moon: "🌙",
};

export default function TangramPuzzleBoard({
  puzzle,
  locked,
  onSolve,
  onMiss,
}: TangramPuzzleProps) {
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const solvedRef = useRef(false);
  const [selected, setSelected] = useState<TangramShapeId | null>(null);
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const tray = useMemo(() => tangramTrayOrder(puzzle.slots), [puzzle.id, puzzle.slots]);
  const isAdvanced = puzzle.slots.length > 4 || puzzle.hideGhosts || puzzle.dragOnly;

  useEffect(() => {
    solvedRef.current = false;
    setSelected(null);
    setPieces(
      tray.map((id) => ({
        id,
        placed: false,
        wiggle: false,
      })),
    );
  }, [puzzle.id, tray]);

  const snapRadius = puzzle.snapRadiusPx;

  const tryPlace = (shapeId: TangramShapeId, point?: { x: number; y: number }) => {
    if (locked || solvedRef.current) return false;
    const already = pieces.find((p) => p.id === shapeId)?.placed;
    if (already) return false;

    const slotEl = slotRefs.current[shapeId];
    if (!slotEl) return false;

    if (point) {
      const rect = slotEl.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const dist = Math.hypot(point.x - center.x, point.y - center.y);
      if (dist > snapRadius) {
        let overWrong = false;
        for (const slotId of puzzle.slots) {
          if (slotId === shapeId) continue;
          const other = slotRefs.current[slotId];
          if (!other) continue;
          const r = other.getBoundingClientRect();
          const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          if (Math.hypot(point.x - c.x, point.y - c.y) <= snapRadius + 18) {
            overWrong = true;
            break;
          }
        }
        if (overWrong) {
          setPieces((prev) =>
            prev.map((p) => (p.id === shapeId ? { ...p, wiggle: true } : p)),
          );
          window.setTimeout(() => {
            setPieces((prev) =>
              prev.map((p) => (p.id === shapeId ? { ...p, wiggle: false } : p)),
            );
          }, 400);
          onMiss();
        }
        return false;
      }
    }

    setPieces((prev) => {
      const next = prev.map((p) =>
        p.id === shapeId ? { ...p, placed: true, wiggle: false } : p,
      );
      const done = next.every((p) => p.placed);
      if (done && !solvedRef.current) {
        solvedRef.current = true;
        window.setTimeout(() => onSolve(), 120);
      }
      return next;
    });
    setSelected(null);
    return true;
  };

  const onDragEnd = (shapeId: TangramShapeId, info: PanInfo) => {
    tryPlace(shapeId, { x: info.point.x, y: info.point.y });
  };

  const onSlotTap = (slotId: TangramShapeId) => {
    if (puzzle.dragOnly) return;
    if (!selected) return;
    if (selected === slotId) {
      tryPlace(selected);
      return;
    }
    setPieces((prev) =>
      prev.map((p) => (p.id === selected ? { ...p, wiggle: true } : p)),
    );
    window.setTimeout(() => {
      setPieces((prev) =>
        prev.map((p) => (p.id === selected ? { ...p, wiggle: false } : p)),
      );
    }, 400);
    setSelected(null);
    onMiss();
  };

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[1.75rem] border-4 border-white bg-white/80 p-3 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.75),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(165,180,252,0.35),transparent_40%)]"
        />
        <p className="relative mb-3 text-center text-sm font-extrabold uppercase tracking-wide text-teal-700">
          {puzzle.hideGhosts
            ? "Pro blank tangram board"
            : isAdvanced
              ? "Advanced glass tangram board"
              : "Glass tangram board"}
        </p>
        {isAdvanced && (
          <p className="relative mb-3 text-center text-xs font-bold text-rose-600 sm:text-sm">
            {puzzle.hideGhosts
              ? "Blank cutouts · drag only · tiny magnets · ages 7–8"
              : "Match each icon · drag only · tiny magnets"}
          </p>
        )}
        <div
          className={`relative mx-auto grid w-fit justify-items-center gap-2 sm:gap-2.5 ${
            puzzle.slots.length > 4 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {puzzle.slots.map((slotId) => {
            const placed = pieces.find((p) => p.id === slotId && p.placed);
            const visual = LOGIC_OBJECTS[slotId];
            return (
              <button
                key={`slot-${slotId}`}
                type="button"
                ref={(el) => {
                  slotRefs.current[slotId] = el;
                }}
                onClick={() => onSlotTap(slotId)}
                aria-label={`${visual.label} cutout`}
                className="relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl border-[3px] border-dashed border-indigo-200/80 bg-indigo-50/70 shadow-[inset_0_6px_14px_rgba(79,70,229,0.12)] sm:h-[4.75rem] sm:w-[4.75rem]"
              >
                {!placed && !puzzle.hideGhosts && (
                  <span
                    className={`leading-none ${
                      isAdvanced
                        ? "text-4xl opacity-55 sm:text-5xl"
                        : "text-4xl opacity-35 sm:text-5xl"
                    }`}
                    aria-hidden
                  >
                    {SHAPE_EMOJI[slotId]}
                  </span>
                )}
                {!placed && puzzle.hideGhosts && (
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-300/80"
                    aria-hidden
                  >
                    ?
                  </span>
                )}
                {placed && (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: [1, 1.12, 1], opacity: 1 }}
                    transition={{ duration: 0.45, times: [0, 0.4, 1] }}
                    className={`flex h-[90%] w-[90%] items-center justify-center rounded-[0.95rem] border-[3px] bg-gradient-to-br shadow-lg ${visual.rim} ${visual.face}`}
                  >
                    <span className="text-4xl leading-none sm:text-5xl">
                      {SHAPE_EMOJI[slotId]}
                    </span>
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-center text-base font-bold text-slate-700">
          {puzzle.dragOnly
            ? "Drag each big shape onto the matching cutout"
            : "Drag onto a cutout, or tap a shape then tap its slot"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {pieces
            .filter((p) => !p.placed)
            .map((piece) => {
              const visual = LOGIC_OBJECTS[piece.id];
              return (
                <motion.button
                  key={`tray-${piece.id}`}
                  type="button"
                  aria-label={`Move ${visual.label} shape`}
                  disabled={locked}
                  drag={!locked}
                  dragSnapToOrigin
                  dragMomentum={false}
                  dragElastic={0.14}
                  onDragEnd={(_, info) => onDragEnd(piece.id, info)}
                  onClick={() => {
                    if (puzzle.dragOnly) return;
                    setSelected((s) => (s === piece.id ? null : piece.id));
                  }}
                  animate={{
                    x: piece.wiggle ? [-6, 6, -6, 0] : 0,
                    scale: selected === piece.id ? 1.08 : 1,
                  }}
                  transition={{
                    x: { duration: 0.35 },
                    scale: { type: "spring", stiffness: 420, damping: 18 },
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93, y: 4 }}
                  whileDrag={{ scale: 1.12, zIndex: 40 }}
                  className={`relative flex h-20 w-20 cursor-grab items-center justify-center rounded-[1.35rem] border-4 bg-gradient-to-br shadow-[0_15px_30px_rgba(0,0,0,0.14),inset_0_2px_0_rgba(255,255,255,0.7)] active:cursor-grabbing sm:h-24 sm:w-24 ${visual.rim} ${visual.face} ${
                    selected === piece.id ? "ring-4 ring-amber-300" : ""
                  } ${piece.wiggle ? "shadow-[0_0_0_6px_rgba(248,113,113,0.28)]" : ""}`}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-2.5 top-1.5 h-1/3 rounded-full bg-white/35"
                  />
                  <span className="relative z-[1] text-5xl leading-none drop-shadow-md sm:text-6xl">
                    {SHAPE_EMOJI[piece.id]}
                  </span>
                </motion.button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
