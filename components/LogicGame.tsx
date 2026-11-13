"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Puzzle,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import { useAuth } from "@/components/AuthProvider";
import PatternPuzzleBoard from "@/components/logic/PatternPuzzle";
import TangramPuzzleBoard from "@/components/logic/TangramPuzzle";
import OddOneOutPuzzleBoard from "@/components/logic/OddOneOutPuzzle";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { burstConfetti, playBoop, playDing, starShower } from "@/utils/celebrate";
import { createClient } from "@/utils/supabase/client";
import { logProgress } from "@/utils/logProgress";
import { hideProPaywalls, isProUser } from "@/lib/membership";
import {
  DIFFICULTY_META,
  FREE_LOGIC_ROUNDS_PER_SESSION,
  MODE_META,
  ODD_ONE_OUT_ROUND_COUNT,
  STARS_PER_LOGIC_SOLVE,
  pickOddOneOutPuzzle,
  pickPatternPuzzle,
  pickTangramPuzzle,
  speakOddOneOutPrompt,
  type LogicDifficulty,
  type LogicMode,
  type OddOneOutPuzzle,
  type PatternPuzzle,
  type TangramPuzzle,
} from "@/utils/logicPuzzles";

type Phase = "select" | "playing" | "session-complete";

type ActivePuzzle =
  | { mode: "pattern"; data: PatternPuzzle }
  | { mode: "tangram"; data: TangramPuzzle }
  | { mode: "odd-one-out"; data: OddOneOutPuzzle };

