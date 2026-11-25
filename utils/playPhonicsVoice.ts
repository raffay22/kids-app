"use client";

import { resolveKidsMediaRate } from "@/utils/kidsPlaybackSpeed";
import { createEnglishUtterance, KIDS_STORY_PLAYBACK_RATE } from "@/utils/speech";
import type { PhonicsCardMedia } from "@/utils/phonicsCatalog";

export type PhonicsVoiceHandlers = {
  onStart?: () => void;
  onEnded?: () => void;
};

let activeAudio: HTMLAudioElement | null = null;

function stopActive() {
  if (activeAudio) {
    activeAudio.onended = null;
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Play phonics VO: English MP3 when present, else TTS (unless allowTts is false). */
export function playPhonicsVoice(
  media: PhonicsCardMedia | null,
  handlers: PhonicsVoiceHandlers = {},
  allowTts = true,
) {
  const script = media?.variation.elevenlabs_script;
  if (!script) return;

  stopActive();
  handlers.onStart?.();

  const finish = () => {
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
    audio.onended = finish;
    void audio.play().catch(() => {
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
