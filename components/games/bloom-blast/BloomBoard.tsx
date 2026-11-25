"use client";

/**
 * Bloom Blast board rules (do not break again):
 * 1) Boxes MOVE — Group 1 drags; Group 2 swipes to a neighbor to SWAP.
 * 2) Start board has NO ready-made 3+ matches.
 * 3) After a swap: if 3+ matching shapes appear, blast ONCE (+1 score), then refill.
 * 4) NEVER auto-cascade / auto-play / auto Level Clear. Only the kid's swap scores.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import ShapeGlyph from "@/components/games/bloom-blast/ShapeGlyph";
import {
  boomVoiceLabel,
  createBoard,
  ensurePlayableBoard,
  matchKey,
  pickSafeTile,
  type BloomLevelConfig,
  type BloomTileKind,
} from "@/components/games/bloom-blast/levelsConfig";
import { playBloomBoom, playBloomCancel } from "@/components/games/bloom-blast/audio";
import {
  speakBloomBoom,
  stopBloomSpeech,
} from "@/components/games/bloom-blast/speech";
import { triggerHaptic } from "@/utils/haptics";

type Cell = { r: number; c: number };

/** Local copy — avoids Turbopack HMR “export is not a function” crashes. */
function passesChallenge(
  tile: BloomTileKind,
  challenge: BloomLevelConfig["challenge"],
): boolean {
  if (challenge.type === "none") return true;
  if (challenge.type === "color") return tile.colorKey === challenge.colorKey;
  if (challenge.type === "size") return tile.size === challenge.size;
  if (challenge.type === "category")
    return tile.category === challenge.categoryKey;
  if (challenge.type === "colorCategory")
    return (
      tile.colorKey === challenge.colorKey &&
      tile.category === challenge.categoryKey
    );
  if (challenge.type === "plantPart")
    return tile.plantPart === challenge.partKey;
  if (challenge.type === "living") return tile.living === challenge.living;
  if (challenge.type === "matter") return tile.matterState === challenge.state;
  if (challenge.type === "speechPart")
    return tile.speechPart === challenge.part;
  if (challenge.type === "mathTarget")
    return tile.mathValue === challenge.target;
  return true;
}

type BoardPiece = {
  uid: string;
  kind: BloomTileKind;
};

type Shard = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
};

type DragState = {
  from: Cell;
  piece: BoardPiece;
  x: number;
  y: number;
  pointerId: number;
};

function keyOf(r: number, c: number) {
  return `${r},${c}`;
}

function makeUid() {
  return `p-${Math.random().toString(36).slice(2, 9)}`;
}

function isOrthoAdjacent(a: Cell, b: Cell) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

function boardFromKinds(kinds: BloomTileKind[][]): BoardPiece[][] {
  return kinds.map((row) => row.map((kind) => ({ uid: makeUid(), kind })));
}

function cloneBoard(board: BoardPiece[][]): BoardPiece[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function swapCells(board: BoardPiece[][], a: Cell, b: Cell): BoardPiece[][] {
  const next = cloneBoard(board);
  const tmp = next[a.r]![a.c]!;
  next[a.r]![a.c] = next[b.r]![b.c]!;
  next[b.r]![b.c] = tmp;
  return next;
}

/**
 * Find ortho lines of 3+ that match for this level:
 * - none → same tile id
 * - color → same colour
 * - size → same size
 * - category → same fruit/veggie category
 * - colorCategory → same colour + category
 * Only blastable if the run passes the level challenge.
 */
function findBlastGroups(
  board: BoardPiece[][],
  level: BloomLevelConfig,
): { cells: Cell[]; kind: BloomTileKind }[] {
  const size = board.length;
  const challenge = level.challenge;
  const out: { cells: Cell[]; kind: BloomTileKind }[] = [];
  const used = new Set<string>();

  const pushRun = (cells: Cell[], kind: BloomTileKind) => {
    if (cells.length < 3) return;
    if (!passesChallenge(kind, challenge)) return;
    const key = cells.map((p) => keyOf(p.r, p.c)).sort().join("|");
    if (used.has(key)) return;
    used.add(key);
    out.push({ cells, kind });
  };

  const sameRun = (a: BloomTileKind, b: BloomTileKind) =>
    matchKey(a, challenge) === matchKey(b, challenge);

  // Horizontal runs
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      const kind = board[r]![c]!.kind;
      let end = c + 1;
      while (end < size && sameRun(board[r]![end]!.kind, kind)) end++;
      if (end - c >= 3) {
        const cells: Cell[] = [];
        for (let i = c; i < end; i++) cells.push({ r, c: i });
        pushRun(cells, kind);
      }
      c = end;
    }
  }

  // Vertical runs
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      const kind = board[r]![c]!.kind;
      let end = r + 1;
      while (end < size && sameRun(board[end]![c]!.kind, kind)) end++;
      if (end - r >= 3) {
        const cells: Cell[] = [];
        for (let i = r; i < end; i++) cells.push({ r: i, c });
        pushRun(cells, kind);
      }
      r = end;
    }
  }

  return out;
}

