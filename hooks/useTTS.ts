"use client";

import { useCallback } from "react";
import {
  PHONICS_SPEECH_PITCH,
  PHONICS_SPEECH_RATE,
  getPhonicSound,
  resolvePhonicsSpeakText,
} from "@/utils/phonicsSounds";
import { speakEnglish } from "@/utils/speech";
import { getSchemaScript } from "@/utils/phonicsCatalog";

const PRAISE_PHRASES = [
  "Awesome!",
  "Wonderful!",
  "Well done!",
  "Super Star!",
  "Fantastic!",
];

export function useTTS() {
  const speak = useCallback((text: string, rate = 1.0, pitch = 1.1) => {
    speakEnglish(text, { rate, pitch });
  }, []);

  const speakPraise = useCallback(() => {
    const phrase = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
    speak(phrase, 0.95, 1.1);
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
      speak(word, 0.85, 1.1);
    },
    [speak],
  );

  /** Slow, clear phonics practice speech (rate 0.75, pitch 1.0). */
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
