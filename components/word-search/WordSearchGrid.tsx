"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  normalizeSelectionPath,
  pathKey,
  wordFromPath,
  matchTargetWord,
  type WordSearchPuzzle,
} from "@/utils/wordSearch";

type Cell = { row: number; col: number };

type WordSearchGridProps = {
  puzzle: WordSearchPuzzle;
  foundWords: string[];
  foundPaths: Cell[][];
  locked: boolean;
  onFoundWord: (word: string, path: Cell[]) => void;
  onMissPath?: () => void;
  resetToken: number;
};

export default function WordSearchGrid({
  puzzle,
  foundWords,
  foundPaths,
  locked,
  onFoundWord,
  onMissPath,
  resetToken,
}: WordSearchGridProps) {
  const [activePath, setActivePath] = useState<Cell[]>([]);
  const draggingRef = useRef(false);
  const startRef = useRef<Cell | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActivePath([]);
    draggingRef.current = false;
    startRef.current = null;
  }, [resetToken, puzzle.levelId, puzzle.words]);

  const activeSet = useMemo(() => new Set(activePath.map((c) => `${c.row},${c.col}`)), [activePath]);
  const foundSet = useMemo(() => {
    const set = new Set<string>();
    for (const path of foundPaths) {
      for (const c of path) set.add(`${c.row},${c.col}`);
    }
    return set;
  }, [foundPaths]);

  const cellFromPoint = useCallback(
    (clientX: number, clientY: number): Cell | null => {
      const el = document.elementFromPoint(clientX, clientY);
      if (!el) return null;
      const cellEl = (el as HTMLElement).closest("[data-ws-cell]") as HTMLElement | null;
      if (!cellEl) return null;
      const row = Number(cellEl.dataset.row);
      const col = Number(cellEl.dataset.col);
      if (Number.isNaN(row) || Number.isNaN(col)) return null;
      return { row, col };
    },
    [],
  );

  const finishSelection = useCallback(
    (rawPath: Cell[]) => {
      const path = normalizeSelectionPath(rawPath);
      setActivePath([]);
      draggingRef.current = false;
      startRef.current = null;
      if (path.length < 2) return;

      const selected = wordFromPath(puzzle.grid, path);
      const matched = matchTargetWord(selected, puzzle.words, foundWords);
      if (matched) {
        // Prefer the placement path orientation that matches the word letters
        onFoundWord(matched, path);
        return;
      }
      onMissPath?.();
    },
    [foundWords, onFoundWord, onMissPath, puzzle.grid, puzzle.words],
  );

  const onPointerDown = (cell: Cell, event: React.PointerEvent) => {
    if (locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    startRef.current = cell;
    setActivePath([cell]);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!draggingRef.current || !startRef.current || locked) return;
    const cell = cellFromPoint(event.clientX, event.clientY);
    if (!cell) return;
    const path = normalizeSelectionPath([startRef.current, cell]);
    if (path.length > 0) setActivePath(path);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    finishSelection(activePath);
  };

  const crayonColor = (index: number) =>
    index % 2 === 0 ? "bg-yellow-300/70" : "bg-pink-300/70";

  return (
    <div ref={gridRef} className="relative mx-auto w-full max-w-lg select-none">
      {/* Locked found markers */}
      {foundPaths.map((path, pi) => (
        <motion.div
          key={`found-${pathKey(path)}-${pi}`}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [1, 1.04, 1], opacity: 1 }}
          transition={{ duration: 0.45, times: [0, 0.4, 1] }}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          {path.map((c, i) => (
            <FoundMark
              key={`${c.row}-${c.col}-${i}`}
              row={c.row}
              col={c.col}
              size={puzzle.size}
              tone={i % 2 === 0 ? "yellow" : "pink"}
            />
          ))}
        </motion.div>
      ))}

      <div
        className="relative grid gap-0 rounded-2xl border-2 border-dashed border-amber-900/25 bg-[#FFFDF9] p-1"
        style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {puzzle.grid.map((row, r) =>
          row.map((letter, c) => {
            const key = `${r},${c}`;
            const isActive = activeSet.has(key);
            const isFound = foundSet.has(key);
            return (
              <button
                key={key}
                type="button"
                data-ws-cell
                data-row={r}
                data-col={c}
                disabled={locked}
                onPointerDown={(e) => onPointerDown({ row: r, col: c }, e)}
                className={`relative aspect-square touch-none border border-dashed border-amber-900/15 text-sm font-black text-slate-800 sm:text-base md:text-lg ${
                  isActive ? crayonColor(r + c) : isFound ? "bg-amber-100/80" : "bg-transparent"
                }`}
                aria-label={`Letter ${letter}`}
              >
                {letter}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

function FoundMark({
  row,
  col,
  size,
  tone,
}: {
  row: number;
  col: number;
  size: number;
  tone: "yellow" | "pink";
}) {
  const pct = 100 / size;
  return (
    <div
      className={`absolute rounded-full ${
        tone === "yellow" ? "bg-yellow-300/55" : "bg-pink-300/55"
      }`}
      style={{
        left: `${col * pct + pct * 0.12}%`,
        top: `${row * pct + pct * 0.12}%`,
        width: `${pct * 0.76}%`,
        height: `${pct * 0.76}%`,
      }}
    />
  );
}
