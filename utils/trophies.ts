import { createClient } from "@/utils/supabase/client";
import { recordDailyProgressDelta } from "@/utils/dailyProgress";
import { addGuestTrophy, GUEST_CHILD_ID, isGuestChild } from "@/utils/guestProgress";

export type MilestoneTrophyId =
  | "streak-3"
  | "streak-7"
  | "streak-14"
  | "phonics-mastery"
  | "story-explorer"
  | "math-genius";

export type MilestoneTrophyDef = {
  id: MilestoneTrophyId;
  label: string;
  shareTitle: string;
  emoji: string;
  category: "streak" | "learning";
  description: string;
};

export const MILESTONE_TROPHIES: MilestoneTrophyDef[] = [
  {
    id: "streak-3",
    label: "Habit Starter",
    shareTitle: "3-Day Habit Starter 🏆",
    emoji: "🏆",
    category: "streak",
    description: "3-Day Consecutive Streak",
  },
  {
    id: "streak-7",
    label: "Weekly Champion",
    shareTitle: "7-Day Streak Champion 🏆",
    emoji: "🏆",
    category: "streak",
    description: "7-Day Consecutive Streak",
  },
  {
    id: "streak-14",
    label: "Super Scholar",
    shareTitle: "14-Day Super Scholar 🏆",
    emoji: "🏆",
    category: "streak",
    description: "14-Day Consecutive Streak",
  },
  {
    id: "phonics-mastery",
    label: "Phonics Trophy",
    shareTitle: "Phonics Mastery Champion 🏆",
    emoji: "🏆",
    category: "learning",
    description: "Completed all 26 letters A–Z",
  },
  {
    id: "story-explorer",
    label: "Storyteller Trophy",
    shareTitle: "Storyteller Champion 🏆",
    emoji: "🏆",
    category: "learning",
    description: "Completed 5 bedtime or audio stories",
  },
  {
    id: "math-genius",
    label: "Math Wizard Trophy",
    shareTitle: "Math Wizard Champion 🏆",
    emoji: "🏆",
    category: "learning",
    description: "Completed first 20 math challenges",
  },
];

export const TROPHY_UNLOCKED_EVENT = "kids:trophy-unlocked";

export type TrophyUnlockedDetail = {
  childId: string;
  trophy: MilestoneTrophyDef;
  unlockedTrophies: string[];
};

type ChildMilestoneTracker = {
  phonicsLetters: string[];
  completedStories: string[];
  mathChallenges: number;
  unlockedIds: string[];
};

function trackerKey(childId: string): string {
  return `growva_milestones_v1_${childId}`;
}

function readTracker(childId: string): ChildMilestoneTracker {
  if (typeof window === "undefined") {
    return { phonicsLetters: [], completedStories: [], mathChallenges: 0, unlockedIds: [] };
  }
  try {
    const raw = window.localStorage.getItem(trackerKey(childId));
    if (!raw) {
      return { phonicsLetters: [], completedStories: [], mathChallenges: 0, unlockedIds: [] };
    }
    const parsed = JSON.parse(raw) as Partial<ChildMilestoneTracker>;
    return {
      phonicsLetters: Array.isArray(parsed.phonicsLetters)
        ? parsed.phonicsLetters.filter((x): x is string => typeof x === "string")
        : [],
      completedStories: Array.isArray(parsed.completedStories)
        ? parsed.completedStories.filter((x): x is string => typeof x === "string")
        : [],
      mathChallenges: Number.isFinite(Number(parsed.mathChallenges))
        ? Math.max(0, Number(parsed.mathChallenges))
        : 0,
      unlockedIds: Array.isArray(parsed.unlockedIds)
        ? parsed.unlockedIds.filter((x): x is string => typeof x === "string")
        : [],
    };
  } catch {
    return { phonicsLetters: [], completedStories: [], mathChallenges: 0, unlockedIds: [] };
  }
}

function writeTracker(childId: string, next: ChildMilestoneTracker): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(trackerKey(childId), JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
}

export function getTrophyById(id: string): MilestoneTrophyDef | undefined {
  return MILESTONE_TROPHIES.find((t) => t.id === id);
}

/**
 * Returns the latest unlocked milestone trophy title for the Share Card
 * (e.g. "7-Day Streak Champion 🏆"), or null if no trophies are unlocked yet.
 */
export function getLatestTrophyTitle(unlockedTrophies: string[] | null | undefined): string | null {
  if (!unlockedTrophies || unlockedTrophies.length === 0) return null;
  for (let i = unlockedTrophies.length - 1; i >= 0; i--) {
    const found = getTrophyById(unlockedTrophies[i]);
    if (found) return found.shareTitle;
  }
  return null;
}

export type TrophyContext = {
  userId?: string | null;
  childId?: string | null;
  existingTrophies?: string[] | null;
};

/**
 * Awards a prestigious milestone trophy if not already unlocked.
 * Increments trophies_count by 1 (via unlocked_trophies array), persists to
 * Supabase or guest localStorage, and fires TROPHY_UNLOCKED_EVENT to open the celebration modal.
 */
