/** Bloom Blast speech — game.md wants rate 0.95 / pitch 1.2 (not toddler clamp). */

export function speakBloomLine(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}
