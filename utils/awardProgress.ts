import { recordDailyProgressDelta } from "@/utils/dailyProgress";
import { addGuestStars, isGuestChild, recordGuestPractice } from "@/utils/guestProgress";

/**
 * Record guest stars and/or daily practice in localStorage when playing without an account.
 * Returns true if handled in guest mode (caller should skip Supabase DB writes).
 */
export function handleGuestAward(options: {
  userId?: string | null;
  childId?: string | null;
  deltaStars?: number;
  recordPractice?: boolean;
  unlockedToys?: string[];
}): boolean {
  const isGuest = !options.userId || isGuestChild(options.childId);
  if (!isGuest) return false;

  if (options.deltaStars && options.deltaStars > 0) {
    addGuestStars(options.deltaStars, options.unlockedToys);
  } else if (options.unlockedToys && options.unlockedToys.length > 0) {
    addGuestStars(0, options.unlockedToys);
  }

  if (options.recordPractice !== false) {
    recordGuestPractice();
  }

  recordDailyProgressDelta({
    childId: options.childId,
    starsDelta: options.deltaStars ?? 0,
    activitiesDelta: 1,
  });

  return true;
}
