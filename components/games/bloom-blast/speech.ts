/** Bloom Blast speech — uses shared kids speech so cancel/stop works app-wide. */

import { speakEnglish, stopKidsSpeech } from "@/utils/speech";

/** Speak one line; always cancels whatever was speaking first. */
export function speakBloomLine(text: string) {
  stopKidsSpeech();
  const line = String(text);
  // Chrome can replay the previous utterance if speak() runs in the same tick as cancel().
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      speakEnglish(line, { rate: 0.95, pitch: 1.2 });
    }, 50);
    return;
  }
  speakEnglish(line, { rate: 0.95, pitch: 1.2 });
}

/** e.g. "Red Circle... BOOM!" — once only; label must match the blasted tiles. */
export function speakBloomBoom(speakLabel: string) {
  const label = String(speakLabel || "").trim() || "Shape";
  // Chrome TTS often says "Sunday" for "Sun" / "the Sun" — use a clear sun phrase.
  if (/^(the\s+)?sun$/i.test(label) || /^sunshine$/i.test(label)) {
    speakBloomLine("Bright sun. BOOM!");
    return;
  }
  speakBloomLine(`${label}... BOOM!`);
}

/** Hard stop for leaving the game / hiding the tab. */
export function stopBloomSpeech() {
  stopKidsSpeech();
}
