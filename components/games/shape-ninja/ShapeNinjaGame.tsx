"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Sparkles, Star, Trophy } from "lucide-react";
import GameCanvas from "@/components/games/shape-ninja/GameCanvas";
import {
  getBloomLevel,
  readUnlockedLevel,
  writeUnlockedLevel,
  type BloomLevelConfig,
} from "@/components/games/shape-ninja/levelsConfig";
import { playBloomWin } from "@/components/games/shape-ninja/audio";
import { burstConfetti, starShower } from "@/utils/celebrate";
import { speakEnglish, stopKidsSpeech } from "@/utils/speech";
import { triggerHaptic } from "@/utils/haptics";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { handleGuestAward } from "@/utils/awardProgress";
import { logProgress } from "@/utils/logProgress";
import { createClient } from "@/utils/supabase/client";

const STARS_PER_NINJA_WIN = 5;

type Phase = "playing" | "won" | "lost";

export default function ShapeNinjaGame({
  initialLevelId = 1,
}: {
  initialLevelId?: number;
}) {
  const { user, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const [levelId, setLevelId] = useState(initialLevelId);
  const level = getBloomLevel(levelId) ?? getBloomLevel(1)!;
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [runKey, setRunKey] = useState(0);
  const [unlocked, setUnlocked] = useState(1);
  const phaseRef = useRef<Phase>("playing");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    setUnlocked(readUnlockedLevel());
    speakEnglish("Shape Ninja! Slash the shapes!", { rate: 0.95, pitch: 1.15 });
    return () => stopKidsSpeech();
  }, []);

  const restart = useCallback((nextLevel?: BloomLevelConfig) => {
    stopKidsSpeech();
    setScore(0);
    setMisses(0);
    phaseRef.current = "playing";
    setPhase("playing");
    if (nextLevel) setLevelId(nextLevel.id);
    setRunKey((k) => k + 1);
  }, []);

  const onScore = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    triggerHaptic(25);
    setScore((s) => {
      const next = s + 1;
      if (next >= level.targetScore) {
        phaseRef.current = "won";
        setPhase("won");
        writeUnlockedLevel(level.id + 1);
        setUnlocked(readUnlockedLevel());
        playBloomWin();
        burstConfetti();
        starShower();
        if (
          !handleGuestAward({
            userId: user?.id,
            childId: activeChild?.id,
            deltaStars: STARS_PER_NINJA_WIN,
          }) &&
          user &&
          activeChild
        ) {
          void (async () => {
            try {
              const supabase = createClient();
              await supabase
                .from("children")
                .update({ stars: (activeChild.stars ?? 0) + STARS_PER_NINJA_WIN })
                .eq("id", activeChild.id);
              void logProgress({
                user_id: user.id,
                child_id: activeChild.id,
                feature_route: "/games/shape-ninja",
                attempt_type: "tap",
                target_word: `shape_ninja_level_${level.id}`,
                is_correct: true,
              });
              await refreshChildren();
              await refreshProfile();
            } catch {
              // offline
            }
          })();
        }
        speakEnglish("You win! Amazing blast!", { rate: 0.95, pitch: 1.2 });
      }
      return next;
    });
  }, [activeChild, level.id, level.targetScore, refreshChildren, refreshProfile, user]);

  const onMiss = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    setMisses((m) => {
      const next = m + 1;
      if (next >= level.maxMisses) {
        phaseRef.current = "lost";
        setPhase("lost");
        speakEnglish("Try again! You can do it!", { rate: 0.95, pitch: 1.1 });
      }
      return next;
    });
  }, [level.maxMisses]);

  const livesLeft = Math.max(0, level.maxMisses - misses);
  const nextLevel = getBloomLevel(level.id + 1);
  const canGoNext = Boolean(nextLevel?.enabled) && unlocked >= level.id + 1;

  if (!level.enabled) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-white/20 bg-slate-900/80 p-6 text-center text-white backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Level {levelId} locked</h1>
        <p className="mt-2 text-sm text-indigo-100">
          This sub-level arrives in a later update. Play Level 1 for now!
        </p>
        <button
          type="button"
          onClick={() => restart(getBloomLevel(1))}
          className="mt-4 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-900"
        >
          Play Level 1
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-bold text-white backdrop-blur-md"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Games
        </Link>
        <div className="rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-cyan-100 backdrop-blur-md">
          Group {level.group} · Level {level.id}/15
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-white/25 bg-white/10 p-3 shadow-xl backdrop-blur-xl sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-200">
              Shape Ninja ⚔️
            </p>
            <h1 className="text-xl font-black text-white sm:text-2xl">
              {level.title}
            </h1>
            <p className="mt-0.5 text-sm font-medium text-indigo-100">
              {level.blurb}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-extrabold text-white backdrop-blur-md">
              <Star className="h-4 w-4 text-amber-300" aria-hidden />
              {score}/{level.targetScore}
            </div>
            <div className="flex items-center gap-1 rounded-2xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-extrabold text-white backdrop-blur-md">
              {Array.from({ length: level.maxMisses }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-4 w-4 ${
                    i < livesLeft ? "fill-rose-400 text-rose-400" : "text-white/25"
                  }`}
                  aria-hidden
                />
              ))}
              <span className="sr-only">{livesLeft} lives left</span>
            </div>
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 shadow-[0_20px_60px_rgba(15,23,42,0.45)]">
        <GameCanvas
          key={runKey}
          level={level}
          running={phase === "playing"}
          onScore={onScore}
          onMiss={onMiss}
        />

        {phase === "won" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-white/30 bg-white/15 p-6 text-center text-white shadow-2xl backdrop-blur-xl">
              <Trophy className="mx-auto h-10 w-10 text-amber-300" aria-hidden />
              <h2 className="mt-2 text-2xl font-black">Level Clear!</h2>
              <p className="mt-1 text-sm text-indigo-100">
                You blasted {level.targetScore} shapes. Awesome!
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {canGoNext ? (
                  <button
                    type="button"
                    onClick={() => restart(nextLevel!)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-extrabold text-slate-900"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Next Level
                  </button>
                ) : (
                  <p className="rounded-2xl bg-indigo-500/30 px-3 py-2 text-xs font-semibold text-indigo-100">
                    Level {level.id + 1} arrives in the next update. Replay Level{" "}
                    {level.id} anytime!
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => restart(level)}
                  className="rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "lost" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-white/30 bg-white/15 p-6 text-center text-white shadow-2xl backdrop-blur-xl">
              <h2 className="text-2xl font-black">Try Again!</h2>
              <p className="mt-1 text-sm text-indigo-100">
                Three shapes floated away — slash a little faster next time.
              </p>
              <button
                type="button"
                onClick={() => restart(level)}
                className="mt-5 w-full rounded-2xl bg-rose-400 px-4 py-3 text-sm font-extrabold text-slate-900"
              >
                Restart Level {level.id}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs font-semibold text-indigo-200/90">
        Swipe across shapes · Hear “Red Circle… BOOM!” · Score {level.targetScore}{" "}
        to win
      </p>
    </div>
  );
}
