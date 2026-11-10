"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { CheckCircle, PenLine, RotateCcw, ShoppingBasket, Sparkles, Volume2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import Illustration from "@/components/Illustration";
import MotionPressable from "@/components/MotionPressable";
import StarFly from "@/components/StarFly";
import { createClient } from "@/utils/supabase/client";
import { burstConfetti, playBoop, playDing } from "@/utils/celebrate";
import { logProgress } from "@/utils/logProgress";
import { cacheSentences, getCachedSentences } from "@/utils/sentenceCache";
import {
  FALLBACK_SENTENCES,
  arraysEqual,
  buildWordPills,
  normalizeSentence,
  type SentenceRecord,
} from "@/utils/sentences";
import { getIllustrationCaption } from "@/utils/illustrations";
import { triggerHaptic } from "@/utils/haptics";

type WordPill = { id: string; word: string };

const springLayout = { type: "spring" as const, stiffness: 400, damping: 28 };

export default function DuolingoSentenceBuilder() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { speak, speakWord } = useTTS();

  const [sentences, setSentences] = useState<SentenceRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bank, setBank] = useState<WordPill[]>([]);
  const [selected, setSelected] = useState<WordPill[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [starFly, setStarFly] = useState(0);

  const current = sentences[currentIndex] ?? null;

  const resetPuzzle = useCallback((sentence: SentenceRecord) => {
    setBank(buildWordPills(sentence.word_bank));
    setSelected([]);
    setFeedback(null);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("sentences")
          .select("*")
          .eq("is_active", true)
          .eq("target_age_group", "3-6")
          .order("sentence_id", { ascending: true });

        if (error || !data?.length) {
          const cached = await getCachedSentences();
          const list = (cached.length > 0 ? cached : FALLBACK_SENTENCES).map(normalizeSentence);
          setSentences(list);
        } else {
          const list = (data as SentenceRecord[]).map(normalizeSentence);
          setSentences(list);
          await cacheSentences(list);
        }
      } catch {
        const cached = await getCachedSentences();
        setSentences((cached.length > 0 ? cached : FALLBACK_SENTENCES).map(normalizeSentence));
      }
      setLoading(false);
    };
    void load();
  }, []);

  useEffect(() => {
    if (current) resetPuzzle(current);
  }, [current, resetPuzzle]);

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

  const handleCheck = async () => {
    if (!current) return;

    if (selected.length === 0) {
      playBoop();
      setFeedback("Tap words into your sentence first!");
      return;
    }

    const attempt = selected.map((p) => p.word);
    const isCorrect = arraysEqual(attempt, current.correct_order);

    // Progress logging is optional — gameplay must work without login
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

      setTimeout(() => {
        setCurrentIndex((prev) => {
          const len = sentences.length;
          if (len <= 0) return 0;
          return (prev + 1) % len;
        });
      }, 1400);
    } else {
      playBoop();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setFeedback("Almost! Tap words in the box to fix your sentence.");
      if (user && activeChild) {
        void logProgress({
          user_id: user.id,
          child_id: activeChild.id,
          feature_route: "/sentences",
          attempt_type: "tap",
          target_word: `${current.sentence_id}-retry`,
          is_correct: false,
        });
      }
    }
  };

  const handleReset = () => {
    if (current) resetPuzzle(current);
  };

  if (loading) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">Loading sentences…</div>
    );
  }

  if (!current) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">No sentences available.</div>
    );
  }

  const vocab = current.target_vocabulary;
  const pictureWord = getIllustrationCaption(vocab.word);

  return (
    <div className="space-y-5">
      <StarFly trigger={starFly} />
      {/* Vocabulary prep card */}
      <section className="kid-card border-sky-300 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-500">
          {current.category} · {currentIndex + 1}/{sentences.length}
        </p>
        <div className="mt-3 flex items-start gap-5">
          <Illustration word={vocab.word} lottieUrl={current.lottie_url} size="md" className="shrink-0" />
          <div className="flex-1">
            <h3 className="gradient-letter-cool text-3xl font-bold sm:text-4xl">{vocab.word}</h3>
            <p className="mt-1 text-base text-sky-900">{vocab.meaning}</p>
            {pictureWord.toLowerCase() !== vocab.word.toLowerCase() && (
              <p className="mt-1 text-sm font-medium text-sky-600">Picture: {pictureWord}</p>
            )}
            <MotionPressable
              onClick={() => speakWord(vocab.word)}
              ariaLabel="Hear vocabulary word"
              className="mt-3 inline-flex items-center gap-2 rounded-2xl border-b-4 border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-lg active:translate-y-0.5"
            >
              <Volume2 className="h-4 w-4" aria-hidden />
              Hear word
            </MotionPressable>
          </div>
        </div>
        <p className="mt-4 rounded-2xl bg-white/70 px-4 py-2.5 text-base text-slate-600">
          Build: <span className="font-semibold text-slate-800">&quot;{current.full_sentence}&quot;</span>
        </p>
      </section>

      {/* Sentence assembly box */}
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

        {/* Word bank tray */}
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

      {/* Actions */}
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
      </div>

      {feedback && (
        <motion.p
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="flex items-center justify-center gap-1.5 text-center text-lg font-bold text-indigo-700"
        >
          {feedback === "Perfect sentence!" && <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />}
          {feedback}
        </motion.p>
      )}
    </div>
  );
}
