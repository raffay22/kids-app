"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mic, Target, Volume2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import Illustration from "@/components/Illustration";
import PhonicsVideoCard, {
  type PhonicsVideoCardHandle,
} from "@/components/PhonicsVideoCard";
import RewardTrophyModal from "@/components/RewardTrophyModal";
import { getMediaByLetter, getMediaByWord } from "@/utils/phonicsCatalog";
import StarFly from "@/components/StarFly";
import MotionPressable from "@/components/MotionPressable";
import {
  CATEGORY_STYLES,
  FLASHCARD_DECK,
  fetchFlashcardsFromSupabase,
  pickQuizCard,
  type FlashcardCategory,
  type FlashcardItem,
} from "@/utils/flashcards";
import { formatPhonicsDisplay } from "@/utils/phonicsSounds";
import { getExampleWordForLetter } from "@/utils/illustrations";
import { burstConfetti, playBoop, playDing } from "@/utils/celebrate";
import { cacheFlashcardWord, getCachedWordsForCategory } from "@/utils/flashcardCache";
import { logProgress } from "@/utils/logProgress";
import { createClient } from "@/utils/supabase/client";
import { triggerHaptic } from "@/utils/haptics";

const GOLDEN_SPEECH_TROPHY = "golden-speech";
const STARS_PER_CORRECT = 10;
const SESSION_SIZE = 5;
const springTransition = { type: "spring" as const, stiffness: 480, damping: 18, mass: 0.7 };
const bouncySpring = { type: "spring" as const, stiffness: 520, damping: 14, mass: 0.55 };

type QuizEngineProps = {
  category: FlashcardCategory;
};

