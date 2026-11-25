"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { compareTwoStrings } from "string-similarity";

export const SPEECH_MATCH_THRESHOLD = 0.6;

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function hasWebkitSpeech(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isInitializingVosk, setIsInitializingVosk] = useState(false);
  const [voskReady, setVoskReady] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [useVoskPath, setUseVoskPath] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const voskRef = useRef<{ listen: () => Promise<string> } | null>(null);

  useEffect(() => {
    if (isIOS()) {
      setUseVoskPath(true);
      setSpeechAvailable(true);
    } else if (hasWebkitSpeech()) {
      setUseVoskPath(false);
      setSpeechAvailable(true);
    } else {
      setSpeechAvailable(false);
    }
  }, []);

  const initVosk = useCallback(async () => {
    if (voskReady || voskRef.current) return true;

    setIsInitializingVosk(true);
    try {
      // Lazy-load WASM only on iOS opt-in — dynamic string import avoids Android bundle bloat
      const loader = new Function('return import("@vosk/vosk-browser")') as () => Promise<unknown>;
      await loader();
      setVoskReady(true);
      setIsInitializingVosk(false);
      return true;
    } catch {
      setSpeechAvailable(false);
      setIsInitializingVosk(false);
      return false;
    }
  }, [voskReady]);

  const matchTranscript = useCallback((transcript: string, targetWord: string): boolean => {
    const normalized = transcript.trim().toLowerCase();
    const target = targetWord.trim().toLowerCase();
    if (!normalized || !target) return false;
    if (normalized.includes(target)) return true;
    return compareTwoStrings(normalized, target) >= SPEECH_MATCH_THRESHOLD;
  }, []);

  const listenWebkit = useCallback(
    (targetWord: string): Promise<{ matched: boolean; transcript: string }> => {
      return new Promise((resolve) => {
        const SpeechRecognitionCtor =
          (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
            .SpeechRecognition ??
          (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
            .webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          resolve({ matched: false, transcript: "" });
          return;
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognitionRef.current = recognition;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0]?.[0]?.transcript ?? "";
          resolve({
            matched: matchTranscript(transcript, targetWord),
            transcript,
          });
        };

        recognition.onerror = () => {
          resolve({ matched: false, transcript: "" });
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setIsListening(true);
        recognition.start();
      });
    },
    [matchTranscript],
  );

  const listen = useCallback(
    async (targetWord: string): Promise<{ matched: boolean; transcript: string }> => {
      if (!speechAvailable) {
        return { matched: false, transcript: "" };
      }

      if (useVoskPath) {
        const ready = voskReady || (await initVosk());
        if (!ready) return { matched: false, transcript: "" };
        // Vosk listen pipeline placeholder — falls back to webkit if available on iOS 17+ Chrome
        if (hasWebkitSpeech()) {
          return listenWebkit(targetWord);
        }
        return { matched: false, transcript: "" };
      }

      return listenWebkit(targetWord);
    },
    [speechAvailable, useVoskPath, voskReady, initVosk, listenWebkit],
  );

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return {
    speechAvailable,
    isListening,
    isInitializingVosk,
    voskReady,
    useVoskPath,
    initVosk,
    listen,
    stop,
    matchTranscript,
  };
}
