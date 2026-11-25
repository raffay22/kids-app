"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mic, Target, Volume2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useStreak } from "@/hooks/useStreak";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import Illustration from "@/components/Illustration";
import FlashcardActionVideo from "@/components/FlashcardActionVideo";
import FlashcardStillImage from "@/components/FlashcardStillImage";
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
  mergeFlashcardDeck,
  pickQuizCard,
  type FlashcardCategory,
  type FlashcardDifficultyLevel,
  type FlashcardItem,
} from "@/utils/flashcards";
import { getNounCardByWord } from "@/utils/nounFlashcards";
import { getObjectCardByWord } from "@/utils/objectFlashcards";
import { getPronounCardByWord } from "@/utils/pronounFlashcards";
import { getVerbCardByWord } from "@/utils/verbFlashcards";
import { formatPhonicsDisplay } from "@/utils/phonicsSounds";
import { getExampleWordForLetter } from "@/utils/illustrations";
import { burstConfetti, playBoop, playDing } from "@/utils/celebrate";
import { cacheFlashcardWord, getCachedWordsForCategory } from "@/utils/flashcardCache";
import { handleGuestAward } from "@/utils/awardProgress";
import { logProgress } from "@/utils/logProgress";
import { createClient } from "@/utils/supabase/client";
import { triggerHaptic } from "@/utils/haptics";
import { stopKidsSpeech } from "@/utils/speech";

const GOLDEN_SPEECH_TROPHY = "golden-speech";
const STARS_PER_CORRECT = 5;
const SESSION_SIZE = 5;
const springTransition = { type: "spring" as const, stiffness: 480, damping: 18, mass: 0.7 };
const bouncySpring = { type: "spring" as const, stiffness: 520, damping: 14, mass: 0.55 };

const LEVEL_TABS: {
  id: FlashcardDifficultyLevel;
  label: string;
  ages: string;
  badgeClass: string;
}[] = [
  {
    id: "basic",
    label: "Basic",
    ages: "Ages 2–4 · Starter",
    badgeClass: "border-emerald-400 bg-emerald-100 text-emerald-900",
  },
  {
    id: "advanced",
    label: "Advanced",
    ages: "Ages 4–6 · Builder",
    badgeClass: "border-amber-400 bg-amber-100 text-amber-950",
  },
  {
    id: "pro",
    label: "Pro",
    ages: "Ages 6–9 · Mastery",
    badgeClass: "border-purple-400 bg-purple-100 text-purple-950",
  },
];

type QuizEngineProps = {
  category: FlashcardCategory;
};

