"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calculator, Home, Sparkles, Star, Trophy } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import { useAuth } from "@/components/AuthProvider";
import ToddlerVisualMath from "@/components/math/ToddlerVisualMath";
import ExplorerCoinMath from "@/components/math/ExplorerCoinMath";
import ProMathChallenge from "@/components/math/ProMathChallenge";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { burstConfetti, playBoop, playDing, starShower } from "@/utils/celebrate";
import { createClient } from "@/utils/supabase/client";
import { logProgress } from "@/utils/logProgress";
import { hideProPaywalls, isProUser } from "@/lib/membership";
import {
  AGE_MODE_META,
  FREE_MATH_ROUNDS_PER_SESSION,
  STARS_PER_MATH_SOLVE,
  pickExplorerPuzzle,
  pickProPuzzle,
  pickToddlerPuzzle,
  speakExplorerSolve,
  speakProSolve,
  speakToddlerSolve,
  type ExplorerPuzzle,
  type MathAgeMode,
  type ProPuzzle,
  type ToddlerPuzzle,
} from "@/utils/mathLab";

type Phase = "select" | "playing" | "session-complete";

type ActivePuzzle =
  | { mode: "toddler"; data: ToddlerPuzzle }
  | { mode: "explorer"; data: ExplorerPuzzle }
  | { mode: "pro"; data: ProPuzzle };

