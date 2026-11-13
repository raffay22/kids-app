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
} from "@/utils/speech";
import { getSchemaScript } from "@/utils/phonicsCatalog";

const PRAISE_PHRASES = [
  "Awesome!",
  "Wonderful!",
  "Well done!",
  "Super Star!",
  "Fantastic!",
];

export function useTTS() {
  const speak = useCallback(
    (text: string, rate = KIDS_SPEECH_RATE, pitch = KIDS_SPEECH_PITCH) => {
      speakEnglish(text, { rate, pitch });
    },
    [],
  );

  const speakPraise = useCallback(() => {
    const phrase = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
    speak(phrase, KIDS_SPEECH_RATE, KIDS_SPEECH_PITCH);
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

  return { speak, speakPraise, speakWord, speakPhonic };
}
