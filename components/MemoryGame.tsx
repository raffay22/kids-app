"use client";

/** Memory match board — phonics A1–Z5 pair flip. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, RefreshCw, Sparkles, Star, Trophy } from "lucide-react";
import MemoryCard from "@/components/memory/MemoryCard";
import MotionPressable from "@/components/MotionPressable";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { burstConfetti, playBoop, playDing } from "@/utils/celebrate";
import { createClient } from "@/utils/supabase/client";
import { logProgress } from "@/utils/logProgress";
import { hideProPaywalls, isProMembership } from "@/utils/membership";
import {
  MEMORY_LAYOUTS,
  MEMORY_MISMATCH_FLIP_MS,
  STARS_PER_MEMORY_MATCH,
  buildMemoryDeck,
  getLayout,
  gridClassForLayout,
  type MemoryCardData,
  type MemoryDifficulty,
  type MemoryGridSize,
  type MemoryLayout,
} from "@/utils/memoryGame";

type Phase = "setup" | "playing" | "won";

export default function MemoryGame() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();
  const isPro = isProMembership(profile);
  const openAccess = hideProPaywalls();

  const [phase, setPhase] = useState<Phase>("setup");
  const [layoutId, setLayoutId] = useState<MemoryGridSize>("2x2");
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>("easy");
  const [layout, setLayout] = useState<MemoryLayout>(getLayout("2x2"));
  const [deck, setDeck] = useState<MemoryCardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [mismatchIds, setMismatchIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const awardedKeysRef = useRef<Set<string>>(new Set());
  const roundDoneRef = useRef(false);

  const freeLayouts = useMemo(
    () => MEMORY_LAYOUTS.filter((item) => item.freeAllowed),
    [],
  );

  const startRound = useCallback(
    (nextLayout: MemoryLayout) => {
      awardedKeysRef.current = new Set();
      roundDoneRef.current = false;
      setLayout(nextLayout);
      setLayoutId(nextLayout.id);
      setDeck(buildMemoryDeck(nextLayout.pairs, nextLayout.cols));
      setFlippedIds([]);
      setMatchedKeys([]);
      setMismatchIds([]);
      setLocked(false);
      setStarsEarned(0);
      setMessage(null);
      setPhase("playing");
      speak(`Find ${nextLayout.pairs} matching pairs!`, 0.95);
    },
    [speak],
  );

  const onStartRound = () => {
    const chosen = getLayout(layoutId);
    if (!chosen.freeAllowed && !isPro) {
      speak("That grid is locked for now!", 0.95);
      return;
    }
    startRound(chosen);
  };

  const awardMatchStars = useCallback(
    async (card: MemoryCardData) => {
      if (awardedKeysRef.current.has(card.matchKey)) return;
      awardedKeysRef.current.add(card.matchKey);
      setStarsEarned((n) => n + STARS_PER_MEMORY_MATCH);

      if (!activeChild) return;
      try {
        const supabase = createClient();
        const newStars = (activeChild.stars ?? 0) + STARS_PER_MEMORY_MATCH;
        await supabase.from("children").update({ stars: newStars }).eq("id", activeChild.id);

        if (user) {
          void logProgress({
            user_id: user.id,
            child_id: activeChild.id,
            feature_route: "/games/memory",
            attempt_type: "tap",
            target_word: `${card.letter}:${card.word}`,
            is_correct: true,
          });
        }

        await refreshChildren();
        await refreshProfile();
      } catch {
        // offline — stars sync later
      }
    },
    [activeChild, user, refreshChildren, refreshProfile],
  );

  const finishRound = useCallback(async () => {
    if (roundDoneRef.current) return;
    roundDoneRef.current = true;
    const earned = awardedKeysRef.current.size * STARS_PER_MEMORY_MATCH;
    setStarsEarned(earned);
    setPhase("won");
    burstConfetti();
    playDing();
    speak("You found every pair! Super star!", 0.95);
    setMessage(`Round complete! +${earned} stars`);

    if (user && activeChild) {
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/games/memory",
        attempt_type: "tap",
        target_word: `round_complete:${layout.id}`,
        is_correct: true,
      });
    }
  }, [activeChild, layout.id, speak, user]);

  useEffect(() => {
    if (phase !== "playing" || deck.length === 0) return;
    const totalPairs = layout.pairs;
    if (matchedKeys.length >= totalPairs) {
      const t = window.setTimeout(() => void finishRound(), 450);
      return () => window.clearTimeout(t);
    }
  }, [matchedKeys.length, deck.length, finishRound, layout.pairs, phase]);

  const onFlip = (card: MemoryCardData) => {
    if (phase !== "playing" || locked) return;
    if (matchedKeys.includes(card.matchKey)) return;
    if (flippedIds.includes(card.uid)) return;
    if (flippedIds.length >= 2) return;

    const nextFlipped = [...flippedIds, card.uid];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length < 2) return;

    const [firstId, secondId] = nextFlipped;
    const first = deck.find((c) => c.uid === firstId);
    const second = deck.find((c) => c.uid === secondId);
    if (!first || !second) return;

    setLocked(true);

    if (first.matchKey === second.matchKey) {
      playDing();
      speak(first.praiseLine, 0.92);
      setMatchedKeys((prev) => [...prev, first.matchKey]);
      setFlippedIds([]);
      setLocked(false);
      void awardMatchStars(first);
      setMessage(`Match! +${STARS_PER_MEMORY_MATCH} stars`);
      return;
    }

    playBoop();
    speak("Oops, try again!", 0.95);
    setMismatchIds([firstId, secondId]);
    window.setTimeout(() => {
      setFlippedIds([]);
      setMismatchIds([]);
      setLocked(false);
    }, MEMORY_MISMATCH_FLIP_MS);
  };

  if (phase === "setup") {
    return (
      <div className="space-y-5">
        <section className="kid-card border-amber-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-5">
          <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-amber-600">
            <Sparkles className="h-4 w-4" aria-hidden />
            Memory Match
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
            3D Tactile Memory
          </h1>
          <p className="mt-1 text-base text-slate-600">
            Flip frosted cards and match the phonics friends. Each match gives +{STARS_PER_MEMORY_MATCH}{" "}
            stars!
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {openAccess || isPro
              ? "All memory boards unlocked."
              : "Free play: 2×2 or 2×3."}
          </p>
        </section>

        <section className="kid-card space-y-3 border-sky-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-800">
            {openAccess || isPro ? "Board size" : "Free grids"}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {(openAccess || isPro
              ? [
                  { id: "2x2" as const, label: "Easy · 2×2" },
                  { id: "2x3" as const, label: "Easy · 2×3" },
                  { id: "2x4" as const, label: "Medium · 2×4" },
                  { id: "3x4" as const, label: "Hard · 3×4" },
                ]
              : freeLayouts.map((item) => ({ id: item.id, label: item.label }))
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setLayoutId(item.id);
                  if (item.id === "2x2") setDifficulty("easy");
                  if (item.id === "2x3") setDifficulty("easy");
                  if (item.id === "2x4") setDifficulty("medium");
                  if (item.id === "3x4") setDifficulty("hard");
                }}
                className={`rounded-2xl border-2 px-4 py-3 text-left font-bold transition ${
                  layoutId === item.id
                    ? "border-sky-400 bg-sky-50 text-sky-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <MotionPressable
            onClick={onStartRound}
            ariaLabel="Start memory game"
            className="btn-3d-primary flex w-full items-center justify-center gap-2 py-3 text-base"
          >
            <Sparkles className="h-5 w-5" aria-hidden />
            Start round
          </MotionPressable>
        </section>

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

  return (
    <div className="space-y-4">
      <section className="kid-card flex flex-wrap items-center justify-between gap-3 border-sky-200 bg-gradient-to-r from-sky-50 via-white to-amber-50 p-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Memory Match</p>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
            {layout.label}
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Matched {matchedKeys.length}/{layout.pairs}
            <span aria-hidden> · </span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
              +{STARS_PER_MEMORY_MATCH} / match
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MotionPressable
            onClick={() => startRound(layout)}
            ariaLabel="New shuffle"
            className="flex items-center gap-2 rounded-2xl border-b-4 border-sky-200 bg-white px-3 py-2 text-sm font-bold text-sky-700 shadow"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Shuffle
          </MotionPressable>
          <MotionPressable
            onClick={() => setPhase("setup")}
            ariaLabel="Change grid"
            className="flex items-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow"
          >
            Setup
          </MotionPressable>
        </div>
      </section>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-center text-base font-bold text-amber-700"
        >
          <Trophy className="h-5 w-5" aria-hidden />
          {message}
        </motion.p>
      )}

      <div className={`mx-auto grid max-w-3xl gap-3 ${gridClassForLayout(layout)}`}>
        {deck.map((card) => (
          <MemoryCard
            key={card.uid}
            card={card}
            flipped={flippedIds.includes(card.uid)}
            matched={matchedKeys.includes(card.matchKey)}
            mismatched={mismatchIds.includes(card.uid)}
            disabled={locked || phase === "won"}
            onFlip={() => onFlip(card)}
          />
        ))}
      </div>

      {phase === "won" && (
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <MotionPressable
            onClick={() => startRound(layout)}
            ariaLabel="Play again"
            className="btn-3d-primary flex items-center gap-2 px-5 py-3 text-base"
          >
            Play again
          </MotionPressable>
          <MotionPressable
            onClick={() => setPhase("setup")}
            ariaLabel="Choose another grid"
            className="flex items-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-700 shadow-lg"
          >
            New grid
          </MotionPressable>
        </div>
      )}
    </div>
  );
}