export default function QuizEngine({ category }: QuizEngineProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { recordPractice } = useStreak();
  const { speakPlainWord, speakPraise, speakWord } = useTTS();

  // ABC Alphabet tab only: block ALL Web Speech (TTS) so only the recorded
  // phonics/video voice (mp3) is heard. Restored when leaving the ABC tab.
  useEffect(() => {
    if (category !== "abc" || typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    const originalSpeak = synth.speak.bind(synth);
    try {
      synth.cancel();
      synth.speak = () => {};
    } catch {
      return;
    }
    return () => {
      try {
        synth.speak = originalSpeak;
      } catch {
        // ignore
      }
    };
  }, [category]);
  const {
    speechAvailable,
    isListening,
    isInitializingVosk,
    useVoskPath,
    initVosk,
    listen,
  } = useSpeechRecognition();

  const phonicsCardRef = useRef<PhonicsVideoCardHandle>(null);
  const [level, setLevel] = useState<FlashcardDifficultyLevel>("basic");
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

  const isLeveledCategory = category === "pronouns" || category === "adjectives";
  const activeLevel = isLeveledCategory ? level : undefined;

  useEffect(() => {
    const load = async () => {
      const remote = await fetchFlashcardsFromSupabase();
      setFlashcardDeck(mergeFlashcardDeck(remote));
    };
    void load();
  }, []);

  const applyCard = useCallback(
    async (excludeIds: string[]) => {
      let pool = pickQuizCard(category, excludeIds, flashcardDeck, activeLevel);

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
        pool = pickQuizCard(category, [], flashcardDeck, activeLevel);
      }

      if (!pool) return;

      setCard(pool.card);
      setChoices(pool.choices);
      setSelected(null);
      setFeedback(null);
      setCelebrating(false);
      if (category === "abc") {
        stopKidsSpeech();
      }
      void cacheFlashcardWord(pool.card);
    },
    [activeLevel, category, flashcardDeck],
  );

  const loadNextCard = useCallback(
    async (resetSession = false) => {
      await applyCard(resetSession ? [] : usedIds);
    },
    [applyCard, usedIds],
  );

  useEffect(() => {
    if (category === "abc") {
      stopKidsSpeech();
    }
    setUsedIds([]);
    setSessionCorrect(0);
    setSessionTotal(0);
    void loadNextCard(true);
  }, [category, activeLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const awardStars = async () => {
    if (
      handleGuestAward({
        userId: user?.id,
        childId: activeChild?.id,
        deltaStars: STARS_PER_CORRECT,
      })
    ) {
      return;
    }
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
      if (!isAbc) {
        speakPraise();
      }
      // Guests get stars/streak in localStorage; signed-in kids in Supabase.
      void awardStars();
      void recordPractice();
      setSessionCorrect(nextCorrect);
      setFeedback("Correct! +5 Stars");

      const nextUsed = [...usedIds, card.id];
      setUsedIds(nextUsed);

      // Trophies are reserved exclusively for Streaks & Major Learning Milestones
      // (no trophy inflation on simple quiz completions).

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
      if (!isAbc) {
        speakPraise();
      }
      // Guests get stars/streak in localStorage; signed-in kids in Supabase.
      void awardStars();
      void recordPractice();
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
  const isNoun = category === "nouns";
  const isObject = category === "objects";
  const isPronoun = category === "pronouns";
  const isAdjective = category === "adjectives";
  const isVowelsConsonants = category === "vowels_consonants";
  const isVerb = category === "verbs";
  const isSentenceCategory =
    isVerb || isPronoun || isAdjective || isVowelsConsonants;
  const isStillWord =
    isNoun || isObject || isPronoun || isAdjective || isVowelsConsonants;
  const abcExample = isAbc ? (card.exampleWord ?? getExampleWordForLetter(card.word) ?? card.word) : null;
  const stillImage =
    card.imageSrc ??
    getNounCardByWord(card.word)?.imageSrc ??
    getObjectCardByWord(card.word)?.imageSrc ??
    getPronounCardByWord(card.word)?.imageSrc ??
    null;
  const verbCard = getVerbCardByWord(card.word);
  const verbVideo = card.videoUrl ?? verbCard?.videoSrc ?? null;
  const verbPoster = card.imageSrc ?? verbCard?.imageSrc ?? undefined;
  const accuracy =
    sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  return (
    <>
      <StarFly trigger={starFly} amount={STARS_PER_CORRECT} />
      <div className="space-y-4">
        {/* Level Selector Bar for Leveled Categories (Pronouns & Adjectives: Basic, Advanced, Pro) */}
        {isLeveledCategory && (
          <div className="kid-card flex flex-col gap-2.5 border-indigo-200 bg-white/95 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                {isPronoun ? "Pronouns Level" : "Adjectives Level"} · Step-by-Step Learning
              </p>
              <p className="text-sm font-bold text-slate-700">
                Choose a difficulty level for your child&apos;s age:
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEVEL_TABS.map((tab) => {
                const isActive = level === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      triggerHaptic(25);
                      setLevel(tab.id);
                    }}
                    className={`flex flex-col items-start rounded-2xl border-2 border-b-4 px-4 py-2 text-left transition ${
                      isActive
                        ? `${tab.badgeClass} ring-2 ring-indigo-400 ring-offset-1`
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <span className="text-sm font-black">{tab.label}</span>
                    <span className="text-[11px] font-semibold opacity-80">{tab.ages}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
              allowTts={false}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          ) : isStillWord && stillImage ? (
            <FlashcardStillImage
              src={stillImage}
              alt={card.word}
              celebrate={celebrating}
              className={isPronoun ? "!aspect-video !max-w-[440px]" : ""}
            />
          ) : isVerb && verbVideo ? (
            <FlashcardActionVideo
              videoSrc={verbVideo}
              posterSrc={verbPoster}
              alt={card.word}
              celebrate={celebrating}
            />
          ) : (
            <Illustration word={card.word} lottieUrl={card.lottieUrl} size="xl" celebrate={celebrating} />
          )}
          <p className="mt-3 text-base font-medium opacity-70">
            {isAbc
              ? "Which letter is this?"
              : isVerb
                ? "What is happening?"
                : isPronoun
                  ? `Which pronoun fits the picture? (${level.toUpperCase()} Level)`
                  : isAdjective
                    ? `Which describing word (adjective) fits? (${level.toUpperCase()} Level)`
                    : isVowelsConsonants
                      ? "Is this letter a Vowel (A, E, I, O, U) or a Consonant?"
                      : "What is this?"}
          </p>
          <h3 className="mt-1 max-w-xl text-center text-2xl font-bold tracking-wide sm:text-3xl">
            {isAbc || isPronoun || isAdjective || isVowelsConsonants
              ? (card.prompt ?? card.word)
              : card.word}
          </h3>
          {isSentenceCategory && (card.speakText || card.prompt) ? (
            <p
              className={`mt-2 max-w-md text-center text-lg font-semibold leading-snug sm:text-xl ${
                isPronoun
                  ? "text-rose-900/90"
                  : isAdjective
                    ? "text-teal-900/90"
                    : isVowelsConsonants
                      ? "text-indigo-900/90"
                      : "text-emerald-900/90"
              }`}
            >
              {isVerb ? (card.speakText ?? card.prompt) : `Tap "Hear it" to listen to the full sentence!`}
            </p>
          ) : null}
          <MotionPressable
            onClick={() => {
              // ABC only: phonics video + letter sound only (NO TTS).
              if (isAbc) {
                stopKidsSpeech();
                phonicsCardRef.current?.play();
                return;
              }
              // Verbs, Pronouns, Adjectives & Vowels/Consonants: full example sentence.
              if (isVerb || isPronoun || isAdjective || isVowelsConsonants) {
                speakPlainWord(card.speakText ?? card.prompt ?? card.word);
                return;
              }
              // Nouns & objects: plain word only — "Drum", not "d… d… Drum".
              if (isStillWord) {
                speakPlainWord(card.word);
                return;
              }
              speakWord(card.word);
            }}
            ariaLabel={
              isAbc
                ? "Hear the letter sound"
                : isVerb || isPronoun || isAdjective || isVowelsConsonants
                  ? "Hear the sentence"
                  : "Hear the word only"
            }
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
                {isAbc
                  ? formatPhonicsDisplay(choice)
                  : isVowelsConsonants
                    ? choice.replace(/^(Vowel|Consonant)\s+/i, "")
                    : choice}
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
