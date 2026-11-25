"use client";

import { useCallback } from "react";
import {
  PHONICS_SPEECH_PITCH,
  PHONICS_SPEECH_RATE,
  getPhonicSound,
  resolvePhonicsSpeakText,
} from "@/utils/phonicsSounds";
import {
  KIDS_SPEECH_PITCH,
  KIDS_SPEECH_RATE,
  speakEnglish,
  stopKidsSpeech,
} from "@/utils/speech";
import { getSchemaScript } from "@/utils/phonicsCatalog";

const PRAISE_PHRASES = [
  "Awesome!",
  "Wonderful!",
  "Well done!",
  "Super Star!",
  "Fantastic!",
] as const;

export function useTTS() {
  const speak = useCallback(
    (text: string, rate = KIDS_SPEECH_RATE, pitch = KIDS_SPEECH_PITCH) => {
      speakEnglish(text, { rate, pitch });
    },
    [],
  );

  /**
   * Plain spoken line (noun word, or a full verb sentence).
   * Never phonics drills ("d… d… Drum").
   */
  const speakPlainWord = useCallback(
    (word: string, rate = KIDS_SPEECH_RATE, pitch = KIDS_SPEECH_PITCH) => {
      const clean = word.trim();
      if (!clean) return;
      stopKidsSpeech();
      speakEnglish(clean, { rate, pitch });
    },
    [],
  );

  const speakPraise = useCallback(() => {
    const pick =
      PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
    speak(pick, KIDS_SPEECH_RATE, KIDS_SPEECH_PITCH);
  }, [speak]);

  const speakWord = useCallback(
    (word: string) => {
      const schemaLine = getSchemaScript(word, word);
      if (schemaLine) {
        speak(schemaLine, PHONICS_SPEECH_RATE, PHONICS_SPEECH_PITCH);
        return;
      }
      const phonic = getPhonicSound(word);
      if (phonic) {
        speak(phonic.speakText, PHONICS_SPEECH_RATE, PHONICS_SPEECH_PITCH);
        return;
      }
      speak(word, PHONICS_SPEECH_RATE, PHONICS_SPEECH_PITCH);
    },
    [speak],
  );

  /** Slow, clear phonics practice speech for toddlers. */
  const speakPhonic = useCallback(
    (options: {
      letter?: string;
      blend?: string;
      speakText?: string;
      exampleWord?: string;
    }) => {
      const text = resolvePhonicsSpeakText(options);
      speak(text, PHONICS_SPEECH_RATE, PHONICS_SPEECH_PITCH);
    },
    [speak],
  );

  return { speak, speakPlainWord, speakPraise, speakWord, speakPhonic };
}
