/** Parent sensory / ASD prefs — localStorage + change events. */

export const SENSORY_PREFS_STORAGE_KEY = "kids-app-sensory-prefs-v1";
export const SENSORY_PREFS_CHANGE_EVENT = "kids-app-sensory-prefs-change";
export const SENSORY_GATE_SESSION_KEY = "kids-app-sensory-gate-ok";

export const DEFAULT_ANIMATION_LOOP_CAP = 3;
export const TTS_SPEED_MIN = 0.5;
export const TTS_SPEED_MAX = 1.0;
export const DEFAULT_TTS_SPEED = 0.72;

export type SensoryPrefs = {
  /** When true: no video/Lottie loops; static frames only. */
  reducedMotion: boolean;
  /** Absolute Web Speech rate (0.5–1.0). */
  ttsSpeed: number;
  /** Add ASD PECS hub card beside normal dashboard cards. */
  asdPecsMode: boolean;
  /** Hide normal hubs; show only the 7 sensory activities. */
  onlyAsdPecsMode: boolean;
};

export const DEFAULT_SENSORY_PREFS: SensoryPrefs = {
  reducedMotion: false,
  ttsSpeed: DEFAULT_TTS_SPEED,
  asdPecsMode: false,
  onlyAsdPecsMode: false,
};

function clampTtsSpeed(value: number): number {
  if (Number.isNaN(value)) return DEFAULT_TTS_SPEED;
  return Math.min(TTS_SPEED_MAX, Math.max(TTS_SPEED_MIN, value));
}

function parsePrefs(raw: string | null): SensoryPrefs {
  if (!raw) return { ...DEFAULT_SENSORY_PREFS };
  try {
    const data = JSON.parse(raw) as Partial<SensoryPrefs>;
    return {
      reducedMotion: Boolean(data.reducedMotion),
      ttsSpeed: clampTtsSpeed(Number(data.ttsSpeed ?? DEFAULT_TTS_SPEED)),
      asdPecsMode: Boolean(data.asdPecsMode),
      onlyAsdPecsMode: Boolean(data.onlyAsdPecsMode),
    };
  } catch {
    return { ...DEFAULT_SENSORY_PREFS };
  }
}

export function getSensoryPrefs(): SensoryPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_SENSORY_PREFS };
  try {
    return parsePrefs(window.localStorage.getItem(SENSORY_PREFS_STORAGE_KEY));
  } catch {
    return { ...DEFAULT_SENSORY_PREFS };
  }
}

export function setSensoryPrefs(patch: Partial<SensoryPrefs>): SensoryPrefs {
  const current = getSensoryPrefs();
  const next: SensoryPrefs = {
    ...current,
    ...patch,
    ttsSpeed: clampTtsSpeed(Number(patch.ttsSpeed ?? current.ttsSpeed)),
  };

  // Only-ASD implies the hub is active.
  if (next.onlyAsdPecsMode) next.asdPecsMode = true;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        SENSORY_PREFS_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // ignore quota
    }
    document.documentElement.dataset.reducedMotion = next.reducedMotion
      ? "true"
      : "false";
    window.dispatchEvent(
      new CustomEvent(SENSORY_PREFS_CHANGE_EVENT, { detail: next }),
    );
  }

  return next;
}

/** Max video/Lottie loops: 0 when reduced motion, else 3. */
export function getAnimationLoopCap(prefs?: SensoryPrefs): number {
  const p = prefs ?? getSensoryPrefs();
  return p.reducedMotion ? 0 : DEFAULT_ANIMATION_LOOP_CAP;
}

export function getSensoryTtsSpeed(prefs?: SensoryPrefs): number {
  return (prefs ?? getSensoryPrefs()).ttsSpeed;
}

export function isSensoryGateUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SENSORY_GATE_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockSensoryGate(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SENSORY_GATE_SESSION_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearSensoryGate(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SENSORY_GATE_SESSION_KEY);
  } catch {
    // ignore
  }
}
