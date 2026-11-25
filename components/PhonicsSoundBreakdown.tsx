"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Mic } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTTS } from "@/hooks/useTTS";
import PhonicsVideoCard from "@/components/PhonicsVideoCard";
import MotionPressable from "@/components/MotionPressable";
import { getSchemaMedia, buildPhonicsDeck } from "@/utils/phonicsCatalog";
import { createClient } from "@/utils/supabase/client";
import { burstConfetti, playBoop, playDing } from "@/utils/celebrate";
import { handleGuestAward } from "@/utils/awardProgress";
import { logProgress } from "@/utils/logProgress";
import { FALLBACK_PHONICS, type PhonicsBlend } from "@/utils/phonics";
import { formatPhonicsDisplay } from "@/utils/phonicsSounds";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type PhonicsSoundBreakdownProps = {
  onBlendChange?: (blend: PhonicsBlend) => void;
};

export default function PhonicsSoundBreakdown({ onBlendChange }: PhonicsSoundBreakdownProps) {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { speak } = useTTS();
  const { speechAvailable, isListening, isInitializingVosk, useVoskPath, initVosk, listen } =
    useSpeechRecognition();

  const [phonicsList, setPhonicsList] = useState<PhonicsBlend[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showLetterPicker, setShowLetterPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("phonics_blends")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error || !data?.length) {
          setPhonicsList(buildPhonicsDeck(FALLBACK_PHONICS));
        } else {
          setPhonicsList(buildPhonicsDeck(data as PhonicsBlend[]));
        }
      } catch {
        setPhonicsList(buildPhonicsDeck(FALLBACK_PHONICS));
      }
      setLoading(false);
    };
    void load();
  }, []);

  const current = phonicsList[currentIndex] ?? null;
  const displayBlend = current ? formatPhonicsDisplay(current.blend) : "";

  useEffect(() => {
    if (current) onBlendChange?.(current);
  }, [current, onBlendChange]);

  const advance = useCallback(
    (delta: number) => {
      if (phonicsList.length === 0) return;
      setCurrentIndex((prev) => (prev + delta + phonicsList.length) % phonicsList.length);
      setFeedback(null);
    },
    [phonicsList.length],
  );

  const jumpToLetter = useCallback(
    (letter: string) => {
      const idx = phonicsList.findIndex(
        (row) => row.letter.toUpperCase() === letter.toUpperCase(),
      );
      if (idx < 0) return;
      setCurrentIndex(idx);
      setFeedback(null);
      setShowLetterPicker(false);
      speak(`Letter ${letter}`, 0.95);
    },
    [phonicsList, speak],
  );

  const availableLetters = new Set(
    phonicsList.map((row) => row.letter.toUpperCase()),
  );
  const activeLetter = current?.letter?.toUpperCase() ?? "";

  const handleCardTap = async () => {
    if (!current) return;

    if (
      handleGuestAward({
        userId: user?.id,
        childId: activeChild?.id,
        deltaStars: 0,
        recordPractice: true,
      })
    ) {
      return;
    }

    if (user && activeChild) {
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/phonics",
        attempt_type: "tap",
        target_word: current.blend,
        is_correct: true,
      });
    }
  };

  const handleSpeechPractice = async () => {
    if (!current || !speechAvailable) return;

    if (useVoskPath) {
      const ready = await initVosk();
      if (!ready) return;
    }

    setFeedback("Listening…");
    const { matched, transcript } = await listen(current.example_word);

    if (user && activeChild) {
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/phonics",
        attempt_type: "speech",
        target_word: current.blend,
        is_correct: matched,
      });
    }

    if (matched) {
      handleGuestAward({
        userId: user?.id,
        childId: activeChild?.id,
        deltaStars: 2,
        recordPractice: true,
      });
      burstConfetti();
      playDing();
      speak("Wonderful!", 0.95);
      setFeedback(`Great echo: "${transcript}"`);
    } else {
      playBoop();
      setFeedback(transcript ? `Try again — heard "${transcript}"` : "Tap the card to hear it first!");
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">Loading phonics sounds…</div>
    );
  }

  if (!current) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">No phonics blends available.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => advance(-1)}
          aria-label="Previous sound"
          className="kid-card flex h-14 w-14 items-center justify-center border-indigo-200 text-indigo-600"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden />
        </motion.button>
        <button
          type="button"
          onClick={() => setShowLetterPicker((open) => !open)}
          aria-expanded={showLetterPicker}
          aria-label={`Jump to a letter. Current letter ${activeLetter}`}
          className="rounded-full bg-violet-100 px-4 py-1.5 text-base font-extrabold text-violet-800 shadow ring-2 ring-violet-200 transition hover:bg-violet-200"
        >
          {activeLetter || "?"} · {currentIndex + 1} / {phonicsList.length}
          <span className="ml-2 text-xs font-bold uppercase tracking-wide text-violet-600">
            {showLetterPicker ? "Hide A–Z" : "Pick letter"}
          </span>
        </button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => advance(1)}
          aria-label="Next sound"
          className="kid-card flex h-14 w-14 items-center justify-center border-indigo-200 text-indigo-600"
        >
          <ChevronRight className="h-7 w-7" aria-hidden />
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {showLetterPicker && (
          <motion.div
            key="letter-picker"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="kid-card space-y-3 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-pink-50 p-3 sm:p-4">
              <p className="text-center text-sm font-bold text-violet-700">
                Jump to any letter
              </p>
              <div
                className="grid grid-cols-7 gap-2 sm:grid-cols-9 md:grid-cols-[repeat(13,minmax(0,1fr))]"
                role="listbox"
                aria-label="Alphabet letters"
              >
                {ALPHABET.map((letter) => {
                  const enabled = availableLetters.has(letter);
                  const selected = letter === activeLetter;
                  return (
                    <motion.button
                      key={letter}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={!enabled}
                      whileHover={enabled ? { scale: 1.08 } : undefined}
                      whileTap={enabled ? { scale: 0.92 } : undefined}
                      onClick={() => jumpToLetter(letter)}
                      className={`flex h-11 w-full items-center justify-center rounded-xl text-lg font-black shadow-sm transition sm:h-12 sm:text-xl ${
                        selected
                          ? "bg-violet-500 text-white ring-2 ring-violet-300"
                          : enabled
                            ? "border-2 border-violet-100 bg-white text-violet-800 hover:border-violet-300 hover:bg-violet-50"
                            : "cursor-not-allowed bg-slate-100 text-slate-300"
                      }`}
                    >
                      {letter}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <PhonicsVideoCard
            media={getSchemaMedia(current.letter, current.example_word, current.id)}
            fallbackWord={current.example_word}
            lottieUrl={current.lottie_url}
            title={displayBlend}
            subtitle={current.example_word}
            onTap={() => void handleCardTap()}
            className="border-purple-300 bg-gradient-to-br from-purple-50 via-white to-pink-50"
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap gap-3">
        <MotionPressable
          onClick={() => advance(1)}
          ariaLabel="Next phonic blend"
          className="btn-3d-primary flex-1 py-4 text-lg"
        >
          Next Sound →
        </MotionPressable>

        {speechAvailable && (
          <MotionPressable
            onClick={() => void handleSpeechPractice()}
            ariaLabel="Repeat the sound"
            className="btn-3d-white flex items-center justify-center gap-2 px-6 py-4 text-lg text-indigo-700"
          >
            <Mic className={`h-6 w-6 ${isListening ? "animate-pulse text-rose-500" : ""}`} aria-hidden />
            {isInitializingVosk ? "Initializing…" : "Repeat"}
          </MotionPressable>
        )}
      </div>

      {feedback && (
        <p className="text-center text-lg font-bold text-indigo-700">{feedback}</p>
      )}
    </div>
  );
}
