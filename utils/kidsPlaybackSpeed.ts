/**
 * Slow-only playback for phonics + Under-3 stories.
 * No "fast" option — parents can only slow further.
 */

export type KidsSlowSpeed = "normal" | "slower" | "slowest";

export const KIDS_SLOW_SPEED_STORAGE_KEY = "kids-app-slow-speed-v1";
export const KIDS_SLOW_SPEED_CHANGE_EVENT = "kids-app-slow-speed-change";

export const DEFAULT_KIDS_SLOW_SPEED: KidsSlowSpeed = "normal";

/** Multipliers on top of the toddler baseline (already soft/slow). */
export const KIDS_SLOW_SPEED_MULTIPLIER: Record<KidsSlowSpeed, number> = {
  normal: 1,
  slower: 0.85,
  slowest: 0.7,
};

export const KIDS_SLOW_SPEED_LABEL: Record<KidsSlowSpeed, string> = {
  normal: "Normal",
  slower: "Slower",
  slowest: "Slowest",
};

export function isKidsSlowSpeed(value: unknown): value is KidsSlowSpeed {
  return value === "normal" || value === "slower" || value === "slowest";
}

export function getKidsSlowSpeed(): KidsSlowSpeed {
  if (typeof window === "undefined") return DEFAULT_KIDS_SLOW_SPEED;
  try {
    const raw = window.localStorage.getItem(KIDS_SLOW_SPEED_STORAGE_KEY);
    return isKidsSlowSpeed(raw) ? raw : DEFAULT_KIDS_SLOW_SPEED;
  } catch {
    return DEFAULT_KIDS_SLOW_SPEED;
  }
}

export function setKidsSlowSpeed(next: KidsSlowSpeed): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KIDS_SLOW_SPEED_STORAGE_KEY, next);
  } catch {
    // ignore
  }
  window.dispatchEvent(
    new CustomEvent(KIDS_SLOW_SPEED_CHANGE_EVENT, { detail: next }),
  );
}

/** Effective media playback rate from toddler baseline × slow multiplier. */
export function resolveKidsMediaRate(baseline: number): number {
  const mult = KIDS_SLOW_SPEED_MULTIPLIER[getKidsSlowSpeed()];
  return Math.min(1, Math.max(0.5, baseline * mult));
}
