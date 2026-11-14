"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  getSensoryPrefs,
  setSensoryPrefs,
} from "@/utils/sensoryPrefs";

/** Syncs profile.reduce_motion into local sensory prefs once auth is ready. */
export default function SensoryBootstrap() {
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const local = getSensoryPrefs();
    // Apply data attribute immediately for CSS.
    document.documentElement.dataset.reducedMotion = local.reducedMotion
      ? "true"
      : "false";

    if (!profile) return;
    if (profile.reduce_motion && !local.reducedMotion) {
      setSensoryPrefs({ reducedMotion: true });
    }
  }, [loading, profile]);

  return null;
}
