"use client";

import { useEffect, useState } from "react";
import RewardTrophyModal from "@/components/RewardTrophyModal";
import { playDing } from "@/utils/celebrate";
import { speakEnglish } from "@/utils/speech";
import {
  TROPHY_UNLOCKED_EVENT,
  type MilestoneTrophyDef,
  type TrophyUnlockedDetail,
} from "@/utils/trophies";

/**
 * Global listener mounted in AppShell that celebrates whenever any
 * Streak or Major Learning Milestone trophy is unlocked.
 */
export default function TrophyCelebrationListener() {
  const [queue, setQueue] = useState<MilestoneTrophyDef[]>([]);

  useEffect(() => {
    const onUnlocked = (event: Event) => {
      const detail = (event as CustomEvent<TrophyUnlockedDetail>).detail;
      if (!detail?.trophy) return;
      setQueue((prev) =>
        prev.some((t) => t.id === detail.trophy.id) ? prev : [...prev, detail.trophy],
      );
      playDing();
      speakEnglish(`Unlocked new trophy! ${detail.trophy.label}!`);
    };

    window.addEventListener(TROPHY_UNLOCKED_EVENT, onUnlocked);
    return () => window.removeEventListener(TROPHY_UNLOCKED_EVENT, onUnlocked);
  }, []);

  const current = queue[0] ?? null;

  return (
    <RewardTrophyModal
      open={Boolean(current)}
      milestoneName={current?.label}
      milestoneDescription={current?.description}
      onClose={() => setQueue((prev) => prev.slice(1))}
    />
  );
}
