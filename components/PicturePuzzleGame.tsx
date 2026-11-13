"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type PanInfo } from "framer-motion";
import { Frame, Home, Sparkles, Star, Trophy } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import PuzzleStillTile from "@/components/picture-puzzle/PuzzleStillTile";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import {
  burstConfetti,
  playBoop,
  playDing,
  playPop,
  starShower,
} from "@/utils/celebrate";
import { createClient } from "@/utils/supabase/client";
import { logProgress } from "@/utils/logProgress";
import { hideProPaywalls, isProUser } from "@/lib/membership";
import {
  FREE_PICTURE_PUZZLE_ROUNDS,
  GRID_META,
  PICTURE_SNAP_RADIUS_PX,
  STARS_PER_PICTURE_PUZZLE,
  buildPieceCoords,
  pickPicturePuzzle,
  type PictureGridSize,
  type PicturePuzzleRound,
} from "@/utils/picturePuzzle";

type Phase = "select" | "playing" | "session-complete";

export default function PicturePuzzleGame() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();
  const isPro = isProUser(profile);
  const openAccess = hideProPaywalls();

  const [phase, setPhase] = useState<Phase>("select");
  const [gridSize, setGridSize] = useState<PictureGridSize>("2x2");
  const [round, setRound] = useState<PicturePuzzleRound | null>(null);
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const completingRef = useRef(false);

  const remainingFree = Math.max(0, FREE_PICTURE_PUZZLE_ROUNDS - roundsPlayed);
  const canPlayMore = openAccess || isPro || remainingFree > 0;

  const coords = useMemo(
    () => (round ? buildPieceCoords(round.grid) : []),
    [round],
  );

  const trayPieces = useMemo(() => {
    if (!round) return [];
    return round.pieceIds.filter((id) => !placed[id]);
  }, [round, placed]);

  const loadRound = useCallback(
    (size: PictureGridSize) => {
      const next = pickPicturePuzzle(size);
      setRound(next);
      setPlaced({});
      setSelectedId(null);
      setWiggleId(null);
      setComplete(false);
      setLocked(false);
      completingRef.current = false;
      setMessage(`Look at the picture, then build ${next.item.word}!`);
      speak(`Look at the picture, then build ${next.item.word}!`, 0.95);
    },
    [speak],
  );

  const startGrid = (size: PictureGridSize) => {
    const meta = GRID_META[size];
    if (!meta.freeAllowed && !isPro && !openAccess) {
      speak("Advanced eight piece puzzles are for Pro friends!", 0.95);
      router.push("/upgrade");
      return;
    }
    if (!canPlayMore) {
      speak(
        "Free friends get three picture puzzles each time. Upgrade for unlimited play!",
        0.95,
      );
      router.push("/upgrade");
      return;
    }
    setGridSize(size);
    setPhase("playing");
    loadRound(size);
  };

  const awardSolve = useCallback(async () => {
    setSessionStars((n) => n + STARS_PER_PICTURE_PUZZLE);
    if (!activeChild || !round) return;
    try {
      const supabase = createClient();
      const newStars = (activeChild.stars ?? 0) + STARS_PER_PICTURE_PUZZLE;
      await supabase.from("children").update({ stars: newStars }).eq("id", activeChild.id);
      if (user) {
        void logProgress({
          user_id: user.id,
          child_id: activeChild.id,
          feature_route: "/games/picture-puzzle",
          attempt_type: "tap",
          target_word: `picture_puzzle:${round.item.id}`,
          is_correct: true,
        });
      }
      await refreshChildren();
      await refreshProfile();
    } catch {
      // offline
    }
  }, [activeChild, refreshChildren, refreshProfile, round, user]);

  const finishPuzzle = useCallback(() => {
    if (!round || completingRef.current) return;
    completingRef.current = true;
    setComplete(true);
    setLocked(true);
    playDing();
    burstConfetti();
    starShower();
    speak(`Awesome job! You built the 3D ${round.item.word}!`, 0.95);
    setMessage(`Awesome! +${STARS_PER_PICTURE_PUZZLE} stars`);
    void awardSolve();

    const nextRounds = roundsPlayed + 1;
    setRoundsPlayed(nextRounds);

    window.setTimeout(() => {
      const stillAllowed =
        openAccess || isPro || nextRounds < FREE_PICTURE_PUZZLE_ROUNDS;
      if (!stillAllowed) {
        setPhase("session-complete");
        speak("Amazing picture session!", 0.95);
        return;
      }
      loadRound(gridSize);
    }, 2200);
  }, [
    awardSolve,
    gridSize,
    isPro,
    loadRound,
    openAccess,
    round,
    roundsPlayed,
    speak,
  ]);

  const tryPlace = useCallback(
    (pieceId: string, point?: { x: number; y: number }) => {
      if (locked || !round || placed[pieceId]) return false;
      const slot = slotRefs.current[pieceId];
      if (!slot) return false;

      if (point) {
        const rect = slot.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        const dist = Math.hypot(point.x - center.x, point.y - center.y);
        if (dist > PICTURE_SNAP_RADIUS_PX) {
          let overWrong = false;
          for (const c of coords) {
            if (c.id === pieceId) continue;
            const other = slotRefs.current[c.id];
            if (!other) continue;
            const r = other.getBoundingClientRect();
            const oc = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            if (
              Math.hypot(point.x - oc.x, point.y - oc.y) <=
              PICTURE_SNAP_RADIUS_PX + 28
            ) {
              overWrong = true;
              break;
            }
          }
          if (overWrong || dist < 140) {
            setWiggleId(pieceId);
            window.setTimeout(() => setWiggleId(null), 400);
            playBoop();
            speak("Try putting it in another slot!", 0.95);
            setMessage("Try putting it in another slot!");
          }
          return false;
        }
      }

      playPop();
      setSelectedId(null);
      setPlaced((prev) => {
        const next = { ...prev, [pieceId]: true };
        const done = coords.every((c) => next[c.id]);
        if (done) window.setTimeout(() => finishPuzzle(), 180);
        return next;
      });
      return true;
    },
    [coords, finishPuzzle, locked, placed, round, speak],
  );

  const onDragEnd = (pieceId: string, info: PanInfo) => {
    tryPlace(pieceId, { x: info.point.x, y: info.point.y });
  };

  const onSlotTap = (slotId: string) => {
    if (!selectedId) return;
    if (selectedId === slotId) {
      tryPlace(selectedId);
      return;
    }
    setWiggleId(selectedId);
    window.setTimeout(() => setWiggleId(null), 400);
    setSelectedId(null);
    playBoop();
    speak("Try putting it in another slot!", 0.95);
    setMessage("Try putting it in another slot!");
  };

  useEffect(() => {
    completingRef.current = false;
  }, [round?.item.id]);

  if (phase === "select") {
    return (
      <div className="min-h-screen space-y-5 bg-gradient-to-b from-sky-50 via-violet-50 to-amber-50 p-4 pb-8">
        <section className="rounded-[1.75rem] border-4 border-white bg-white/90 p-5 shadow-2xl backdrop-blur-xl">
          <p className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-violet-600">
            <Frame className="h-4 w-4" aria-hidden />
            3D Picture Frame
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
            Picture Puzzle
          </h1>
          <p className="mt-1 text-base font-medium text-slate-600">
            Real cardboard-style puzzles with phonics pictures — look at the
            target, then build it yourself.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {openAccess || isPro
              ? "Basic 4-piece and Advanced 8-piece boards unlocked."
              : `Free: Basic 4-piece · ${FREE_PICTURE_PUZZLE_ROUNDS} puzzles per session.`}
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(GRID_META) as PictureGridSize[]).map((key, index) => {
            const meta = GRID_META[key];
            const lockedGrid = !meta.freeAllowed && !isPro && !openAccess;
            return (
              <motion.button
                key={key}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ scale: lockedGrid ? 1 : 1.03 }}
                whileTap={{ scale: lockedGrid ? 1 : 0.95 }}
                onClick={() => startGrid(key)}
                className={`rounded-[1.75rem] border-4 border-white bg-white/90 p-5 text-left shadow-xl ${
                  lockedGrid ? "opacity-60" : ""
                }`}
              >
                <p className="text-sm font-extrabold uppercase tracking-wide text-sky-600">
                  {meta.pieces} pieces · {meta.poolSize} pictures
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-800">
                  {meta.title}
                </h2>
                <p className="text-sm font-medium text-slate-600">{meta.blurb}</p>
                {lockedGrid && (
                  <p className="mt-2 text-xs font-bold text-amber-700">Pro board</p>
                )}
              </motion.button>
            );
          })}
        </div>

        <MotionPressable
          onClick={() => router.push("/games")}
          ariaLabel="Back to games"
          className="mx-auto flex items-center justify-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-700 shadow-lg"
        >
          <Home className="h-5 w-5" aria-hidden />
          Games home
        </MotionPressable>
      </div>
    );
  }

  if (phase === "session-complete") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-b from-sky-50 to-violet-100 p-6 text-center">
        <Trophy className="h-16 w-16 text-amber-500" aria-hidden />
        <h1 className="text-3xl font-extrabold text-slate-800">Frame stars earned!</h1>
        <p className="text-lg font-bold text-slate-600">
          Session total: {sessionStars} stars
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <MotionPressable
            onClick={() => {
              setRoundsPlayed(0);
              setSessionStars(0);
              setPhase("select");
            }}
            ariaLabel="Play again"
            className="rounded-2xl border-b-4 border-violet-500 bg-violet-400 px-5 py-3 text-base font-extrabold text-white shadow-lg"
          >
            Play again
          </MotionPressable>
          <MotionPressable
            onClick={() => router.push("/games")}
            ariaLabel="Games home"
            className="rounded-2xl border-b-4 border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-700 shadow-lg"
          >
            Games home
          </MotionPressable>
        </div>
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-gradient-to-b from-sky-50 via-violet-50 to-amber-50 p-3 pb-8 sm:gap-4 sm:p-4">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border-4 border-white bg-white/90 px-3 py-2 shadow-lg sm:px-4 sm:py-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-violet-600">
            {GRID_META[round.grid].pieces} pieces · {round.item.word}
          </p>
          <p className="text-sm font-bold text-slate-600">
            {!openAccess && !isPro ? `${remainingFree} free left` : "Unlimited play"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-900">
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden />
          {sessionStars}
        </span>
      </header>

      {message && (
        <p className="shrink-0 rounded-2xl bg-violet-50 px-3 py-2 text-center text-sm font-bold text-violet-800">
          <Sparkles className="mr-1 inline h-4 w-4" aria-hidden />
          {message}
        </p>
      )}

      {/* SECTION 1 — small target preview (complete picture) */}
      <section className="mx-auto w-full max-w-md shrink-0 rounded-[1.35rem] border-4 border-white bg-white/80 p-2 shadow-xl backdrop-blur-xl sm:p-3">
        <p className="mb-1.5 text-center text-[10px] font-extrabold uppercase tracking-wide text-sky-700 sm:text-xs">
          Target picture
        </p>
        <div className="mx-auto aspect-[4/3] max-h-28 overflow-hidden rounded-2xl border-2 border-sky-100 bg-slate-100 shadow-inner sm:max-h-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={round.item.imageSrc}
            alt={`Target ${round.item.word}`}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </section>

      {/* SECTION 2 — build board (~30% smaller than original flex board) */}
      <motion.section
        animate={
          complete
            ? {
                scale: [1, 1.06, 1],
                boxShadow: [
                  "0 0 0 0 rgba(251,191,36,0)",
                  "0 0 40px 12px rgba(251,191,36,0.55)",
                  "0 0 18px 4px rgba(251,191,36,0.35)",
                ],
              }
            : { scale: 1 }
        }
        transition={{ duration: 0.7 }}
        className="mx-auto w-full max-w-xl shrink-0 rounded-[1.75rem] border-4 border-amber-100 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 p-3 shadow-2xl sm:p-4"
      >
        <p className="mb-2 text-center text-xs font-extrabold uppercase tracking-wide text-amber-800 sm:text-sm">
          Build board · empty like real cardboard
        </p>
        <div
          className="mx-auto grid gap-1.5 rounded-[1.25rem] bg-[#d6b48a]/55 p-2 shadow-[inset_0_8px_20px_rgba(90,50,20,0.18)] sm:gap-2 sm:p-3"
          style={{
            gridTemplateColumns: `repeat(${round.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${round.rows}, minmax(0, 1fr))`,
            // ~70% of the original large board (only ~30% smaller)
            width:
              round.grid === "2x2"
                ? "min(100%, 17.5rem)"
                : "min(100%, 26rem)",
            aspectRatio: round.grid === "2x2" ? "1 / 1" : "2 / 1",
          }}
        >
          {coords.map((c) => {
            const isPlaced = Boolean(placed[c.id]);
            return (
              <button
                key={`slot-${c.id}`}
                type="button"
                ref={(el) => {
                  slotRefs.current[c.id] = el;
                }}
                onClick={() => onSlotTap(c.id)}
                aria-label={`Empty puzzle slot ${c.row + 1},${c.col + 1}`}
                className="relative min-h-0 overflow-hidden rounded-lg border-2 border-dashed border-amber-700/35 bg-[#c9a679]/40 shadow-[inset_0_4px_10px_rgba(80,40,10,0.15)] sm:rounded-xl"
              >
                {isPlaced && (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 overflow-hidden rounded-[0.65rem] border-2 border-white shadow-[0_8px_16px_rgba(0,0,0,0.18)] sm:rounded-xl"
                  >
                    <PuzzleStillTile
                      imageSrc={round.item.imageSrc}
                      rows={round.rows}
                      cols={round.cols}
                      row={c.row}
                      col={c.col}
                      alt={`${round.item.word} piece`}
                    />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* SECTION 3 — compact piece tray */}
      <section className="shrink-0">
        <p className="mb-2 text-center text-sm font-bold text-slate-700">
          Puzzle pieces · drag to the board, or tap piece then tap a slot
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
          {trayPieces.map((pieceId) => {
            const coord = coords.find((c) => c.id === pieceId)!;
            return (
              <motion.button
                key={pieceId}
                type="button"
                disabled={locked}
                drag={!locked}
                dragSnapToOrigin
                dragMomentum={false}
                dragElastic={0.12}
                onDragEnd={(_, info) => onDragEnd(pieceId, info)}
                onClick={() =>
                  setSelectedId((s) => (s === pieceId ? null : pieceId))
                }
                animate={{
                  x: wiggleId === pieceId ? [-5, 5, -5, 0] : 0,
                  scale: selectedId === pieceId ? 1.08 : 1,
                }}
                transition={{ x: { duration: 0.35 } }}
                whileDrag={{ scale: 1.12, zIndex: 40 }}
                whileTap={{ scale: 0.94 }}
                className={`relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border-4 bg-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] sm:h-20 sm:w-20 ${
                  selectedId === pieceId
                    ? "border-amber-400 ring-4 ring-amber-200"
                    : "border-white"
                }`}
                aria-label={`Puzzle piece ${coord.row + 1},${coord.col + 1}`}
              >
                <PuzzleStillTile
                  imageSrc={round.item.imageSrc}
                  rows={round.rows}
                  cols={round.cols}
                  row={coord.row}
                  col={coord.col}
                  alt=""
                />
              </motion.button>
            );
          })}
        </div>
      </section>

      <div className="flex shrink-0 flex-wrap justify-center gap-3 pt-1">
        <MotionPressable
          onClick={() => setPhase("select")}
          ariaLabel="Change board size"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
        >
          Boards
        </MotionPressable>
        <MotionPressable
          onClick={() => router.push("/games")}
          ariaLabel="Back to games"
          className="flex items-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-700 shadow-lg"
        >
          <Home className="h-5 w-5" aria-hidden />
          Games home
        </MotionPressable>
      </div>
    </div>
  );
}