function applyGravitySafe(
  board: (BoardPiece | null)[][],
  level: BloomLevelConfig,
): BoardPiece[][] {
  const tiles = level.tiles;
  const size = board.length;
  const next: (BoardPiece | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );

  for (let c = 0; c < size; c++) {
    const stack: BoardPiece[] = [];
    for (let r = size - 1; r >= 0; r--) {
      const t = board[r]![c];
      if (t) stack.push(t);
    }
    for (let i = 0; i < stack.length; i++) {
      next[size - 1 - i]![c] = stack[i]!;
    }
  }

  const kindGrid: (BloomTileKind | null)[][] = next.map((row) =>
    row.map((p) => p?.kind ?? null),
  );
  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size; r++) {
      if (next[r]![c]) continue;
      const kind = pickSafeTile(kindGrid, r, c, tiles, level.challenge);
      kindGrid[r]![c] = kind;
      next[r]![c] = { uid: makeUid(), kind };
    }
  }

  // No free 3-matches, but always keep at least one possible swap for the kid
  const kinds = (next as BoardPiece[][]).map((row) => row.map((p) => p.kind));
  const playable = ensurePlayableBoard(kinds, tiles, level.challenge);
  return playable.map((row, r) =>
    row.map((kind, c) => {
      const prev = (next as BoardPiece[][])[r]?.[c];
      if (prev && prev.kind.id === kind.id) return prev;
      return { uid: makeUid(), kind };
    }),
  );
}

/** Only groups that touch the cells the kid just swapped. */
function groupsFromSwap(
  board: BoardPiece[][],
  level: BloomLevelConfig,
  from: Cell,
  to: Cell,
): ReturnType<typeof findBlastGroups> {
  const all = findBlastGroups(board, level);
  const touch = new Set([keyOf(from.r, from.c), keyOf(to.r, to.c)]);
  return all.filter((g) =>
    g.cells.some((cell) => touch.has(keyOf(cell.r, cell.c))),
  );
}

