/** Shared haptic + Web Audio tap tones for ASD PECS activities. */

import { triggerHaptic } from "@/utils/haptics";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

/** Soft C-major blip (Web Audio oscillator). */
export function playTapTone(freq = 523.25, durationMs = 120): void {
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume().catch(() => undefined);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0.0001;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}

export function pecsTapFeedback(options?: {
  vibrateMs?: number;
  freq?: number;
}): void {
  triggerHaptic(options?.vibrateMs ?? 25);
  playTapTone(options?.freq ?? 523.25);
}
