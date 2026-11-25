"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SENSORY_PREFS,
  SENSORY_PREFS_CHANGE_EVENT,
  getSensoryPrefs,
  setSensoryPrefs,
  type SensoryPrefs,
} from "@/utils/sensoryPrefs";

export function useSensoryPrefs() {
  const [prefs, setPrefs] = useState<SensoryPrefs>(DEFAULT_SENSORY_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apply = (next: SensoryPrefs) => {
      setPrefs(next);
      document.documentElement.dataset.reducedMotion = next.reducedMotion
        ? "true"
        : "false";
    };

    apply(getSensoryPrefs());
    setReady(true);

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<SensoryPrefs>).detail;
      apply(detail ?? getSensoryPrefs());
    };

    window.addEventListener(SENSORY_PREFS_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(SENSORY_PREFS_CHANGE_EVENT, onChange);
  }, []);

  const updatePrefs = useCallback((patch: Partial<SensoryPrefs>) => {
    const next = setSensoryPrefs(patch);
    setPrefs(next);
    return next;
  }, []);

  return { prefs, ready, updatePrefs };
}
