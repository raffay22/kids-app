import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DAILY_STREAK_ROUTE,
  STREAK_UPDATED_EVENT,
  todayLocalISO,
  yesterdayLocalISO,
  type StreakUpdatedDetail,
} from "@/utils/streaks";

export const GUEST_CHILD_ID = "guest-local";
export const GUEST_PROGRESS_STORAGE_KEY = "kids_guest_progress_v1";
export const GUEST_PROGRESS_UPDATED_EVENT = "kids:guest-progress-updated";

export type GuestProgressState = {
  stars: number;
  streakCount: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  unlockedToys: string[];
  unlockedTrophies: string[];
};

export function emptyGuestProgress(): GuestProgressState {
  return {
    stars: 0,
    streakCount: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    unlockedToys: [],
    unlockedTrophies: [],
  };
}

export function isGuestChild(childId: string | null | undefined): boolean {
  return childId === GUEST_CHILD_ID;
}

export function readGuestProgress(): GuestProgressState {
  if (typeof window === "undefined") return emptyGuestProgress();
  try {
    const raw = window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY);
    if (!raw) return emptyGuestProgress();
    const parsed = JSON.parse(raw) as Partial<GuestProgressState>;
    return {
      stars: Number.isFinite(Number(parsed.stars)) ? Math.max(0, Number(parsed.stars)) : 0,
      streakCount: Number.isFinite(Number(parsed.streakCount))
        ? Math.max(0, Number(parsed.streakCount))
        : 0,
      longestStreak: Number.isFinite(Number(parsed.longestStreak))
        ? Math.max(0, Number(parsed.longestStreak))
        : 0,
      lastPlayedDate:
        typeof parsed.lastPlayedDate === "string" ? parsed.lastPlayedDate : null,
      unlockedToys: Array.isArray(parsed.unlockedToys)
        ? parsed.unlockedToys.filter((t): t is string => typeof t === "string")
        : [],
      unlockedTrophies: Array.isArray(parsed.unlockedTrophies)
        ? parsed.unlockedTrophies.filter((t): t is string => typeof t === "string")
        : [],
    };
  } catch {
    return emptyGuestProgress();
  }
}

function writeGuestProgress(next: GuestProgressState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent<GuestProgressState>(GUEST_PROGRESS_UPDATED_EVENT, {
        detail: next,
      }),
    );
  } catch {
    // ignore storage quota errors
  }
}

export function addGuestStars(
  delta: number,
  unlockedToys?: string[],
): GuestProgressState {
  const prev = readGuestProgress();
  const safeDelta = Number.isFinite(delta) ? Math.max(0, Math.floor(delta)) : 0;
  const mergedToys = unlockedToys
    ? Array.from(new Set([...prev.unlockedToys, ...unlockedToys]))
    : prev.unlockedToys;

  const next: GuestProgressState = {
    ...prev,
    stars: prev.stars + safeDelta,
    unlockedToys: mergedToys,
  };
  writeGuestProgress(next);
  return next;
}

export function addGuestTrophy(trophyId: string): GuestProgressState {
  const prev = readGuestProgress();
  if (prev.unlockedTrophies.includes(trophyId)) return prev;
  const next: GuestProgressState = {
    ...prev,
    unlockedTrophies: [...prev.unlockedTrophies, trophyId],
  };
  writeGuestProgress(next);
  return next;
}

export function recordGuestPractice(): GuestProgressState {
  const prev = readGuestProgress();
  const today = todayLocalISO();
  const yesterday = yesterdayLocalISO();

  let streakCount = prev.streakCount;
  let longestStreak = prev.longestStreak;

  if (prev.lastPlayedDate === today) {
    streakCount = Math.max(1, prev.streakCount);
    longestStreak = Math.max(prev.longestStreak, streakCount);
  } else if (prev.lastPlayedDate === yesterday) {
    streakCount = prev.streakCount + 1;
    longestStreak = Math.max(prev.longestStreak, streakCount);
  } else {
    streakCount = 1;
    longestStreak = Math.max(1, prev.longestStreak);
  }

  const next: GuestProgressState = {
    ...prev,
    streakCount,
    longestStreak,
    lastPlayedDate: today,
  };
  writeGuestProgress(next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<StreakUpdatedDetail>(STREAK_UPDATED_EVENT, {
        detail: {
          childId: GUEST_CHILD_ID,
          current: streakCount,
          longest: longestStreak,
          lastPracticeDate: today,
        },
      }),
    );
    if (streakCount >= 3) {
      void import("@/utils/trophies").then(({ checkStreakMilestones }) =>
        checkStreakMilestones(streakCount, {
          childId: GUEST_CHILD_ID,
          existingTrophies: next.unlockedTrophies,
        }),
      );
    }
  }

  return next;
}

