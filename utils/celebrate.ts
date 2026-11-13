"use client";

import confetti from "canvas-confetti";

const KID_COLORS = ["#f472b6", "#fb923c", "#facc15", "#4ade80", "#38bdf8", "#a78bfa"];

/** Big center confetti burst for correct answers */
export function burstConfetti() {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 38,
    origin: { y: 0.65 },
    colors: KID_COLORS,
    scalar: 1.15,
    disableForReducedMotion: true,
  });
}

/** Longer star-shaped shower for trophies / big wins */
export function starShower() {
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: KID_COLORS,
      shapes: ["star"],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: KID_COLORS,
      shapes: ["star"],
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function tone(ctx: AudioContext, freq: number, start: number, duration: number, volume = 0.18) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

/** Cheerful ascending "Ding! Great job!" chime (zero MP3 — Web Audio synth) */
export function playDing() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 523.25, 0, 0.18); // C5
  tone(ctx, 659.25, 0.09, 0.18); // E5
  tone(ctx, 783.99, 0.18, 0.28, 0.22); // G5
  tone(ctx, 1046.5, 0.3, 0.4, 0.16); // C6 sparkle
}

/** Gentle two-note "try again" boop — encouraging, not sad */
export function playBoop() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 392, 0, 0.15, 0.12); // G4
  tone(ctx, 440, 0.12, 0.2, 0.12); // A4
}

/** Soft metallic coin clink for jar / tray drops */
export function playClink() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 880, 0, 0.08, 0.14);
  tone(ctx, 1174.7, 0.05, 0.12, 0.1);
}

/** Soft saving-box drop for subtraction take-away */
export function playBankSave() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 392, 0, 0.1, 0.12);
  tone(ctx, 523.25, 0.08, 0.16, 0.1);
}

/** Short pop for puzzle snap / shape blast */
export function playPop() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 660, 0, 0.06, 0.16);
  tone(ctx, 880, 0.04, 0.08, 0.12);
  tone(ctx, 1175, 0.09, 0.1, 0.08);
}
