"use client";

import { createEnglishUtterance } from "@/utils/speech";
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

/** Play the schema `elevenlabs_script` in full. Call onEnded when it actually finishes. */
export function playPhonicsVoice(
  media: PhonicsCardMedia | null,
  handlers: PhonicsVoiceHandlers = {},
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
    audio.onended = finish;
    void audio.play().catch(() => {
      speakScript(script, finish);
    });
    return;
  }

  speakScript(script, finish);
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
