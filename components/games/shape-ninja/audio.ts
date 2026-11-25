/** Snappy Web Audio "BOOM" for Bloom Blast (no MP3). */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  audio: AudioContext,
  freq: number,
  start: number,
  duration: number,
  volume = 0.22,
  type: OscillatorType = "sine",
) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, audio.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.02);
}

/** Punchy blast boom — low thump + sparkle. */
export function playBloomBoom() {
  const audio = getCtx();
  if (!audio) return;
  tone(audio, 90, 0, 0.18, 0.35, "triangle");
  tone(audio, 140, 0.02, 0.14, 0.22, "sine");
  tone(audio, 420, 0.04, 0.1, 0.12, "square");
  tone(audio, 880, 0.08, 0.12, 0.08, "sine");
}

export function playBloomWin() {
  const audio = getCtx();
  if (!audio) return;
  tone(audio, 523.25, 0, 0.16, 0.18);
  tone(audio, 659.25, 0.1, 0.16, 0.18);
  tone(audio, 783.99, 0.2, 0.22, 0.2);
  tone(audio, 1046.5, 0.34, 0.35, 0.16);
}

export function playBloomMiss() {
  const audio = getCtx();
  if (!audio) return;
  tone(audio, 220, 0, 0.12, 0.1, "triangle");
  tone(audio, 180, 0.1, 0.16, 0.08, "sine");
}
