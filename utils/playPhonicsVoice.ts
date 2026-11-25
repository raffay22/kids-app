"use client";

import { resolveKidsMediaRate } from "@/utils/kidsPlaybackSpeed";
import {
  createEnglishUtterance,
  KIDS_STORY_PLAYBACK_RATE,
  registerBeforeSpeakHook,
  stopKidsSpeech,
} from "@/utils/speech";
import type { PhonicsCardMedia } from "@/utils/phonicsCatalog";

export type PhonicsVoiceHandlers = {
  onStart?: () => void;
  onEnded?: () => void;
};

let activeAudio: HTMLAudioElement | null = null;
let playbackToken = 0;

function stopPhonicsAudioOnly() {
  playbackToken += 1;
  if (activeAudio) {
    activeAudio.onplay = null;
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
}

// Mutual audio guard: if any TTS line starts speaking, stop active phonics MP3 immediately
registerBeforeSpeakHook(stopPhonicsAudioOnly);

export function stopPhonicsVoice() {
  stopPhonicsAudioOnly();
  stopKidsSpeech();
}

/** Play phonics VO: English MP3 when present, else TTS (unless allowTts is false). */
export function playPhonicsVoice(
  media: PhonicsCardMedia | null,
  handlers: PhonicsVoiceHandlers = {},
  allowTts = true,
) {
  const script = media?.variation.elevenlabs_script;
  if (!script) return;

  stopPhonicsVoice();
  const token = playbackToken;
  handlers.onStart?.();

  const finish = () => {
    if (token !== playbackToken) return;
    activeAudio = null;
    handlers.onEnded?.();
  };

  if (media?.localAudioSrc) {
    const audio = new Audio(media.localAudioSrc);
    activeAudio = audio;
    const rate = resolveKidsMediaRate(KIDS_STORY_PLAYBACK_RATE);
    try {
      audio.playbackRate = rate;
      audio.defaultPlaybackRate = rate;
    } catch {
      // ignore
    }
    audio.onplay = () => {
      // Guarantee TTS is never speaking while native phonics MP3 plays
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    audio.onended = finish;
    void audio.play().catch((err: unknown) => {
      // Ignore abort/superseded errors so cancelled MP3 never triggers overlapping TTS
      if (token !== playbackToken) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (allowTts) {
        speakScript(script, finish);
      } else {
        finish();
      }
    });
    return;
  }

  if (allowTts) {
    speakScript(script, finish);
  } else {
    finish();
  }
}

function speakScript(script: string, onEnded: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnded();
    return;
  }

  const utterance = createEnglishUtterance(script, { rate: 0.85, pitch: 1.05 });
  utterance.onend = onEnded;
  utterance.onerror = onEnded;
  window.speechSynthesis.speak(utterance);
}
