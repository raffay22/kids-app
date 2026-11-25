"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { createClient } from "@/utils/supabase/client";
import {
  DAILY_STREAK_ROUTE,
  STREAK_UPDATED_EVENT,
  recordDailyPractice,
  todayLocalISO,
  type StreakUpdatedDetail,
} from "@/utils/streaks";
import {
  GUEST_CHILD_ID,
  GUEST_PROGRESS_UPDATED_EVENT,
  isGuestChild,
  readGuestProgress,
  recordGuestPractice,
} from "@/utils/guestProgress";

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
};

function emptyStreak(): StreakState {
  return { currentStreak: 0, longestStreak: 0, lastPracticeDate: null };
}

/**
 * Load / update the active child's daily practice streak in `user_streaks`.
 */
export function useStreak() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const [streak, setStreak] = useState<StreakState>(emptyStreak());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || !activeChild || isGuestChild(activeChild.id)) {
      const guest = readGuestProgress();
      setStreak({
        currentStreak: guest.streakCount,
        longestStreak: guest.longestStreak,
        lastPracticeDate: guest.lastPlayedDate,
      });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_practice_date")
        .eq("user_id", user.id)
        .eq("child_id", activeChild.id)
        .eq("feature_route", DAILY_STREAK_ROUTE)
        .maybeSingle();
      if (data) {
        setStreak({
          currentStreak: data.current_streak ?? 0,
          longestStreak: data.longest_streak ?? 0,
          lastPracticeDate: data.last_practice_date ?? null,
        });
      } else {
        setStreak(emptyStreak());
      }
    } catch {
      // offline
    } finally {
      setLoading(false);
    }
  }, [user, activeChild]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Retroactively & continuously sync streak milestone trophies (3 / 7 / 14 days)
  // so children who already reached a 3+ day streak immediately receive their trophy.
  useEffect(() => {
    const bestStreak = Math.max(streak.currentStreak, streak.longestStreak);
    if (bestStreak < 3) return;
    if (!activeChild) return;
    const existing = activeChild.unlocked_trophies ?? [];
    const needsCheck =
      (bestStreak >= 3 && !existing.includes("streak-3")) ||
      (bestStreak >= 7 && !existing.includes("streak-7")) ||
      (bestStreak >= 14 && !existing.includes("streak-14"));
    if (!needsCheck) return;

    void import("@/utils/trophies").then(({ checkStreakMilestones }) =>
      checkStreakMilestones(bestStreak, {
        userId: user?.id,
        childId: activeChild.id,
        existingTrophies: existing,
      }),
    );
  }, [streak.currentStreak, streak.longestStreak, user?.id, activeChild]);

  // Update instantly when a streak is saved elsewhere (e.g. from logProgress or guest mode).
  const activeChildId = user ? (activeChild?.id ?? null) : GUEST_CHILD_ID;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStreakUpdated = (event: Event) => {
      const detail = (event as CustomEvent<StreakUpdatedDetail>).detail;
      if (!detail || detail.childId !== activeChildId) return;
      setStreak({
        currentStreak: detail.current,
        longestStreak: detail.longest,
        lastPracticeDate: detail.lastPracticeDate,
      });
    };
    const onGuestUpdated = () => {
      if (user) return;
      const guest = readGuestProgress();
      setStreak({
        currentStreak: guest.streakCount,
        longestStreak: guest.longestStreak,
        lastPracticeDate: guest.lastPlayedDate,
      });
    };
    window.addEventListener(STREAK_UPDATED_EVENT, onStreakUpdated);
    window.addEventListener(GUEST_PROGRESS_UPDATED_EVENT, onGuestUpdated);
    return () => {
      window.removeEventListener(STREAK_UPDATED_EVENT, onStreakUpdated);
      window.removeEventListener(GUEST_PROGRESS_UPDATED_EVENT, onGuestUpdated);
    };
  }, [activeChildId, user]);

  const recordPractice = useCallback(async () => {
    if (!user || !activeChild || isGuestChild(activeChild.id)) {
      const guest = recordGuestPractice();
      const next: StreakState = {
        currentStreak: guest.streakCount,
        longestStreak: guest.longestStreak,
        lastPracticeDate: guest.lastPlayedDate,
      };
      setStreak(next);
      return next;
    }
    const result = await recordDailyPractice(user.id, activeChild.id);
    if (result) {
      const next: StreakState = {
        currentStreak: result.current,
        longestStreak: result.longest,
        lastPracticeDate: todayLocalISO(),
      };
      setStreak(next);
      return next;
    }
    await refresh();
    return streak;
  }, [user, activeChild, streak, refresh]);

  return {
    ...streak,
    loading,
    refresh,
    recordPractice,
    practicedToday: streak.lastPracticeDate === todayLocalISO(),
  };
}
