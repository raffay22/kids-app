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

export type AmbientKind = "rain" | "ocean" | "wind";

type AmbientHandles = {
  stop: () => void;
};

const activeAmbients = new Set<AmbientHandles>();

function stopAllAmbients(): void {
  activeAmbients.forEach((handle) => {
    try {
      handle.stop();
    } catch {
      // ignore
    }
  });
  activeAmbients.clear();
}

function makeNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = rate * seconds;
  const buffer = ctx.createBuffer(1, len, rate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // Brown-ish noise (soft, calming)
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

/** Toggle procedural ambient soundscape. Passing null / same kind stops. */
export function toggleAmbientSound(kind: AmbientKind | null): AmbientKind | null {
  stopAllAmbients();
  if (kind == null) return null;

  const ctx = getCtx();
  if (!ctx) return null;
  void ctx.resume().catch(() => undefined);

  const source = ctx.createBufferSource();
  source.buffer = makeNoiseBuffer(ctx, 2.5);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;

  // Louder, clearer ambient levels (still soft for sensory calm).
  if (kind === "rain") {
    filter.type = "highpass";
    filter.frequency.value = 750;
    filter.Q.value = 0.6;
    gain.gain.setTargetAtTime(0.22, ctx.currentTime, 0.15);
  } else if (kind === "ocean") {
    filter.type = "lowpass";
    filter.frequency.value = 320;
    filter.Q.value = 0.45;
    gain.gain.setTargetAtTime(0.26, ctx.currentTime, 0.2);
  } else {
    filter.type = "bandpass";
    filter.frequency.value = 480;
    filter.Q.value = 0.35;
    gain.gain.setTargetAtTime(0.2, ctx.currentTime, 0.18);
  }

  // Soft LFO for ocean swell / wind breath
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = kind === "ocean" ? 0.12 : kind === "wind" ? 0.18 : 0.35;
  lfoGain.gain.value = kind === "rain" ? 0.04 : 0.055;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  lfo.start();

  const handle: AmbientHandles = {
    stop: () => {
      try {
        const now = ctx.currentTime;
        lfoGain.disconnect();
        lfo.disconnect();
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        try {
          source.stop();
        } catch {
          // ignore if already stopped
        }
        try {
          lfo.stop();
        } catch {
          // ignore if already stopped
        }
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        // ignore
      }
    },
  };

  activeAmbients.add(handle);
  return kind;
}

export function stopAmbientSound(): void {
  stopAllAmbients();
}
