import { createClient } from "@/utils/supabase/client";

/** App-wide daily practice streak key (UNIQUE child_id + feature_route). */
export const DAILY_STREAK_ROUTE = "daily";

/** Browser event fired after a daily streak is saved. */
export const STREAK_UPDATED_EVENT = "kids:streak-updated";

export type StreakUpdatedDetail = {
  childId: string;
  current: number;
  longest: number;
  lastPracticeDate: string;
};

export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function yesterdayLocalISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Fire-and-forget streak bump used from logProgress (no React). */
export async function recordDailyPractice(
  userId: string,
  childId: string,
): Promise<{ current: number; longest: number } | null> {
  try {
    const supabase = createClient();
    const today = todayLocalISO();
    const yesterday = yesterdayLocalISO();
    const { data } = await supabase
      .from("user_streaks")
      .select("current_streak, longest_streak, last_practice_date")
      .eq("user_id", userId)
      .eq("child_id", childId)
      .eq("feature_route", DAILY_STREAK_ROUTE)
      .maybeSingle();

    if (data?.last_practice_date === today) {
      return {
        current: data.current_streak ?? 0,
        longest: data.longest_streak ?? 0,
      };
    }

    let current = 1;
    let longest = Math.max(1, data?.longest_streak ?? 0);
    if (data?.last_practice_date === yesterday) {
      current = (data.current_streak ?? 0) + 1;
      longest = Math.max(longest, current);
    }

    await supabase.from("user_streaks").upsert(
      {
        user_id: userId,
        child_id: childId,
        feature_route: DAILY_STREAK_ROUTE,
        current_streak: current,
        longest_streak: longest,
        last_practice_date: today,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "child_id,feature_route" },
    );

    if (typeof window !== "undefined") {
      window.localStorage.setItem(`streak_last_${childId}`, today);
      window.localStorage.setItem(`streak_current_${childId}`, String(current));
      // Let mounted UI (e.g. navbar streak pill) update without a page refresh.
      window.dispatchEvent(
        new CustomEvent<StreakUpdatedDetail>(STREAK_UPDATED_EVENT, {
          detail: { childId, current, longest, lastPracticeDate: today },
        }),
      );
      if (current >= 3) {
        void import("@/utils/trophies").then(({ checkStreakMilestones }) =>
          checkStreakMilestones(current, { userId, childId }),
        );
      }
    }
    return { current, longest };
  } catch {
    return null;
  }
}

export function readCachedStreak(childId: string | null | undefined): {
  current: number;
  last: string | null;
} {
  if (!childId || typeof window === "undefined") {
    return { current: 0, last: null };
  }
  const current = Number(
    window.localStorage.getItem(`streak_current_${childId}`) || "0",
  );
  const last = window.localStorage.getItem(`streak_last_${childId}`);
  return {
    current: Number.isFinite(current) ? current : 0,
    last,
  };
}