export default function BloomBoard({
  level,
  running,
  onMatch,
}: {
  level: BloomLevelConfig;
  running: boolean;
  onMatch: (tile: BloomTileKind, count: number) => void;
}) {
  const size = level.gridSize;
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [board, setBoard] = useState<BoardPiece[][]>(() =>
    boardFromKinds(createBoard(size, level.tiles, level.challenge)),
  );
  const [selected, setSelected] = useState<Cell | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [swapHint, setSwapHint] = useState<Cell | null>(null);
  const [shattering, setShattering] = useState<Set<string>>(new Set());
  const [fallingUids, setFallingUids] = useState<Set<string>>(new Set());
  const [shards, setShards] = useState<Shard[]>([]);
  const [busy, setBusy] = useState(false);
  const cellEls = useRef<Map<string, HTMLButtonElement>>(new Map());
  const shardIdRef = useRef(1);
  const boardSnap = useRef(board);
  /** Guards against any accidental double-resolve / cascade. */
  const actionLock = useRef(false);
  /** Group 2: swipe already fired for this pointer gesture. */
  const swipeFired = useRef(false);
  /** Groups 2–3 use swipe; Group 1 keeps drag ghost. */
  const inputMode = level.group >= 2 ? "swipe" : "drag";

  useEffect(() => {
    boardSnap.current = board;
  }, [board]);

  useEffect(() => {
    const fresh = boardFromKinds(
      createBoard(size, level.tiles, level.challenge),
    );
    boardSnap.current = fresh;
    setBoard(fresh);
    setSelected(null);
    setDrag(null);
    setSwapHint(null);
    setShattering(new Set());
    setFallingUids(new Set());
    setShards([]);
    setBusy(false);
    actionLock.current = false;
  }, [level.challenge, level.id, level.tiles, size]);

  // Always kill BOOM voice when the board unmounts (leave level / leave game).
  useEffect(() => {
    return () => stopBloomSpeech();
  }, []);

  const spawnShards = useCallback((cells: Cell[], color: string) => {
    if (!boardRef.current) return;
    const root = boardRef.current.getBoundingClientRect();
    const next: Shard[] = [];
    for (const cell of cells) {
      const el = cellEls.current.get(keyOf(cell.r, cell.c));
      if (!el) continue;
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2 - root.left;
      const cy = box.top + box.height / 2 - root.top;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
        const speed = 2.2 + Math.random() * 3;
        next.push({
          id: shardIdRef.current++,
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.6,
          color,
          life: 1,
        });
      }
    }
    setShards((prev) => [...prev, ...next]);
  }, []);

  useEffect(() => {
    if (shards.length === 0) return;
    let raf = 0;
    const tick = () => {
      setShards((prev) =>
        prev
          .map((s) => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            vy: s.vy + 0.28,
            life: s.life - 0.04,
          }))
          .filter((s) => s.life > 0),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shards.length > 0]);

  /**
   * Blast ONLY the match the kid just made with their swap — once.
   * Never blast other free groups. Never cascade after gravity.
   */
  const blastOnce = useCallback(
    async (
      swapped: BoardPiece[][],
      groups: ReturnType<typeof findBlastGroups>,
    ) => {
      if (actionLock.current) return;
      actionLock.current = true;
      setBusy(true);

      const keys = new Set<string>();
      const cells: Cell[] = [];
      for (const g of groups) {
        for (const cell of g.cells) {
          const k = keyOf(cell.r, cell.c);
          if (!keys.has(k)) {
            keys.add(k);
            cells.push(cell);
          }
        }
      }

      // Voice must name the tiles actually blasting (majority on the board),
      // not groups[0] — that can be a different line that also touched the swap.
      const idCounts = new Map<string, { n: number; kind: BloomTileKind }>();
      for (const cell of cells) {
        const kind = swapped[cell.r]![cell.c]!.kind;
        const prev = idCounts.get(kind.id);
        if (prev) prev.n += 1;
        else idCounts.set(kind.id, { n: 1, kind });
      }
      let speakKind = groups[0]!.kind;
      let bestN = 0;
      for (const { n, kind } of idCounts.values()) {
        if (n > bestN) {
          bestN = n;
          speakKind = kind;
        }
      }
      // L1 = shape only · L3 = colour only · L2 keeps adjective+shape
      const boomLabel =
        boomVoiceLabel(level, speakKind).trim() || speakKind.shapeName;

      setShattering(keys);
      spawnShards(cells, speakKind.glow);
      playBloomBoom();
      stopBloomSpeech();
      speakBloomBoom(boomLabel);
      triggerHaptic(28);
      onMatch(
        { ...speakKind, speakLabel: boomLabel },
        cells.length,
      );

      await new Promise((r) => setTimeout(r, 300));

      const cleared: (BoardPiece | null)[][] = swapped.map((row, r) =>
        row.map((piece, c) => (keys.has(keyOf(r, c)) ? null : piece)),
      );
      // Gravity + sanitize: board must not keep free 3-matches
      const after = applyGravitySafe(cleared, level);
      const fell = new Set<string>();
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const before = swapped[r]![c];
          const nextP = after[r]![c]!;
          if (!before || before.uid !== nextP.uid) fell.add(nextP.uid);
        }
      }

      boardSnap.current = after;
      setBoard(after);
      setShattering(new Set());
      setFallingUids(fell);

      await new Promise((r) => setTimeout(r, 360));
      setFallingUids(new Set());
      setBusy(false);
      actionLock.current = false;
      // STOP. Do not scan/blast again. Kid must swap again for the next BOOM.
    },
    [level, onMatch, size, spawnShards],
  );

  const trySwap = useCallback(
    async (from: Cell, to: Cell) => {
      if (!running || busy || actionLock.current) return;
      if (!isOrthoAdjacent(from, to)) {
        playBloomCancel();
        setSelected(null);
        return;
      }

      const before = boardSnap.current;
      const swapped = swapCells(before, from, to);
      boardSnap.current = swapped;
      setBoard(swapped);
      setSelected(null);
      setSwapHint(null);
      triggerHaptic(16);

      await new Promise((r) => setTimeout(r, 160));

      // Only the match created by THIS swap (touches from/to) — not every group
      const groups = groupsFromSwap(swapped, level, from, to);
      if (groups.length === 0) {
        playBloomCancel();
        boardSnap.current = before;
        setBoard(before);
        return;
      }

      await blastOnce(swapped, groups);
    },
    [blastOnce, busy, level, running],
  );

  const cellFromPoint = (clientX: number, clientY: number): Cell | null => {
    for (const [k, el] of cellEls.current) {
      const box = el.getBoundingClientRect();
      if (
        clientX >= box.left &&
        clientX <= box.right &&
        clientY >= box.top &&
        clientY <= box.bottom
      ) {
        const [rs, cs] = k.split(",");
        return { r: Number(rs), c: Number(cs) };
      }
    }
    return null;
  };

  const neighborFromSwipe = (
    from: Cell,
    clientX: number,
    clientY: number,
  ): Cell | null => {
    const el = cellEls.current.get(keyOf(from.r, from.c));
    if (!el) return null;
    const box = el.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const threshold = box.width * 0.35;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return null;
    let to: Cell;
    if (Math.abs(dx) >= Math.abs(dy)) {
      to = { r: from.r, c: from.c + (dx > 0 ? 1 : -1) };
    } else {
      to = { r: from.r + (dy > 0 ? 1 : -1), c: from.c };
    }
    if (to.r < 0 || to.c < 0 || to.r >= size || to.c >= size) return null;
    return to;
  };

  const onPointerDown = (r: number, c: number, e: ReactPointerEvent) => {
    if (!running || busy || actionLock.current) return;
    e.preventDefault();
    e.stopPropagation();
    const piece = board[r]![c]!;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    swipeFired.current = false;

    // Tap neighbor of selected = swap (backup for all groups)
    if (selected && !(selected.r === r && selected.c === c)) {
      if (isOrthoAdjacent(selected, { r, c })) {
        void trySwap(selected, { r, c });
        return;
      }
    }

    setSelected({ r, c });
    setDrag({
      from: { r, c },
      piece,
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
    });
    triggerHaptic(10);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (inputMode === "swipe") {
      if (swipeFired.current) return;
      const to = neighborFromSwipe(drag.from, e.clientX, e.clientY);
      if (to && isOrthoAdjacent(drag.from, to)) {
        setSwapHint(to);
        swipeFired.current = true;
        const from = drag.from;
        setDrag(null);
        setSwapHint(null);
        void trySwap(from, to);
      }
      return;
    }

    setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : null));
    const hit = cellFromPoint(e.clientX, e.clientY);
    if (hit && isOrthoAdjacent(drag.from, hit)) setSwapHint(hit);
    else setSwapHint(null);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    const from = drag.from;
    const hit = cellFromPoint(e.clientX, e.clientY);
    setDrag(null);
    setSwapHint(null);

    if (inputMode === "swipe") {
      // Swipe already fired on move; on short press keep selection only
      if (!swipeFired.current && hit && isOrthoAdjacent(from, hit)) {
        void trySwap(from, hit);
      }
      swipeFired.current = false;
      return;
    }

    if (hit && !(hit.r === from.r && hit.c === from.c)) {
      void trySwap(from, hit);
    }
  };

  const ghostStyle = (() => {
    if (!drag || !boardRef.current) return null;
    const root = boardRef.current.getBoundingClientRect();
    const el = cellEls.current.get(keyOf(drag.from.r, drag.from.c));
    const sizePx = el?.getBoundingClientRect().width ?? 64;
    return {
      left: drag.x - root.left - sizePx / 2,
      top: drag.y - root.top - sizePx / 2,
      width: sizePx,
      height: sizePx,
    };
  })();

  return (
    <div
      ref={boardRef}
      className="relative touch-none select-none rounded-[1.75rem] border border-amber-900/20 bg-gradient-to-b from-lime-100/90 via-emerald-50 to-amber-50 p-2 shadow-inner sm:p-3"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="application"
      aria-label={
        inputMode === "swipe"
          ? "Bloom Blast — swipe a box onto its neighbor to swap and make 3 matching shapes"
          : "Bloom Blast — drag a box onto its neighbor to swap and make 3 matching shapes"
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-4 ring-amber-800/25"
      />

      <div
        className="relative grid gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((row, r) =>
          row.map((piece, c) => {
            const k = keyOf(r, c);
            const isSelected = selected?.r === r && selected?.c === c && !drag;
            const isHint = swapHint?.r === r && swapHint?.c === c;
            const isShatter = shattering.has(k);
            const isDragSource = drag?.from.r === r && drag?.from.c === c;
            const isFalling = fallingUids.has(piece.uid);
              const challengeOk = passesChallenge(piece.kind, level.challenge);
            const dimmed =
              level.challenge.type !== "none" && !challengeOk && !isSelected;
            // Size levels: keep opposite size VISIBLE so kids compare tall↔short
            const sizeCompareMode = level.challenge.type === "size";

            return (
              <button
                key={piece.uid}
                type="button"
                ref={(el) => {
                  if (el) cellEls.current.set(k, el);
                  else cellEls.current.delete(k);
                }}
                onPointerDown={(e) => onPointerDown(r, c, e)}
                disabled={!running || busy}
                className={[
                  "relative aspect-square overflow-visible rounded-2xl border-2",
                  "bg-gradient-to-br from-white/95 via-white/70 to-emerald-100/40",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_16px_rgba(15,80,40,0.12)]",
                  "transition-[transform,box-shadow,opacity] duration-200 ease-out",
                  isSelected || isHint
                    ? "z-10 scale-110 border-cyan-300 ring-2 ring-cyan-300/80"
                    : "border-white/80",
                  isShatter ? "scale-75 opacity-0" : "opacity-100",
                  isDragSource ? "opacity-25" : "",
                  dimmed
                    ? sizeCompareMode
                      ? "opacity-70"
                      : "opacity-45 grayscale-[30%]"
                    : "",
                  isFalling ? "animate-[bbDrop_0.36s_ease-out]" : "",
                ].join(" ")}
                style={
                  isSelected || isHint
                    ? {
                        boxShadow:
                          "0 0 0 2px #67e8f9, 0 0 22px #67e8f988, inset 0 1px 0 rgba(255,255,255,0.9)",
                      }
                    : undefined
                }
                aria-label={`${piece.kind.speakLabel}. ${
                  inputMode === "swipe"
                    ? "Swipe onto a neighbor to swap."
                    : "Drag onto a neighbor to swap."
                }`}
              >
                <span className="relative flex h-full w-full items-center justify-center pb-3">
                  <ShapeGlyph
                    shape={piece.kind.shape}
                    fill={piece.kind.fill}
                    glow={piece.kind.glow}
                    size={piece.kind.size}
                    sizeLabel={
                      level.challenge.type === "size"
                        ? level.challenge.sizeLabel
                        : undefined
                    }
                  />
                  {/* Size levels: keep focus tags (BIG / SHORT / TINY…) on targets */}
                  {level.challenge.type === "size" &&
                    piece.kind.size === level.challenge.size &&
                    !dimmed && (
                      <span className="pointer-events-none absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-amber-500/95 px-1 text-[0.55rem] font-black leading-tight text-white shadow-sm sm:text-[0.65rem]">
                        {level.challenge.sizeLabel ??
                          (level.challenge.size === "big" ? "BIG" : "SMALL")}
                      </span>
                    )}
                  {/* Level 5 Nature Mix — name every icon (Sun, Moon, Flower…) */}
                  {level.id === 5 && (
                    <span className="pointer-events-none absolute bottom-0.5 left-1/2 max-w-[95%] -translate-x-1/2 truncate rounded bg-emerald-700/90 px-1 text-[0.5rem] font-black uppercase leading-tight tracking-wide text-white shadow-sm sm:text-[0.6rem]">
                      {piece.kind.shapeName}
                    </span>
                  )}
                  {/* Group 2 — label every fruit / veggie / vehicle */}
                  {level.group === 2 && (
                    <span className="pointer-events-none absolute bottom-0.5 left-1/2 max-w-[95%] -translate-x-1/2 truncate rounded bg-emerald-700/90 px-1 text-[0.5rem] font-black uppercase leading-tight tracking-wide text-white shadow-sm sm:text-[0.6rem]">
                      {piece.kind.shapeName}
                    </span>
                  )}
                  {/* Group 3 — science labels; L15/L16 show word / equation text */}
                  {level.group === 3 &&
                    (level.id === 15 || level.id === 16) &&
                    piece.kind.displayWord && (
                    <span className="pointer-events-none absolute inset-x-0.5 top-1/2 -translate-y-1/2 truncate text-center text-[0.6rem] font-black leading-tight tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] sm:text-[0.7rem]">
                      {piece.kind.displayWord}
                    </span>
                  )}
                  {level.group === 3 && level.id !== 15 && level.id !== 16 && (
                    <span className="pointer-events-none absolute bottom-0.5 left-1/2 max-w-[95%] -translate-x-1/2 truncate rounded bg-indigo-800/90 px-1 text-[0.5rem] font-black uppercase leading-tight tracking-wide text-white shadow-sm sm:text-[0.6rem]">
                      {piece.kind.shapeName}
                    </span>
                  )}
                </span>
              </button>
            );
          }),
        )}
      </div>

      {/* Group 1 only — moving ghost box follows the finger (Group 2 is swipe) */}
      {inputMode === "drag" && drag && ghostStyle && (
        <div
          className="pointer-events-none absolute z-30 flex items-center justify-center rounded-2xl border-2 border-cyan-300 bg-white/95 shadow-2xl"
          style={{
            left: ghostStyle.left,
            top: ghostStyle.top,
            width: ghostStyle.width,
            height: ghostStyle.height,
            boxShadow: "0 12px 28px rgba(15,80,40,0.28), 0 0 18px #67e8f988",
            transform: "scale(1.12) rotate(-4deg)",
          }}
        >
          <ShapeGlyph
            shape={drag.piece.kind.shape}
            fill={drag.piece.kind.fill}
            glow={drag.piece.kind.glow}
            size={drag.piece.kind.size}
            sizeLabel={
              level.challenge.type === "size"
                ? level.challenge.sizeLabel
                : undefined
            }
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {shards.map((s) => (
          <span
            key={s.id}
            className="absolute h-2.5 w-2.5 rounded-sm"
            style={{
              left: s.x,
              top: s.y,
              background: s.color,
              opacity: s.life,
              transform: `translate(-50%, -50%) rotate(${(1 - s.life) * 180}deg)`,
              boxShadow: `0 0 8px ${s.color}`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bbDrop {
          0% { transform: translateY(-40%); opacity: 0.45; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
