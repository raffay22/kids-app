/** Phase 1: English-only Web Speech (en-US / en-GB). No Urdu or other locales. */

export const APP_SPEECH_LANG = "en-US" as const;
export const APP_SPEECH_LANG_FALLBACK = "en-GB" as const;

/**
 * Toddler-first speech pace (Khan Academy Kids style).
 * 1–2 year olds need slower, clearer delivery across phonics, games, and stories.
 */
export const KIDS_SPEECH_RATE = 0.72;
export const KIDS_SPEECH_PITCH = 1.05;

/** Playback for moral / story films so picture timing matches slower narration. */
export const KIDS_STORY_PLAYBACK_RATE = 0.88;

/** Default ElevenLabs `speed` for future moral-story VO (was 0.85). */
export const KIDS_ELEVENLABS_SPEED = 0.72;

/** Keep intentional slow phonics; cap anything faster than the toddler default. */
export function normalizeKidsSpeechRate(rate?: number): number {
  if (rate == null || Number.isNaN(rate)) return KIDS_SPEECH_RATE;
  const clamped = Math.min(Math.max(rate, 0.5), 1.2);
  return clamped <= KIDS_SPEECH_RATE ? clamped : KIDS_SPEECH_RATE;
}

export function normalizeKidsSpeechPitch(pitch?: number): number {
  if (pitch == null || Number.isNaN(pitch)) return KIDS_SPEECH_PITCH;
  return Math.min(Math.max(pitch, 0.8), 1.3);
}

function isEnglishVoice(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.toLowerCase();
  return lang.startsWith("en-us") || lang.startsWith("en-gb") || lang.startsWith("en");
}

export function pickEnglishVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("en-us")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en-gb")) ??
    voices.find(isEnglishVoice)
  );
}

export function createEnglishUtterance(
  text: string,
  options?: { rate?: number; pitch?: number },
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = APP_SPEECH_LANG;
  utterance.rate = normalizeKidsSpeechRate(options?.rate);
  utterance.pitch = normalizeKidsSpeechPitch(options?.pitch);

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const voice = pickEnglishVoice(window.speechSynthesis.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang.startsWith("en-GB")
        ? APP_SPEECH_LANG_FALLBACK
        : APP_SPEECH_LANG;
    }
  }

  return utterance;
}

let speakToken = 0;
let pendingVoiceTimer: number | null = null;
let pendingVoiceHandler: (() => void) | null = null;

/** Stop any current or pending spoken line immediately (page leave / navigate). */
export function stopKidsSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speakToken += 1;
  if (pendingVoiceTimer != null) {
    window.clearTimeout(pendingVoiceTimer);
    pendingVoiceTimer = null;
  }
  if (pendingVoiceHandler) {
    window.speechSynthesis.removeEventListener(
      "voiceschanged",
      pendingVoiceHandler,
    );
    pendingVoiceHandler = null;
  }
  try {
    window.speechSynthesis.cancel();
    // Chrome can get stuck paused after cancel — nudge it.
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    }
  } catch {
    // ignore
  }
}

export function speakEnglish(
  text: string,
  options?: { rate?: number; pitch?: number },
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const myToken = ++speakToken;

  const speakNow = () => {
    if (myToken !== speakToken) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(createEnglishUtterance(text, options));
    } catch {
      // ignore speech failures — never block taps/navigation
    }
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    const runOnce = () => {
      if (myToken !== speakToken) return;
      if (pendingVoiceHandler) {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          pendingVoiceHandler,
        );
        pendingVoiceHandler = null;
      }
      if (pendingVoiceTimer != null) {
        window.clearTimeout(pendingVoiceTimer);
        pendingVoiceTimer = null;
      }
      speakNow();
    };
    pendingVoiceHandler = runOnce;
    window.speechSynthesis.addEventListener("voiceschanged", runOnce);
    pendingVoiceTimer = window.setTimeout(runOnce, 150);
    return;
  }

  speakNow();
}

/** Apply toddler-friendly playback to video/audio (moral films + scene narration). */
export function applyKidsMediaPlaybackRate(
  el: HTMLMediaElement | null | undefined,
  rate: number = KIDS_STORY_PLAYBACK_RATE,
) {
  if (!el) return;
  try {
    el.playbackRate = rate;
    el.defaultPlaybackRate = rate;
  } catch {
    // some browsers reject extreme rates — ignore
  }
}