export default function LogicGame() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();
  const isPro = isProUser(profile);
  const openAccess = hideProPaywalls();

  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<LogicMode>("pattern");
  const [difficulty, setDifficulty] = useState<LogicDifficulty>("easy");
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [puzzle, setPuzzle] = useState<ActivePuzzle | null>(null);

  const remainingFree = Math.max(0, FREE_LOGIC_ROUNDS_PER_SESSION - roundsPlayed);
  const canPlayMore = isPro || remainingFree > 0;

  const loadPuzzle = useCallback(
    (nextMode: LogicMode, nextDifficulty: LogicDifficulty) => {
      if (nextMode === "pattern") {
        const data = pickPatternPuzzle(nextDifficulty);
        setPuzzle({ mode: "pattern", data });
        speak(data.prompt, 0.95);
        return;
      }
      if (nextMode === "tangram") {
        const data = pickTangramPuzzle(nextDifficulty);
        setPuzzle({ mode: "tangram", data });
        speak(data.prompt, 0.95);
        return;
      }
      const data = pickOddOneOutPuzzle(nextDifficulty);
      setPuzzle({ mode: "odd-one-out", data });
      speak(speakOddOneOutPrompt(data), 0.95);
    },
    [speak],
  );

  const selectDifficulty = (next: LogicDifficulty) => {
    const meta = DIFFICULTY_META[next];
    if (meta.requiresPro && !isPro && !openAccess) {
      speak("Pro logic puzzles are for Pro friends ages seven to eight!", 0.95);
      router.push("/upgrade");
      return;
    }
    setDifficulty(next);
  };

  const startMode = (nextMode: LogicMode) => {
    if (DIFFICULTY_META[difficulty].requiresPro && !isPro && !openAccess) {
      speak("Pro logic puzzles are for Pro friends ages seven to eight!", 0.95);
      router.push("/upgrade");
      return;
    }
    if (!canPlayMore) {
      speak("Free friends get three puzzles each time. Upgrade for unlimited play!", 0.95);
      router.push("/upgrade");
      return;
    }
    setMode(nextMode);
    setLocked(false);
    setMessage(null);
    setPhase("playing");
    loadPuzzle(nextMode, difficulty);
  };

  const awardSolve = useCallback(async () => {
    setSessionStars((n) => n + STARS_PER_LOGIC_SOLVE);
    if (!activeChild) return;
    try {
      const supabase = createClient();
      const newStars = (activeChild.stars ?? 0) + STARS_PER_LOGIC_SOLVE;
      await supabase.from("children").update({ stars: newStars }).eq("id", activeChild.id);

      if (user) {
        void logProgress({
          user_id: user.id,
          child_id: activeChild.id,
          feature_route: "/games/logic",
          attempt_type: "tap",
          target_word: `logic_solve:${mode}`,
          is_correct: true,
        });
      }

      await refreshChildren();
      await refreshProfile();
    } catch {
      // offline — stars sync later
    }
  }, [activeChild, mode, refreshChildren, refreshProfile, user]);

  const onSolve = useCallback(() => {
    if (locked) return;
    setLocked(true);
    playDing();
    burstConfetti();
    starShower();
    speak("Brilliant! You solved the puzzle!", 0.95);
    setMessage(`Puzzle solved! +${STARS_PER_LOGIC_SOLVE} stars`);
    void awardSolve();

    const nextRounds = roundsPlayed + 1;
    setRoundsPlayed(nextRounds);

    window.setTimeout(() => {
      const stillAllowed = isPro || nextRounds < FREE_LOGIC_ROUNDS_PER_SESSION;
      if (!stillAllowed) {
        setPhase("session-complete");
        speak("Amazing session! You earned so many stars!", 0.95);
        if (user && activeChild) {
          void logProgress({
            user_id: user.id,
            child_id: activeChild.id,
            feature_route: "/games/logic",
            attempt_type: "tap",
            target_word: `session_complete:${sessionStars + STARS_PER_LOGIC_SOLVE}`,
            is_correct: true,
          });
        }
        return;
      }
      setLocked(false);
      setMessage(null);
      loadPuzzle(mode, difficulty);
    }, 1400);
  }, [
    activeChild,
    awardSolve,
    difficulty,
    isPro,
    loadPuzzle,
    locked,
    mode,
    roundsPlayed,
    sessionStars,
    speak,
    user,
  ]);

  const onMiss = useCallback(() => {
    playBoop();
    speak(
      puzzle?.mode === "odd-one-out"
        ? `Good try! Remember, three are ${puzzle.data.categoryHint}. Tap the different one!`
        : "Good try! Look closely and try again!",
      0.95,
    );
    setMessage(
      puzzle?.mode === "odd-one-out"
        ? puzzle.data.revealHint
          ? `Tip: most are ${puzzle.data.categoryHint} — pick the different one!`
          : "Tip: think about the hidden group — which picture breaks the rule?"
        : "Gentle tip: look again — no stars lost!",
    );
  }, [puzzle, speak]);

  useEffect(() => {
    if (phase === "session-complete") {
      burstConfetti();
      playDing();
    }
  }, [phase]);

  if (phase === "select") {
    return (
      <div className="min-h-screen space-y-5 bg-gradient-to-b from-indigo-50/70 via-purple-50/50 to-slate-100 pb-8">
        <section className="rounded-[1.75rem] border-4 border-white bg-white/90 p-5 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          <p className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-violet-600">
            <Puzzle className="h-4 w-4" aria-hidden />
            Cognitive Logic
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
            Logic Puzzles
          </h1>
          <p className="mt-1 text-base font-medium text-slate-600">
            Pattern, tangram, and odd-one-out — Easy, Advanced, and Pro for ages 7–8.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {openAccess || isPro
              ? "All difficulties unlocked — including Pro Challenge."
              : `Free: Easy + Advanced · ${FREE_LOGIC_ROUNDS_PER_SESSION} rounds. Pro needs membership.`}
          </p>
        </section>

        <section className="rounded-[1.5rem] border-4 border-white bg-gradient-to-r from-violet-50 to-white p-4 shadow-lg">
          <p className="mb-2 text-sm font-bold text-slate-700">Difficulty</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(Object.keys(DIFFICULTY_META) as LogicDifficulty[]).map((id) => {
              const item = DIFFICULTY_META[id];
              const lockedTier = item.requiresPro && !isPro && !openAccess;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectDifficulty(id)}
                  className={`rounded-2xl border-2 px-3 py-3 text-left ${
                    difficulty === id
                      ? "border-violet-400 bg-violet-100 text-violet-900"
                      : lockedTier
                        ? "border-slate-200 bg-slate-50 text-slate-500 opacity-80"
                        : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <span className="block text-xs font-extrabold uppercase tracking-wide opacity-70">
                    {item.ageLabel}
                  </span>
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className="mt-0.5 block text-xs font-semibold opacity-80">
                    {item.detail}
                  </span>
                  {lockedTier && (
                    <span className="mt-1 block text-[10px] font-bold text-amber-700">
                      Pro level
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(MODE_META) as LogicMode[]).map((key, index) => {
            const meta = MODE_META[key];
            return (
              <motion.button
                key={key}
                type="button"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, type: "spring", stiffness: 380, damping: 22 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93, y: 4 }}
                onClick={() => startMode(key)}
                className="rounded-[1.75rem] border-4 border-white bg-white/90 p-0 text-left shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl"
              >
                <div
                  className={`flex h-28 items-center justify-center rounded-t-[1.4rem] bg-gradient-to-br text-5xl text-white ${meta.accent}`}
                >
                  <span aria-hidden>{meta.emoji}</span>
                </div>
                <div className="space-y-1 p-4">
                  <h2 className="text-lg font-extrabold text-slate-800">{meta.title}</h2>
                  <p className="text-sm font-medium text-slate-600">{key === "odd-one-out" ? `Find which friend does not belong — ${ODD_ONE_OUT_ROUND_COUNT} fresh rounds!` : meta.blurb}</p>
                </div>
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
      <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-indigo-50/70 via-purple-50/50 to-slate-100 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-[1.75rem] border-4 border-white bg-white/95 p-6 text-center shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl"
        >
          <Trophy className="mx-auto h-12 w-12 text-amber-500" aria-hidden />
          <h2 className="mt-3 text-2xl font-extrabold text-slate-800">Star celebration!</h2>
          <p className="mt-2 text-base font-semibold text-slate-600">
            You finished this logic session.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-lg font-extrabold text-amber-800">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" aria-hidden />
            +{sessionStars} stars
          </p>
          <div className="mt-6 grid gap-3">
            <MotionPressable
              onClick={() => {
                setRoundsPlayed(0);
                setSessionStars(0);
                setPhase("select");
              }}
              ariaLabel="Back to mode select"
              className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-violet-300 bg-violet-500 px-4 py-3 text-base font-extrabold text-white shadow-lg"
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              Play modes again
            </MotionPressable>
            <MotionPressable
              onClick={() => router.push("/games")}
              ariaLabel="Back to games"
              className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-700 shadow-lg"
            >
              <Home className="h-5 w-5" aria-hidden />
              Games home
            </MotionPressable>
          </div>
        </motion.div>
      </div>
    );
  }

  const meta = MODE_META[mode];

  return (
    <div className="min-h-screen space-y-4 bg-gradient-to-b from-indigo-50/70 via-purple-50/50 to-slate-100 pb-8">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border-4 border-white bg-white/90 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-violet-600">
            {meta.emoji} {meta.title} · {DIFFICULTY_META[difficulty].label}
          </p>
          <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
            Logic round
          </h1>
          <p className="mt-0.5 text-sm font-semibold text-slate-600">
            {openAccess || isPro
              ? "Unlimited play"
              : `${remainingFree} free round${remainingFree === 1 ? "" : "s"} left`}
            <span aria-hidden> · </span>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
              session +{sessionStars}
            </span>
          </p>
        </div>
        <MotionPressable
          onClick={() => {
            setPhase("select");
            setPuzzle(null);
            setLocked(false);
          }}
          ariaLabel="Change game mode"
          className="rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow"
        >
          Modes
        </MotionPressable>
      </section>

      {message && (
        <p className="rounded-2xl bg-violet-100 px-4 py-2 text-center text-sm font-bold text-violet-800">
          {message}
        </p>
      )}

      {puzzle?.mode === "pattern" && (
        <PatternPuzzleBoard
          puzzle={puzzle.data}
          locked={locked}
          onSolve={onSolve}
          onMiss={onMiss}
        />
      )}
      {puzzle?.mode === "tangram" && (
        <TangramPuzzleBoard
          puzzle={puzzle.data}
          locked={locked}
          onSolve={onSolve}
          onMiss={onMiss}
        />
      )}
      {puzzle?.mode === "odd-one-out" && (
        <OddOneOutPuzzleBoard
          puzzle={puzzle.data}
          locked={locked}
          onSolve={onSolve}
          onMiss={onMiss}
        />
      )}

      <div className="flex justify-center pt-2">
        <MotionPressable
          onClick={() => router.push("/games")}
          ariaLabel="Back to games"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-700 shadow-lg"
        >
          <Home className="h-5 w-5" aria-hidden />
          Games home
        </MotionPressable>
      </div>
    </div>
  );
}
