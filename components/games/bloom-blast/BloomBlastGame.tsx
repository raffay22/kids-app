"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import BloomBoard from "@/components/games/bloom-blast/BloomBoard";
import {
  BLOOM_AGE_GROUPS,
  beginPlaySession,
  boomVoiceLabel,
  getBloomLevel,
  getLevelsForGroup,
  readUnlockedLevel,
  writeUnlockedLevel,
  type BloomAgeGroup,
  type BloomLevelConfig,
  type BloomTileKind,
} from "@/components/games/bloom-blast/levelsConfig";
import { playBloomWin } from "@/components/games/bloom-blast/audio";
import { burstConfetti, starShower } from "@/utils/celebrate";
import { stopBloomSpeech } from "@/components/games/bloom-blast/speech";
import { speakEnglish, stopKidsSpeech } from "@/utils/speech";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { handleGuestAward } from "@/utils/awardProgress";
import { logProgress } from "@/utils/logProgress";
import { createClient } from "@/utils/supabase/client";

const STARS_PER_BLOOM_WIN = 5;

type Screen = "group" | "levels" | "play";
type Phase = "playing" | "won";

export default function BloomBlastGame() {
  const { user, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const [screen, setScreen] = useState<Screen>("group");
  const [group, setGroup] = useState<BloomAgeGroup | null>(null);
  const [levelId, setLevelId] = useState(1);
  const [sessionLevel, setSessionLevel] = useState<BloomLevelConfig | null>(
    null,
  );
  const [unlocked, setUnlocked] = useState(1);
  const [matches, setMatches] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [runKey, setRunKey] = useState(0);
  const [lastBoom, setLastBoom] = useState<string | null>(null);
  const phaseRef = useRef<Phase>("playing");

  const level: BloomLevelConfig =
    sessionLevel ?? getBloomLevel(levelId) ?? getBloomLevel(1)!;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    setUnlocked(readUnlockedLevel());
    speakEnglish("Bloom Blast! Pick your age group!", {
      rate: 0.95,
      pitch: 1.15,
    });

    // Chrome can loop TTS in background tabs — stop voice when hidden/leaving.
    const silence = () => {
      stopBloomSpeech();
      stopKidsSpeech();
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") silence();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", silence);

    return () => {
      silence();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", silence);
    };
  }, []);

  const groupLevels = useMemo(
    () => (group ? getLevelsForGroup(group.id) : []),
    [group],
  );

  const startLevel = useCallback((id: number) => {
    stopKidsSpeech();
    // Rotate color / size learning focus each play (all groups)
    const cfg = beginPlaySession(id);
    setLevelId(id);
    setSessionLevel(cfg);
    setMatches(0);
    setLastBoom(null);
    phaseRef.current = "playing";
    setPhase("playing");
    setRunKey((k) => k + 1);
    setScreen("play");
    const focus =
      cfg.challenge.type === "color"
        ? `Blast only ${cfg.challenge.colorKey}!`
        : cfg.challenge.type === "size"
          ? `Blast only ${cfg.challenge.sizeLabel ?? cfg.challenge.size}!`
          : cfg.challenge.type === "category" ||
              cfg.challenge.type === "colorCategory" ||
              cfg.challenge.type === "plantPart" ||
              cfg.challenge.type === "living" ||
              cfg.challenge.type === "matter" ||
              cfg.challenge.type === "speechPart" ||
              cfg.challenge.type === "mathTarget"
            ? cfg.challenge.banner
            : cfg.group >= 2
              ? "Swipe the boxes to make three!"
              : "Move the boxes to make three!";
    speakEnglish(`${cfg.title}! ${focus}`, {
      rate: 0.95,
      pitch: 1.15,
    });
  }, []);

  const restart = useCallback(() => {
    startLevel(levelId);
  }, [levelId, startLevel]);

  const onMatch = useCallback(
    (tile: BloomTileKind) => {
      if (phaseRef.current !== "playing") return;
      const voice = boomVoiceLabel(level, tile);
      setLastBoom(`${voice}… BOOM!`);
      setMatches((m) => {
        const next = m + 1;
        if (next >= level.targetMatches) {
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
              deltaStars: STARS_PER_BLOOM_WIN,
            }) &&
            user &&
            activeChild
          ) {
            void (async () => {
              try {
                const supabase = createClient();
                await supabase
                  .from("children")
                  .update({ stars: (activeChild.stars ?? 0) + STARS_PER_BLOOM_WIN })
                  .eq("id", activeChild.id);
                void logProgress({
                  user_id: user.id,
                  child_id: activeChild.id,
                  feature_route: "/games/bloom-blast",
                  attempt_type: "tap",
                  target_word: `bloom_level_${level.id}`,
                  is_correct: true,
                });
                await refreshChildren();
                await refreshProfile();
              } catch {
                // offline
              }
            })();
          }
          window.setTimeout(() => {
            speakEnglish("You win! Amazing bloom blast!", {
              rate: 0.95,
              pitch: 1.2,
            });
          }, 700);
        }
        return next;
      });
    },
    [activeChild, level, refreshChildren, refreshProfile, user],
  );

  const nextLevel = getBloomLevel(level.id + 1);
  const canGoNext =
    Boolean(nextLevel?.enabled) &&
    nextLevel?.group === level.group &&
    unlocked >= level.id + 1;

  /* ——— Age group select ——— */
  if (screen === "group") {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-800/15 bg-white/80 px-3 py-2 text-sm font-bold text-emerald-900 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Games
          </Link>
        </div>

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 text-center shadow-xl backdrop-blur-xl">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
            Bloom Blast
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Pick your age group
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Start with Tiny Explorers — more groups unlock later!
          </p>
        </section>

        <div className="grid gap-3">
          {BLOOM_AGE_GROUPS.map((g) => {
            const locked = !g.enabled;
            return (
              <button
                key={g.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  setGroup(g);
                  setScreen("levels");
                  speakEnglish(`${g.title}! Pick a level!`, {
                    rate: 0.95,
                    pitch: 1.15,
                  });
                }}
                className={[
                  "rounded-[1.5rem] border-4 p-4 text-left shadow-lg transition",
                  locked
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
                    : "border-white bg-gradient-to-br from-lime-50 to-emerald-100 hover:scale-[1.01]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                      Group {g.id} · {g.ages}
                    </p>
                    <h2 className="text-xl font-black text-slate-900">
                      {g.title}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {g.blurb}
                    </p>
                  </div>
                  {locked ? (
                    <Lock className="h-6 w-6 shrink-0 text-slate-400" aria-hidden />
                  ) : (
                    <Sparkles className="h-6 w-6 shrink-0 text-amber-500" aria-hidden />
                  )}
                </div>
                {locked && (
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Coming soon
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ——— Level select inside group ——— */
  if (screen === "levels" && group) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setScreen("group");
              setGroup(null);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-800/15 bg-white/80 px-3 py-2 text-sm font-bold text-emerald-900 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Age groups
          </button>
          <div className="rounded-2xl border border-emerald-800/15 bg-white/80 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
            {group.title}
          </div>
        </div>

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 text-center shadow-xl">
          <h1 className="text-2xl font-black text-slate-900">
            {group.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {group.ages} · Clear a level to unlock the next
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-1">
          {groupLevels.map((lv) => {
            const locked = !lv.enabled || unlocked < lv.id;
            return (
              <button
                key={lv.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (!locked) startLevel(lv.id);
                }}
                className={[
                  "rounded-[1.35rem] border-4 p-4 text-left shadow-md transition",
                  locked
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-65"
                    : "border-emerald-200 bg-white hover:border-emerald-400",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-600">
                      Level {lv.groupLevel} of {groupLevels.length}
                    </p>
                    <h2 className="text-lg font-black text-slate-900">
                      {lv.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-600">{lv.blurb}</p>
                  </div>
                  {locked ? (
                    <Lock className="h-5 w-5 text-slate-400" aria-hidden />
                  ) : (
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ——— Play ——— */
  const progress = Math.min(1, matches / level.targetMatches);
  const challengeBanner =
    level.challenge.type === "none" ? null : level.challenge.banner;

  return (
    <div className="relative mx-auto max-w-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            stopKidsSpeech();
            setScreen("levels");
            setPhase("playing");
            setMatches(0);
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-800/15 bg-white/80 px-3 py-2 text-sm font-bold text-emerald-900 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Levels
        </button>
        <div className="rounded-2xl border border-emerald-800/15 bg-white/80 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800 shadow-sm">
          Group {level.group} · Level {level.groupLevel}/
          {getLevelsForGroup(level.group).length}
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/75 p-3 shadow-xl backdrop-blur-xl sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
              Bloom Blast
            </p>
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
              {level.title}
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {level.blurb}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm font-extrabold text-amber-800">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            {matches}/{level.targetMatches}
          </div>
        </div>

        {challengeBanner && (
          <div className="mt-3 rounded-2xl bg-sky-500 px-3 py-2 text-center text-sm font-extrabold text-white shadow">
            {challengeBanner}
          </div>
        )}

        <div className="mt-3">
          <div
            className="h-3 overflow-hidden rounded-full bg-emerald-100"
            role="progressbar"
            aria-valuenow={matches}
            aria-valuemin={0}
            aria-valuemax={level.targetMatches}
            aria-label="Blast progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-lime-400 transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          {lastBoom && (
            <p className="mt-2 text-center text-sm font-extrabold text-rose-500">
              {lastBoom}
            </p>
          )}
        </div>
      </section>

      <div className="relative">
        <BloomBoard
          key={runKey}
          level={level}
          running={phase === "playing"}
          onMatch={onMatch}
        />

        {phase === "won" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[1.75rem] bg-slate-950/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/95 p-6 text-center shadow-2xl">
              <Trophy className="mx-auto h-10 w-10 text-amber-500" aria-hidden />
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Level Clear!
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                You made {level.targetMatches} blasts. Awesome!
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {canGoNext && nextLevel && (
                  <button
                    type="button"
                    onClick={() => startLevel(nextLevel.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-extrabold text-white"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Next: {nextLevel.title}
                  </button>
                )}
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-white"
                >
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={() => setScreen("levels")}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  Back to Levels
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs font-semibold text-emerald-900/70">
        Drag a box onto its neighbor to swap · make 3 matching shapes · BOOM!
      </p>
    </div>
  );
}
