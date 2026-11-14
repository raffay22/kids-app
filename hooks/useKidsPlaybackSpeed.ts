"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_KIDS_SLOW_SPEED,
  getKidsSlowSpeed,
  KIDS_SLOW_SPEED_CHANGE_EVENT,
  KIDS_SLOW_SPEED_STORAGE_KEY,
  setKidsSlowSpeed,
  type KidsSlowSpeed,
} from "@/utils/kidsPlaybackSpeed";

export function useKidsPlaybackSpeed() {
  const [speed, setSpeed] = useState<KidsSlowSpeed>(DEFAULT_KIDS_SLOW_SPEED);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSpeed(getKidsSlowSpeed());
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== KIDS_SLOW_SPEED_STORAGE_KEY) return;
      setSpeed(getKidsSlowSpeed());
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<KidsSlowSpeed>).detail;
      if (detail === "normal" || detail === "slower" || detail === "slowest") {
        setSpeed(detail);
      } else {
        setSpeed(getKidsSlowSpeed());
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(KIDS_SLOW_SPEED_CHANGE_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(KIDS_SLOW_SPEED_CHANGE_EVENT, onCustom);
    };
  }, []);

  const setSlowSpeed = useCallback((next: KidsSlowSpeed) => {
    setKidsSlowSpeed(next);
    setSpeed(next);
  }, []);

  return { speed, ready, setSlowSpeed };
}
