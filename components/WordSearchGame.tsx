"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eraser, Home, Newspaper, Sparkles, Star, Trophy } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import { useAuth } from "@/components/AuthProvider";
import TargetWordTray from "@/components/word-search/TargetWordTray";
import WordSearchGrid from "@/components/word-search/WordSearchGrid";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { burstConfetti, playBoop, playDing, starShower } from "@/utils/celebrate";
import { createClient } from "@/utils/supabase/client";
import { logProgress } from "@/utils/logProgress";
import { hideProPaywalls, isProUser } from "@/lib/membership";
import {
  FREE_WORD_SEARCH_ROUNDS,
  STARS_PER_WORD_SEARCH_PUZZLE,
  WORD_SEARCH_LEVELS,
  buildWordSearchPuzzle,
  type WordSearchLevelId,
  type WordSearchPuzzle,
} from "@/utils/wordSearch";

type Phase = "select" | "playing" | "won" | "session-complete";
type Cell = { row: number; col: number };

export default function WordSearchGame() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();
  const isPro = isProUser(profile);
  const openAccess = hideProPaywalls();

  const [phase, setPhase] = useState<Phase>("select");
  const [levelId, setLevelId] = useState<WordSearchLevelId>(1);
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundPaths, setFoundPaths] = useState<Cell[][]>([]);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  const remainingFree = Math.max(0, FREE_WORD_SEARCH_ROUNDS - roundsPlayed);
  const canPlayMore = openAccess || isPro || remainingFree > 0;

  const awardPuzzle = useCallback(async () => {
    setSessionStars((n) => n + STARS_PER_WORD_SEARCH_PUZZLE);
    if (!activeChild) return;
    try {
      const supabase = createClient();
      const newStars = (activeChild.stars ?? 0) + STARS_PER_WORD_SEARCH_PUZZLE;
      await supabase.from("children").update({ stars: newStars }).eq("id", activeChild.id);
      if (user) {
        void logProgress({
          user_id: user.id,
          child_id: activeChild.id,
          feature_route: "/games/word-search",
          attempt_type: "tap",
          target_word: `word_search_complete:L${levelId}`,
          is_correct: true,
        });
      }
      await refreshChildren();
      await refreshProfile();
    } catch {
      // offline — stars sync later
    }
  }, [activeChild, levelId, refreshChildren, refreshProfile, user]);

  const startLevel = (nextLevel: WordSearchLevelId) => {
    const meta = WORD_SEARCH_LEVELS.find((l) => l.id === nextLevel)!;
    if (!meta.freeAllowed && !isPro && !openAccess) {
      speak("That level is for Pro friends! Try a shorter word puzzle.", 0.95);
      router.push("/upgrade");
      return;
    }
    if (!canPlayMore) {
      speak("Free friends get three word puzzles each time. Upgrade for unlimited play!", 0.95);
      router.push("/upgrade");
      return;
    }

    const next = buildWordSearchPuzzle(nextLevel);
    setLevelId(nextLevel);
    setPuzzle(next);
    setFoundWords([]);
    setFoundPaths([]);
    setLocked(false);
    setMessage(`Find ${next.words.length} words!`);
    setResetToken((n) => n + 1);
    setPhase("playing");
    speak(`Find the hidden words. Start with ${next.words[0]}!`, 0.95);
  };

  const onFoundWord = useCallback(
    (word: string, path: Cell[]) => {
      if (locked || !puzzle) return;
      if (foundWords.includes(word)) return;

      const nextFound = [...foundWords, word];
      const nextPaths = [...foundPaths, path];
      setFoundWords(nextFound);
      setFoundPaths(nextPaths);
      burstConfetti();
      playDing();
      speak(`${word}!`, 0.95);
      setMessage(`You found ${word}! ${nextFound.length}/${puzzle.words.length}`);

      if (nextFound.length >= puzzle.words.length) {
        setLocked(true);
        window.setTimeout(() => {
          playDing();
          starShower();
          burstConfetti();
          speak("Woohoo! You found every word!", 0.95);
          void awardPuzzle();
          const nextRounds = roundsPlayed + 1;
          setRoundsPlayed(nextRounds);
          setPhase("won");
          setMessage(`Puzzle complete! +${STARS_PER_WORD_SEARCH_PUZZLE} stars`);
        }, 700);
      }
    },
    [awardPuzzle, foundPaths, foundWords, locked, puzzle, roundsPlayed, speak],
  );

  const onMissPath = useCallback(() => {
    playBoop();
    setMessage("Keep looking — drag letters in a straight line!");
  }, []);

  if (phase === "select") {
    return (
      <div className="min-h-screen space-y-5 bg-gradient-to-br from-amber-100 via-pink-100 to-indigo-100 p-4 pb-8">
        <section className="rounded-[1.75rem] border-4 border-amber-900/15 bg-[#FFFDF9] p-5 shadow-2xl">
          <p className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-amber-800">
            <Newspaper className="h-4 w-4" aria-hidden />
            Daily Kids Word Puzzle
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
            Word Search
          </h1>
          <p className="mt-1 text-base font-medium text-slate-600">
            Newspaper board + crayon highlighter — find 10 hidden words!
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {openAccess || isPro
              ? "All word levels unlocked."
              : `Free: Levels 1–2 · ${FREE_WORD_SEARCH_ROUNDS} puzzles per session.`}
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          {WORD_SEARCH_LEVELS.map((level, index) => {
            const lockedLevel = !level.freeAllowed && !isPro && !openAccess;
            return (
              <motion.button
                key={level.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: lockedLevel ? 1 : 1.03 }}
                whileTap={{ scale: lockedLevel ? 1 : 0.95 }}
                onClick={() => startLevel(level.id)}
                className={`rounded-[1.5rem] border-4 border-white bg-[#FFFDF9] p-4 text-left shadow-xl ${
                  lockedLevel ? "opacity-60" : ""
                }`}
              >
                <p className="text-3xl" aria-hidden>
                  {level.emoji}
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-slate-800">
                  Level {level.id}: {level.title}
                </h2>
                <p className="text-sm font-medium text-slate-600">{level.ageLabel}</p>
                {lockedLevel && (
                  <p className="mt-1 text-xs font-bold text-amber-700">Pro level</p>
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-br from-amber-100 via-pink-100 to-indigo-100 p-6 text-center">
        <Trophy className="h-16 w-16 text-amber-500" aria-hidden />
        <h1 className="text-3xl font-extrabold text-slate-800">Puzzle stars earned!</h1>
        <p className="text-lg font-bold text-slate-600">Session total: {sessionStars} stars</p>
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

  if (phase === "won" && puzzle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-br from-amber-100 via-pink-100 to-indigo-100 p-6 text-center">
        <Sparkles className="h-14 w-14 text-rose-500" aria-hidden />
        <h1 className="text-3xl font-extrabold text-slate-800">All 10 words found!</h1>
        <p className="text-lg font-bold text-slate-600">
          +{STARS_PER_WORD_SEARCH_PUZZLE} stars · Session {sessionStars}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <MotionPressable
            onClick={() => {
              const stillAllowed =
                openAccess || isPro || roundsPlayed < FREE_WORD_SEARCH_ROUNDS;
              if (!stillAllowed) {
                setPhase("session-complete");
                speak("Amazing word session!", 0.95);
                return;
              }
              startLevel(levelId);
            }}
            ariaLabel="Next puzzle"
            className="rounded-2xl border-b-4 border-rose-500 bg-rose-400 px-5 py-3 text-base font-extrabold text-white shadow-lg"
          >
            Next puzzle
          </MotionPressable>
          <MotionPressable
            onClick={() => setPhase("select")}
            ariaLabel="Change level"
            className="rounded-2xl border-b-4 border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-700 shadow-lg"
          >
            Levels
          </MotionPressable>
        </div>
      </div>
    );
  }

  if (!puzzle) return null;

  return (
    <div className="min-h-screen space-y-4 bg-gradient-to-br from-amber-100 via-pink-100 to-indigo-100 p-4 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border-4 border-amber-900/15 bg-[#FFFDF9] px-4 py-3 shadow-xl">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-amber-800">
            Level {levelId} · {foundWords.length}/{puzzle.words.length} words
          </p>
          <p className="text-sm font-bold text-slate-600">
            {!openAccess && !isPro ? `${remainingFree} free puzzles left` : "Unlimited play"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-900">
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden />
          {sessionStars}
        </span>
      </header>

      <section className="rounded-[1.75rem] border-4 border-amber-900/20 bg-[#FFFDF9] p-4 shadow-2xl sm:p-6">
        <div className="mb-4 text-center">
          <p className="inline-block rounded-md border-2 border-amber-900/30 bg-amber-50 px-4 py-1 text-sm font-black tracking-[0.12em] text-amber-950 shadow-sm sm:text-base">
            DAILY KIDS WORD PUZZLE
          </p>
        </div>

        <div className="mb-4">
          <TargetWordTray words={puzzle.words} found={foundWords} />
        </div>

        {message && (
          <p className="mb-3 text-center text-sm font-bold text-violet-800">{message}</p>
        )}

        <WordSearchGrid
          puzzle={puzzle}
          foundWords={foundWords}
          foundPaths={foundPaths}
          locked={locked}
          onFoundWord={onFoundWord}
          onMissPath={onMissPath}
          resetToken={resetToken}
        />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setResetToken((n) => n + 1);
              setMessage("Line cleared — try again!");
              speak("Reset line!", 0.95);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-rose-400 px-4 py-3 text-sm font-extrabold text-white shadow-lg"
            aria-label="Reset line"
          >
            <Eraser className="h-4 w-4" aria-hidden />
            Reset line
          </button>
          <MotionPressable
            onClick={() => setPhase("select")}
            ariaLabel="Change level"
            className="rounded-2xl border border-amber-900/20 bg-white px-4 py-3 text-sm font-bold text-slate-700"
          >
            Levels
          </MotionPressable>
        </div>
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