export function clearGuestProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_PROGRESS_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent<GuestProgressState>(GUEST_PROGRESS_UPDATED_EVENT, {
        detail: emptyGuestProgress(),
      }),
    );
  } catch {
    // ignore
  }
}

let mergeInFlight: Promise<{ mergedStars: number; mergedStreak: number }> | null = null;

/**
 * Merge localStorage guest stars, toys, and daily streak into a permanent child profile.
 * Clears guest progress immediately after a successful DB merge so it can never double-count.
 */
export async function mergeGuestProgressToAccount(
  supabase: SupabaseClient,
  userId: string,
  childId: string,
): Promise<{ mergedStars: number; mergedStreak: number }> {
  if (mergeInFlight) return mergeInFlight;

  const run = async (): Promise<{ mergedStars: number; mergedStreak: number }> => {
    const guest = readGuestProgress();
    if (
      guest.stars <= 0 &&
      guest.streakCount <= 0 &&
      guest.unlockedToys.length === 0
    ) {
      return { mergedStars: 0, mergedStreak: 0 };
    }

    let mergedStars = 0;
    let mergedStreak = 0;

    // 1. Merge stars and unlocked toys into `children`
    if (guest.stars > 0 || guest.unlockedToys.length > 0) {
      const { data: childRow, error: childReadErr } = await supabase
        .from("children")
        .select("stars, unlocked_toys")
        .eq("id", childId)
        .maybeSingle();

      if (childReadErr) {
        return { mergedStars: 0, mergedStreak: 0 };
      }

      const existingStars = Number(childRow?.stars ?? 0);
      const existingToys = Array.isArray(childRow?.unlocked_toys)
        ? (childRow.unlocked_toys as string[])
        : [];
      const nextStars = existingStars + guest.stars;
      const nextToys = Array.from(new Set([...existingToys, ...guest.unlockedToys]));

      const { error: childUpdateErr } = await supabase
        .from("children")
        .update({
          stars: nextStars,
          unlocked_toys: nextToys,
        })
        .eq("id", childId);

      if (childUpdateErr) {
        return { mergedStars: 0, mergedStreak: 0 };
      }
      mergedStars = guest.stars;
    }

    // 2. Check existing `user_streaks` row cleanly before updating
    if (guest.streakCount > 0) {
      const { data: existingStreak, error: streakReadErr } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_practice_date")
        .eq("user_id", userId)
        .eq("child_id", childId)
        .eq("feature_route", DAILY_STREAK_ROUTE)
        .maybeSingle();

      if (!streakReadErr) {
        const prevCurrent = Number(existingStreak?.current_streak ?? 0);
        const prevLongest = Number(existingStreak?.longest_streak ?? 0);
        const prevDate = (existingStreak?.last_practice_date as string | null) ?? null;

        const nextCurrent = Math.max(prevCurrent, guest.streakCount);
        const nextLongest = Math.max(prevLongest, guest.longestStreak, nextCurrent);
        const guestDate = guest.lastPlayedDate ?? todayLocalISO();
        const nextDate =
          prevDate && prevDate > guestDate ? prevDate : guestDate;

        const { error: streakUpsertErr } = await supabase
          .from("user_streaks")
          .upsert(
            {
              user_id: userId,
              child_id: childId,
              feature_route: DAILY_STREAK_ROUTE,
              current_streak: nextCurrent,
              longest_streak: nextLongest,
              last_practice_date: nextDate,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "child_id,feature_route" },
          );

        if (!streakUpsertErr) {
          mergedStreak = nextCurrent;
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent<StreakUpdatedDetail>(STREAK_UPDATED_EVENT, {
                detail: {
                  childId,
                  current: nextCurrent,
                  longest: nextLongest,
                  lastPracticeDate: nextDate,
                },
              }),
            );
          }
        }
      }
    }

    // 3. Clear guest progress immediately after successful merge to prevent double-counting
    clearGuestProgress();
    return { mergedStars, mergedStreak };
  };

  mergeInFlight = run().finally(() => {
    mergeInFlight = null;
  });

  return mergeInFlight;
}