export async function awardMilestoneTrophy(
  trophyId: MilestoneTrophyId,
  ctx: TrophyContext,
): Promise<boolean> {
  const def = getTrophyById(trophyId);
  if (!def) return false;

  const isGuest = !ctx.userId || !ctx.childId || isGuestChild(ctx.childId);
  const resolvedChildId = isGuest ? GUEST_CHILD_ID : (ctx.childId as string);
  const tracker = readTracker(resolvedChildId);

  const knownTrophies = Array.from(
    new Set([...(ctx.existingTrophies ?? []), ...tracker.unlockedIds]),
  );

  if (knownTrophies.includes(trophyId)) {
    return false;
  }

  let finalTrophies = [...knownTrophies, trophyId];

  if (isGuest) {
    const nextGuest = addGuestTrophy(trophyId);
    finalTrophies = Array.from(new Set([...finalTrophies, ...nextGuest.unlockedTrophies]));
  } else if (ctx.userId && ctx.childId) {
    try {
      const supabase = createClient();
      const { data: childRow } = await supabase
        .from("children")
        .select("unlocked_trophies")
        .eq("id", ctx.childId)
        .maybeSingle();

      const dbChildTrophies = Array.isArray(childRow?.unlocked_trophies)
        ? (childRow.unlocked_trophies as string[])
        : [];

      if (dbChildTrophies.includes(trophyId)) {
        // Already unlocked in DB — sync local cache silently without re-celebrating
        writeTracker(resolvedChildId, {
          ...tracker,
          unlockedIds: Array.from(new Set([...tracker.unlockedIds, ...dbChildTrophies])),
        });
        return false;
      }

      finalTrophies = Array.from(new Set([...dbChildTrophies, trophyId]));

      await supabase
        .from("children")
        .update({ unlocked_trophies: finalTrophies })
        .eq("id", ctx.childId);

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("unlocked_trophies")
        .eq("id", ctx.userId)
        .maybeSingle();

      const dbProfileTrophies = Array.isArray(profileRow?.unlocked_trophies)
        ? (profileRow.unlocked_trophies as string[])
        : [];

      if (!dbProfileTrophies.includes(trophyId)) {
        await supabase
          .from("profiles")
          .update({ unlocked_trophies: [...dbProfileTrophies, trophyId] })
          .eq("id", ctx.userId);
      }
    } catch {
      // Offline fallback: local cache still reflects it and event still celebrates
    }
  }

  writeTracker(resolvedChildId, {
    ...tracker,
    unlockedIds: Array.from(new Set([...tracker.unlockedIds, trophyId])),
  });

  recordDailyProgressDelta({
    childId: resolvedChildId,
    trophiesDelta: 1,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<TrophyUnlockedDetail>(TROPHY_UNLOCKED_EVENT, {
        detail: {
          childId: resolvedChildId,
          trophy: def,
          unlockedTrophies: finalTrophies,
        },
      }),
    );
  }

  return true;
}

/**
 * Checks Streak Milestones:
 * - 3-Day Consecutive Streak -> "Habit Starter"
 * - 7-Day Consecutive Streak -> "Weekly Champion"
 * - 14-Day Consecutive Streak -> "Super Scholar"
 */
export async function checkStreakMilestones(
  streakDays: number,
  ctx: TrophyContext,
): Promise<void> {
  if (!Number.isFinite(streakDays) || streakDays < 3) return;
  if (streakDays >= 3) {
    await awardMilestoneTrophy("streak-3", ctx);
  }
  if (streakDays >= 7) {
    await awardMilestoneTrophy("streak-7", ctx);
  }
  if (streakDays >= 14) {
    await awardMilestoneTrophy("streak-14", ctx);
  }
}

/**
 * Learning Milestone: Phonics Mastery (completed all 26 letters A-Z).
 */
export async function recordPhonicsLetterCompleted(
  letter: string,
  ctx: TrophyContext,
): Promise<number> {
  const normalized = letter.trim().toUpperCase().slice(0, 1);
  if (!/^[A-Z]$/.test(normalized)) return 0;

  const isGuest = !ctx.userId || !ctx.childId || isGuestChild(ctx.childId);
  const resolvedChildId = isGuest ? GUEST_CHILD_ID : (ctx.childId as string);
  const tracker = readTracker(resolvedChildId);

  const letters = tracker.phonicsLetters.includes(normalized)
    ? tracker.phonicsLetters
    : [...tracker.phonicsLetters, normalized];

  writeTracker(resolvedChildId, { ...tracker, phonicsLetters: letters });

  if (letters.length >= 26) {
    await awardMilestoneTrophy("phonics-mastery", ctx);
  }

  return letters.length;
}

/**
 * Learning Milestone: Story Explorer (completed 5 bedtime/audio stories).
 */
export async function recordStoryCompleted(
  storyId: string,
  ctx: TrophyContext,
): Promise<number> {
  const cleanId = storyId.trim();
  if (!cleanId) return 0;

  const isGuest = !ctx.userId || !ctx.childId || isGuestChild(ctx.childId);
  const resolvedChildId = isGuest ? GUEST_CHILD_ID : (ctx.childId as string);
  const tracker = readTracker(resolvedChildId);

  const stories = tracker.completedStories.includes(cleanId)
    ? tracker.completedStories
    : [...tracker.completedStories, cleanId];

  writeTracker(resolvedChildId, { ...tracker, completedStories: stories });

  if (stories.length >= 5) {
    await awardMilestoneTrophy("story-explorer", ctx);
  }

  return stories.length;
}

/**
 * Learning Milestone: Math Genius (completed first 20 math challenges).
 */
export async function recordMathChallengeCompleted(
  ctx: TrophyContext,
): Promise<number> {
  const isGuest = !ctx.userId || !ctx.childId || isGuestChild(ctx.childId);
  const resolvedChildId = isGuest ? GUEST_CHILD_ID : (ctx.childId as string);
  const tracker = readTracker(resolvedChildId);

  const nextCount = tracker.mathChallenges + 1;
  writeTracker(resolvedChildId, { ...tracker, mathChallenges: nextCount });

  if (nextCount >= 20) {
    await awardMilestoneTrophy("math-genius", ctx);
  }

  return nextCount;
}
