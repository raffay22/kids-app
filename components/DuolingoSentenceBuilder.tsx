"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  CheckCircle,
  ChevronRight,
  Ear,
  Lock,
  PenLine,
  RotateCcw,
  ShoppingBasket,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import MotionPressable from "@/components/MotionPressable";
import SentenceMediaThumb from "@/components/SentenceMediaThumb";
import StarFly from "@/components/StarFly";
import { createClient } from "@/utils/supabase/client";
import { burstConfetti, playBoop, playDing } from "@/utils/celebrate";
import { logProgress } from "@/utils/logProgress";
import { hideProPaywalls, isProUser } from "@/lib/membership";
import {
  SENTENCE_LEVEL_META,
  arraysEqual,
  buildWordPills,
  getSentencesByLevel,
  normalizeSentence,
  type SentenceLevel,
  type SentenceRecord,
} from "@/utils/sentences";
import { triggerHaptic } from "@/utils/haptics";

type WordPill = { id: string; word: string };
type Phase = "read" | "write";

const LEVELS: SentenceLevel[] = ["basic", "explorer", "pro"];
const springLayout = { type: "spring" as const, stiffness: 400, damping: 28 };

export default function DuolingoSentenceBuilder() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { activeChild } = useActiveChild();
  const { speak } = useTTS();
  const isPro = isProUser(profile);
  const openAccess = hideProPaywalls();

  const [level, setLevel] = useState<SentenceLevel>("basic");
  const [sentences, setSentences] = useState<SentenceRecord[]>(() =>
    getSentencesByLevel("basic"),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("read");
  const [bank, setBank] = useState<WordPill[]>([]);
  const [selected, setSelected] = useState<WordPill[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [starFly, setStarFly] = useState(0);

  const current = sentences[currentIndex] ?? null;
  const levelMeta = SENTENCE_LEVEL_META[level];
  const lockedPro = level === "pro" && !isPro && !openAccess;

  const resetPuzzle = useCallback((sentence: SentenceRecord) => {
    setBank(buildWordPills(sentence.word_bank));
    setSelected([]);
    setFeedback(null);
  }, []);

  const applyLevel = useCallback((next: SentenceLevel) => {
    const list = getSentencesByLevel(next).map(normalizeSentence);
    setSentences(list);
    setCurrentIndex(0);
    setPhase("read");
    setFeedback(null);
    if (list[0]) resetPuzzle(list[0]);
  }, [resetPuzzle]);

  useEffect(() => {
    applyLevel(level);
  }, [level, applyLevel]);

  // Optional: merge remote explorer sentences later without replacing local media.
  useEffect(() => {
    if (level !== "explorer") return;
    const loadRemote = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("sentences")
          .select("*")
          .eq("is_active", true)
          .eq("target_age_group", "3-6")
          .order("sentence_id", { ascending: true });
        if (error || !data?.length) return;
        // Keep local leveled deck as source of truth (matched 3D media).
        void data;
      } catch {
        // offline — local deck is enough
      }
    };
    void loadRemote();
  }, [level]);

  useEffect(() => {
    if (current && phase === "write") resetPuzzle(current);
  }, [current, phase, resetPuzzle]);

  const selectWord = (pill: WordPill) => {
    triggerHaptic(30);
    setBank((prev) => prev.filter((p) => p.id !== pill.id));
    setSelected((prev) => [...prev, pill]);
    setFeedback(null);
  };

  const removeWord = (pill: WordPill) => {
    triggerHaptic(30);
    setSelected((prev) => prev.filter((p) => p.id !== pill.id));
    setBank((prev) => [...prev, pill]);
    setFeedback(null);
  };

  const goWritePhase = () => {
    if (!current) return;
    triggerHaptic(25);
    setPhase("write");
    resetPuzzle(current);
    setFeedback(null);
  };

  const handleCheck = async () => {
    if (!current) return;

    if (selected.length === 0) {
      playBoop();
      setFeedback("Tap words into your sentence first!");
      return;
    }

    const attempt = selected.map((p) => p.word);
    const isCorrect = arraysEqual(attempt, current.correct_order);

    if (user && activeChild) {
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/sentences",
        attempt_type: "tap",
        target_word: current.sentence_id,
        is_correct: isCorrect,
      });
    }

    if (isCorrect) {
      triggerHaptic(30);
      burstConfetti();
      playDing();
      setStarFly((n) => n + 1);
      speak("Super Star! Perfect sentence!", 0.95);
      setFeedback("Perfect sentence!");

      window.setTimeout(() => {
        setCurrentIndex((prev) => {
          const len = sentences.length;
          if (len <= 0) return 0;
          return (prev + 1) % len;
        });
        setPhase("read");
        setFeedback(null);
      }, 1400);
    } else {
      playBoop();
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      setFeedback("Almost! Fix the words — no peeking at the sentence!");
    }
  };

  const handleReset = () => {
    if (current) resetPuzzle(current);
  };

  const media = useMemo(() => {
    if (!current) return { imageSrc: null as string | null, videoSrc: null as string | null, label: "" };
    return {
      imageSrc: current.imageSrc ?? null,
      videoSrc: current.videoSrc ?? null,
      label: current.target_vocabulary.word,
    };
  }, [current]);

  if (lockedPro) {
    return (
      <div className="kid-card space-y-4 border-amber-200 bg-amber-50 p-6 text-center">
        <Lock className="mx-auto h-10 w-10 text-amber-600" aria-hidden />
        <h3 className="text-xl font-extrabold text-slate-800">Pro sentences</h3>
        <p className="text-base text-slate-600">
          Grade 3–5 sentences unlock with Pro.
        </p>
        <MotionPressable
          onClick={() => router.push("/upgrade")}
          ariaLabel="Upgrade to Pro"
          className="mx-auto rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-5 py-3 text-base font-extrabold text-amber-950 shadow-lg"
        >
          See Pro
        </MotionPressable>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">No sentences available.</div>
    );
  }

  return (
    <div className="space-y-5">
      <StarFly trigger={starFly} />

      {/* Level picker */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="tablist" aria-label="Sentence level">
        {LEVELS.map((key) => {
          const meta = SENTENCE_LEVEL_META[key];
          const active = level === key;
          const locked = key === "pro" && !isPro && !openAccess;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                triggerHaptic(25);
                if (locked) {
                  router.push("/upgrade");
                  return;
                }
                setLevel(key);
              }}
              className={`rounded-2xl border-b-4 px-3 py-3 text-left shadow-md transition ${
                active
                  ? "border-sky-700 bg-sky-500 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <p className="text-sm font-extrabold">
                {meta.label}
                {locked ? " 🔒" : ""}
              </p>
              <p className={`text-xs font-medium ${active ? "text-sky-100" : "text-slate-500"}`}>
                {meta.blurb}
              </p>
            </button>
          );
        })}
      </div>

      <p className="text-sm font-semibold text-slate-500">
        {levelMeta.ages} · Sentence {currentIndex + 1}/{sentences.length} ·{" "}
        {phase === "read" ? "Read first" : "Write from memory"}
      </p>

      {phase === "read" ? (
        <section className="kid-card border-sky-300 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5 sm:p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-sky-500">
            {current.category} · Read
          </p>
          <div className="mt-3 flex items-start gap-4">
            <SentenceMediaThumb
              imageSrc={media.imageSrc}
              videoSrc={media.videoSrc}
              alt={media.label}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sky-700">
                Focus word: {current.target_vocabulary.word}
              </p>
              <p className="mt-1 text-sm text-slate-600">{current.target_vocabulary.meaning}</p>
              <p className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-lg font-bold leading-snug text-slate-800 sm:text-xl">
                &quot;{current.full_sentence}&quot;
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <MotionPressable
              onClick={() => speak(current.full_sentence)}
              ariaLabel="Hear the sentence"
              className="inline-flex items-center gap-2 rounded-2xl border-b-4 border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-lg"
            >
              <Volume2 className="h-4 w-4" aria-hidden />
              Hear sentence
            </MotionPressable>
            <MotionPressable
              onClick={goWritePhase}
              ariaLabel="Next — write the sentence"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-600 bg-emerald-400 px-4 py-2.5 text-base font-extrabold text-emerald-950 shadow-lg sm:flex-none"
            >
              Next
              <ChevronRight className="h-5 w-5" aria-hidden />
            </MotionPressable>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Read it carefully — next page hides the sentence!
          </p>
        </section>
      ) : (
        <>
          <section className="kid-card border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5">
            <div className="flex items-center gap-3">
              <SentenceMediaThumb
                imageSrc={media.imageSrc}
                videoSrc={media.videoSrc}
                alt={media.label}
              />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-violet-500">
                  Write from memory
                </p>
                <p className="text-base font-semibold text-slate-700">
                  Build the sentence you just read. No peeking!
                </p>
                <MotionPressable
                  onClick={() => speak(current.full_sentence)}
                  ariaLabel="Hear the sentence again without showing text"
                  className="mt-2 inline-flex items-center gap-2 rounded-2xl border-b-4 border-violet-200 bg-white px-3 py-2 text-sm font-bold text-violet-700 shadow"
                >
                  <Ear className="h-4 w-4" aria-hidden />
                  Hear again
                </MotionPressable>
              </div>
            </div>
          </section>

          <LayoutGroup>
            <motion.section
              animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              className="kid-card min-h-[88px] border-dashed border-indigo-300 bg-indigo-50/60 p-5"
            >
              <p className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase text-indigo-400">
                <PenLine className="h-4 w-4" aria-hidden />
                Your sentence
              </p>
              <div className="flex min-h-[52px] flex-wrap gap-2.5">
                <AnimatePresence mode="popLayout">
                  {selected.length === 0 ? (
                    <motion.span
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      className="text-base text-slate-400"
                    >
                      Tap word pills below…
                    </motion.span>
                  ) : (
                    selected.map((pill) => (
                      <motion.button
                        key={pill.id}
                        layoutId={pill.id}
                        type="button"
                        transition={springLayout}
                        onClick={() => removeWord(pill)}
                        className="rounded-2xl border-b-4 border-indigo-500 bg-gradient-to-b from-indigo-300 to-indigo-400 px-4 py-2.5 text-lg font-bold text-white shadow-lg active:translate-y-1"
                      >
                        {pill.word}
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            <section className="kid-card border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 p-5">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase text-amber-500">
                <ShoppingBasket className="h-4 w-4" aria-hidden />
                Word bank
              </p>
              <div className="flex flex-wrap gap-2.5">
                <AnimatePresence mode="popLayout">
                  {bank.map((pill) => (
                    <motion.button
                      key={pill.id}
                      layoutId={pill.id}
                      type="button"
                      layout
                      transition={springLayout}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94, y: 1 }}
                      onClick={() => selectWord(pill)}
                      className="rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-800 shadow-lg active:translate-y-1"
                    >
                      {pill.word}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </LayoutGroup>

          <div className="flex flex-wrap gap-3">
            <MotionPressable
              onClick={() => void handleCheck()}
              ariaLabel="Check sentence"
              className="btn-3d-success flex flex-1 items-center justify-center gap-2 py-4 text-lg"
            >
              <CheckCircle className="h-6 w-6" aria-hidden />
              Check Sentence
            </MotionPressable>
            <MotionPressable
              onClick={handleReset}
              ariaLabel="Reset word bank"
              className="btn-3d-white flex items-center justify-center gap-2 px-6 py-4 text-lg"
            >
              <RotateCcw className="h-5 w-5" aria-hidden />
              Reset
            </MotionPressable>
            <MotionPressable
              onClick={() => {
                setPhase("read");
                setFeedback(null);
              }}
              ariaLabel="Back to read the sentence"
              className="btn-3d-white flex items-center justify-center gap-2 px-5 py-4 text-base"
            >
              Peek sentence
            </MotionPressable>
          </div>
        </>
      )}

      {feedback && (
        <motion.p
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="flex items-center justify-center gap-1.5 text-center text-lg font-bold text-indigo-700"
        >
          {feedback === "Perfect sentence!" && (
            <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
          )}
          {feedback}
        </motion.p>
      )}
    </div>
  );
}
