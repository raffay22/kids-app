/** Phase 1: English-only Web Speech (en-US / en-GB). No Urdu or other locales. */

export const APP_SPEECH_LANG = "en-US" as const;
export const APP_SPEECH_LANG_FALLBACK = "en-GB" as const;

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
  utterance.rate = options?.rate ?? 1;
  utterance.pitch = options?.pitch ?? 1;

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

export function speakEnglish(
  text: string,
  options?: { rate?: number; pitch?: number },
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const speakNow = () => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(createEnglishUtterance(text, options));
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    let spoken = false;
    const runOnce = () => {
      if (spoken) return;
      spoken = true;
      window.speechSynthesis.removeEventListener("voiceschanged", runOnce);
      speakNow();
    };
    window.speechSynthesis.addEventListener("voiceschanged", runOnce);
    window.setTimeout(runOnce, 150);
    return;
  }

  speakNow();
}