export default function MathLabGame() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();
  const isPro = isProUser(profile);
  const openAccess = hideProPaywalls();

  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<MathAgeMode>("toddler");
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [puzzle, setPuzzle] = useState<ActivePuzzle | null>(null);

  const remainingFree = Math.max(0, FREE_MATH_ROUNDS_PER_SESSION - roundsPlayed);
  const canPlayMore = openAccess || isPro || remainingFree > 0;

  const loadPuzzle = useCallback(
    (nextMode: MathAgeMode) => {
      if (nextMode === "toddler") {
        const data = pickToddlerPuzzle();
        setPuzzle({ mode: "toddler", data });
        speak(data.prompt, 0.95);
        return;
      }
      if (nextMode === "pro") {
        const data = pickProPuzzle();
        setPuzzle({ mode: "pro", data });
        speak(data.prompt, 0.95);
        return;
      }
      const data = pickExplorerPuzzle();
      setPuzzle({ mode: "explorer", data });
      speak(data.prompt, 0.95);
    },
    [speak],
  );

  const startMode = (nextMode: MathAgeMode) => {
    const meta = AGE_MODE_META[nextMode];
    if (meta.requiresPro && !isPro && !openAccess) {
      speak("Pro Challenge Math is for Pro friends ages seven to eight!", 0.95);
      router.push("/upgrade");
      return;
    }
    if (!canPlayMore) {
      speak("Free friends get three math rounds each time. Upgrade for unlimited play!", 0.95);
      router.push("/upgrade");
      return;
    }
    setMode(nextMode);
    setLocked(false);
    setMessage(null);
    setPhase("playing");
    loadPuzzle(nextMode);
  };

  const awardSolve = useCallback(async () => {
    setSessionStars((n) => n + STARS_PER_MATH_SOLVE);
    if (!activeChild) return;
    try {
      const supabase = createClient();
      const newStars = (activeChild.stars ?? 0) + STARS_PER_MATH_SOLVE;
      await supabase.from("children").update({ stars: newStars }).eq("id", activeChild.id);

      if (user) {
        void logProgress({
          user_id: user.id,
          child_id: activeChild.id,
          feature_route: "/games/math",
          attempt_type: "tap",
          target_word: `math_solve:${mode}`,
          is_correct: true,
        });
      }

      await refreshChildren();
      await refreshProfile();
    } catch {
      // offline — stars sync later
    }
  }, [activeChild, mode, refreshChildren, refreshProfile, user]);

  const onSolve = useCallback(
    (choice: number) => {
      if (locked || !puzzle) return;
      setLocked(true);
      playDing();
      burstConfetti();
      starShower();

      const line =
        puzzle.mode === "toddler"
          ? speakToddlerSolve(puzzle.data)
          : puzzle.mode === "pro"
            ? speakProSolve(puzzle.data)
            : speakExplorerSolve(puzzle.data);
      speak(line, 0.95);
      setMessage(`Correct ${choice}! +${STARS_PER_MATH_SOLVE} stars`);
      void awardSolve();

      const nextRounds = roundsPlayed + 1;
      setRoundsPlayed(nextRounds);

      window.setTimeout(() => {
        const stillAllowed =
          openAccess || isPro || nextRounds < FREE_MATH_ROUNDS_PER_SESSION;
        if (!stillAllowed) {
          setPhase("session-complete");
          speak("Amazing math session! You earned so many stars!", 0.95);
          if (user && activeChild) {
            void logProgress({
              user_id: user.id,
              child_id: activeChild.id,
              feature_route: "/games/math",
              attempt_type: "tap",
              target_word: `session_complete:${sessionStars + STARS_PER_MATH_SOLVE}`,
              is_correct: true,
            });
          }
          return;
        }
        setLocked(false);
        setMessage(null);
        loadPuzzle(mode);
      }, 1600);
    },
    [
      activeChild,
      awardSolve,
      isPro,
      loadPuzzle,
      locked,
      mode,
      openAccess,
      puzzle,
      roundsPlayed,
      sessionStars,
      speak,
      user,
    ],
  );

  const onMiss = useCallback(
    (coach?: string) => {
      playBoop();
      const line =
        coach ?? "Good try! Let's count them together again!";
      speak(line, 0.95);
      setMessage(coach ?? "Gentle tip: count again — no stars lost!");
    },
    [speak],
  );

  const onCountSpeak = useCallback(
    (n: number) => {
      speak(`${n}!`, 1.0);
    },
    [speak],
  );

  const onCoachSpeak = useCallback(
    (line: string) => {
      speak(line, 0.95);
      setMessage(line);
    },
    [speak],
  );

  useEffect(() => {
    if (phase === "session-complete") {
      burstConfetti();
      playDing();
    }
  }, [phase]);

  if (phase === "select") {
    return (
      <div className="min-h-screen space-y-5 bg-gradient-to-b from-amber-50/80 via-rose-50/60 to-slate-100 pb-8">
        <section className="rounded-[1.75rem] border-4 border-white bg-white/90 p-5 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          <p className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-amber-700">
            <Calculator className="h-4 w-4" aria-hidden />
            Early 3D Math Lab
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
            Early 3D Math Lab
          </h1>
          <p className="mt-1 text-base font-medium text-slate-600">
            Toddler counting, Explorer coins, and Pro Challenge times tables for ages 7–8.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {openAccess || isPro
              ? "All math modes unlocked — including Pro Challenge."
              : `Free: Toddler + Explorer · ${FREE_MATH_ROUNDS_PER_SESSION} rounds. Pro Challenge needs Pro.`}
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(AGE_MODE_META) as MathAgeMode[]).map((key, index) => {
            const meta = AGE_MODE_META[key];
            const lockedMode = meta.requiresPro && !isPro && !openAccess;
            return (
              <motion.button
                key={key}
                type="button"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, type: "spring", stiffness: 380, damping: 22 }}
                whileHover={{ scale: lockedMode ? 1 : 1.03 }}
                whileTap={{ scale: lockedMode ? 1 : 0.94, y: lockedMode ? 0 : 4 }}
                onClick={() => startMode(key)}
                className={`rounded-[1.75rem] border-4 border-white bg-white/90 p-0 text-left shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl ${
                  lockedMode ? "opacity-70" : ""
                }`}
              >
                <div
                  className={`flex h-28 items-center justify-center rounded-t-[1.4rem] bg-gradient-to-br text-5xl text-white ${meta.accent}`}
                >
                  <span aria-hidden>{meta.emoji}</span>
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {meta.ageLabel}
                  </p>
                  <h2 className="text-lg font-extrabold text-slate-800">{meta.title}</h2>
                  <p className="text-sm font-medium text-slate-600">{meta.blurb}</p>
                  {lockedMode && (
                    <p className="pt-1 text-xs font-bold text-amber-700">Pro level</p>
                  )}
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-b from-amber-50 to-rose-50 p-6 text-center">
        <Trophy className="h-16 w-16 text-amber-500" aria-hidden />
        <h1 className="text-3xl font-extrabold text-slate-800">Math stars earned!</h1>
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
            className="rounded-2xl border-b-4 border-amber-500 bg-amber-400 px-5 py-3 text-base font-extrabold text-amber-950 shadow-lg"
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

  return (
    <div className="min-h-screen space-y-4 bg-gradient-to-b from-amber-50/70 via-rose-50/40 to-slate-100 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border-4 border-white bg-white/90 px-4 py-3 shadow-lg">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-amber-700">
            {AGE_MODE_META[mode].title}
          </p>
          <p className="text-sm font-bold text-slate-600">
            Round {roundsPlayed + 1}
            {!openAccess && !isPro ? ` · ${remainingFree} free left` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-900">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden />
            {sessionStars}
          </span>
          <MotionPressable
            onClick={() => {
              setPhase("select");
              setPuzzle(null);
              setMessage(null);
              setLocked(false);
            }}
            ariaLabel="Change age mode"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
          >
            Modes
          </MotionPressable>
        </div>
      </header>

      {message && (
        <p className="rounded-2xl bg-violet-50 px-4 py-3 text-center text-sm font-bold text-violet-800">
          <Sparkles className="mr-1 inline h-4 w-4" aria-hidden />
          {message}
        </p>
      )}

      {puzzle?.mode === "toddler" && (
        <ToddlerVisualMath
          puzzle={puzzle.data}
          locked={locked}
          onSolve={onSolve}
          onMiss={onMiss}
          onCountSpeak={onCountSpeak}
        />
      )}

      {puzzle?.mode === "explorer" && (
        <ExplorerCoinMath
          puzzle={puzzle.data}
          locked={locked}
          onSolve={onSolve}
          onMiss={onMiss}
          onCoachSpeak={onCoachSpeak}
        />
      )}

      {puzzle?.mode === "pro" && (
        <ProMathChallenge
          puzzle={puzzle.data}
          locked={locked}
          onSolve={onSolve}
          onMiss={onMiss}
        />
      )}

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