export default function QuizEngine({ category }: QuizEngineProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speakPraise, speakWord } = useTTS();
  const {
    speechAvailable,
    isListening,
    isInitializingVosk,
    useVoskPath,
    initVosk,
    listen,
  } = useSpeechRecognition();

  const phonicsCardRef = useRef<PhonicsVideoCardHandle>(null);
  const [card, setCard] = useState<FlashcardItem | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [showTrophy, setShowTrophy] = useState(false);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [confirmAnim, setConfirmAnim] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [starFly, setStarFly] = useState(0);
  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardItem[]>(FLASHCARD_DECK);

  useEffect(() => {
    const load = async () => {
      const remote = await fetchFlashcardsFromSupabase();
      if (remote?.length) setFlashcardDeck(remote);
    };
    void load();
  }, []);

  const applyCard = useCallback(
    async (excludeIds: string[]) => {
      let pool = pickQuizCard(category, excludeIds, flashcardDeck);

      if (!pool && typeof navigator !== "undefined" && !navigator.onLine) {
        const cached = await getCachedWordsForCategory(category);
        if (cached.length > 0) {
          const cachedCard = cached[Math.floor(Math.random() * cached.length)];
          pool = {
            card: cachedCard,
            choices: [
              cachedCard.word,
              ...cached
                .filter((c) => c.id !== cachedCard.id)
                .slice(0, 3)
                .map((c) => c.word),
            ].sort(() => Math.random() - 0.5),
          };
        }
      }

      if (!pool) {
        pool = pickQuizCard(category, [], flashcardDeck);
      }

      if (!pool) return;

      setCard(pool.card);
      setChoices(pool.choices);
      setSelected(null);
      setFeedback(null);
      setCelebrating(false);
      void cacheFlashcardWord(pool.card);
    },
    [category, flashcardDeck],
  );

  const loadNextCard = useCallback(
    async (resetSession = false) => {
      await applyCard(resetSession ? [] : usedIds);
    },
    [applyCard, usedIds],
  );

  useEffect(() => {
    setUsedIds([]);
    setSessionCorrect(0);
    setSessionTotal(0);
    void loadNextCard(true);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const awardStars = async () => {
    if (!activeChild) return;

    try {
      const supabase = createClient();
      const newStars = (activeChild.stars ?? 0) + STARS_PER_CORRECT;

      await supabase
        .from("children")
        .update({ stars: newStars })
        .eq("id", activeChild.id);

      await refreshChildren();
    } catch {
      // offline — stars sync on next refresh
    }
  };

  const unlockTrophy = async () => {
    if (!user || !activeChild) return;

    const trophies = activeChild.unlocked_trophies ?? [];
    if (trophies.includes(GOLDEN_SPEECH_TROPHY)) return;

    const updated = [...trophies, GOLDEN_SPEECH_TROPHY];

    try {
      const supabase = createClient();
      await supabase.from("children").update({ unlocked_trophies: updated }).eq("id", activeChild.id);

      // Task spec: also persist on profiles.unlocked_trophies
      const profileTrophies = profile?.unlocked_trophies ?? [];
      if (!profileTrophies.includes(GOLDEN_SPEECH_TROPHY)) {
        await supabase
          .from("profiles")
          .update({ unlocked_trophies: [...profileTrophies, GOLDEN_SPEECH_TROPHY] })
          .eq("id", user.id);
      }

      await refreshChildren();
      await refreshProfile();
    } catch {
      // queued offline — trophy unlock retried on reconnect via manual refresh
    }
  };

  const celebrate = () => {
    burstConfetti();
    playDing();
    setStarFly((n) => n + 1);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 900);
  };

  const handleConfirm = async () => {
    if (!card) return;

    if (!selected) {
      playBoop();
      setFeedback("Tap an answer first!");
      return;
    }

    setConfirmAnim(true);
    setTimeout(() => setConfirmAnim(false), 400);

    const isCorrect = selected === card.word;
    const nextTotal = sessionTotal + 1;
    const nextCorrect = isCorrect ? sessionCorrect + 1 : sessionCorrect;
    setSessionTotal(nextTotal);

    // Progress logging is optional — gameplay must work without login
    if (user && activeChild) {
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/",
        attempt_type: "tap",
        target_word: card.word,
        is_correct: isCorrect,
      });
    }

    if (isCorrect) {
      triggerHaptic(30);
      celebrate();
      speakPraise();
      if (user && activeChild) {
        void awardStars();
      }
      setSessionCorrect(nextCorrect);
      setFeedback("Correct! +10 Stars");

      const nextUsed = [...usedIds, card.id];
      setUsedIds(nextUsed);

      if (nextTotal >= SESSION_SIZE) {
        const nextAccuracy = Math.round((nextCorrect / nextTotal) * 100);
        if (nextAccuracy > 80 && user && activeChild) {
          void unlockTrophy();
          setShowTrophy(true);
          return;
        }
      }

      // Advance using the updated exclude list (not a stale closure)
      setTimeout(() => {
        void applyCard(nextUsed);
      }, 1200);
    } else {
      playBoop();
      setFeedback("Try again — tap another card!");
    }
  };

  const handleSpeech = async () => {
    if (!card || !speechAvailable) return;

    if (useVoskPath && isInitializingVosk) return;

    if (useVoskPath) {
      const ready = await initVosk();
      if (!ready) return;
    }

    setFeedback("Listening…");
    const { matched, transcript } = await listen(card.word);

    if (user && activeChild) {
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/",
        attempt_type: "speech",
        target_word: card.word,
        is_correct: matched,
      });
    }

    if (matched) {
      setSelected(card.word);
      setFeedback(`Heard "${transcript}" — great job!`);
      triggerHaptic(30);
      celebrate();
      speakPraise();
      if (user && activeChild) {
        void awardStars();
      }
      const nextUsed = [...usedIds, card.id];
      setUsedIds(nextUsed);
      setSessionCorrect((c) => c + 1);
      setSessionTotal((t) => t + 1);
      setTimeout(() => {
        void applyCard(nextUsed);
      }, 1200);
    } else {
      playBoop();
      setFeedback(transcript ? `Heard "${transcript}" — try again!` : "Didn't catch that. Try tap mode!");
    }
  };

  if (!card) {
    return (
      <div className="glass-card p-6 text-center text-lg text-slate-600">
        Loading flashcards…
      </div>
    );
  }

  const style = CATEGORY_STYLES[category];
  const isAbc = category === "abc";
  const abcExample = isAbc ? (card.exampleWord ?? getExampleWordForLetter(card.word) ?? card.word) : null;
  const accuracy =
    sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  return (
    <>
      <StarFly trigger={starFly} amount={STARS_PER_CORRECT} />
      <div className="space-y-4">
        {/* Prompt card */}
        <motion.div
          key={card.id}
          className={`kid-card flex flex-col items-center p-8 ${style.card}`}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springTransition}
        >
          {isAbc && abcExample ? (
            <PhonicsVideoCard
              ref={phonicsCardRef}
              media={getMediaByLetter(card.word) ?? getMediaByWord(abcExample)}
              fallbackWord={abcExample}
              lottieUrl={card.lottieUrl}
              title={formatPhonicsDisplay(card.word)}
              subtitle={abcExample}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          ) : (
            <Illustration word={card.word} lottieUrl={card.lottieUrl} size="xl" celebrate={celebrating} />
          )}
          <p className="mt-3 text-base font-medium opacity-70">
            {isAbc ? "Which letter is this?" : "What is this?"}
          </p>
          <h3 className="text-3xl font-bold tracking-wide sm:text-4xl">{card.prompt ?? card.word}</h3>
          <MotionPressable
            onClick={() => {
              if (phonicsCardRef.current) {
                phonicsCardRef.current.play();
                return;
              }
              speakWord(card.word);
            }}
            ariaLabel={isAbc ? "Hear the letter sound" : "Hear the word"}
            className="mt-4 flex items-center gap-2 rounded-2xl border-b-4 border-white/60 bg-white/90 px-5 py-2.5 text-base font-semibold text-slate-700 shadow-lg active:translate-y-0.5"
          >
            <Volume2 className="h-5 w-5" aria-hidden />
            Hear it
          </MotionPressable>
        </motion.div>

        {/* Session progress */}
        <div className="flex items-center justify-between px-1 text-sm font-medium text-slate-600">
          <span>
            Session: {sessionCorrect}/{sessionTotal} correct
          </span>
          {sessionTotal > 0 && (
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" aria-hidden />
              {accuracy}% accuracy
            </span>
          )}
        </div>

        {/* Answer grid */}
        <div className="grid grid-cols-2 gap-3">
          {choices.map((choice) => {
            const isSelected = selected === choice;
            return (
              <motion.button
                key={choice}
                type="button"
                layout
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={
                  isSelected
                    ? { opacity: 1, y: 0, scale: 1.06 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.92 }}
                transition={bouncySpring}
                onClick={() => {
                  triggerHaptic(30);
                  setSelected(choice);
                  setFeedback(null);
                }}
                className={`rounded-3xl border-4 border-b-8 p-5 text-xl font-bold shadow-xl transition-colors ${
                  isSelected
                    ? "border-indigo-500 bg-white ring-4 ring-indigo-300"
                    : `${style.card} hover:bg-white/90`
                }`}
              >
                {isAbc ? formatPhonicsDisplay(choice) : choice}
              </motion.button>
            );
          })}
        </div>

        {/* Confirm + Speech */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            type="button"
            animate={confirmAnim ? { scale: [1, 1.08, 1] } : {}}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
            disabled={!selected}
            onClick={() => void handleConfirm()}
            className="btn-3d-success flex flex-1 items-center justify-center gap-2 py-4 text-lg disabled:opacity-50"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            Confirm Choice
          </motion.button>

          {speechAvailable && (
            <MotionPressable
              onClick={() => void handleSpeech()}
              ariaLabel="Speak your answer"
              className="btn-3d-white flex items-center justify-center gap-2 px-6 py-4 text-lg text-indigo-700"
            >
              <Mic className={`h-6 w-6 ${isListening ? "animate-pulse text-rose-500" : ""}`} aria-hidden />
              {isInitializingVosk ? "Initializing voice model…" : "Speak"}
            </MotionPressable>
          )}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg font-bold text-indigo-700"
            >
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <RewardTrophyModal
        open={showTrophy}
        accuracy={accuracy}
        onClose={() => {
          setShowTrophy(false);
          setSessionCorrect(0);
          setSessionTotal(0);
          setUsedIds([]);
          void loadNextCard(true);
        }}
      />
    </>
  );
}
