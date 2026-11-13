import type { Profile } from "@/types/database";
import { isProUser } from "@/lib/membership";

export {
  FORCE_FREE_TEST_MODE,
  OPEN_ACCESS_TEST_MODE,
  hideProPaywalls,
  isProUser,
} from "@/lib/membership";

export const FREE_MAX_TROLLEY_LETTERS = 3;
export const PRO_MAX_TROLLEY_LETTERS = 8;
export const FREE_MAX_COIN_PURCHASES = 3;
/** Free memory boards: 2x2 or 2x3 only (2–3 pairs). */
export const FREE_MAX_MEMORY_PAIRS = 3;
/** Pro memory boards: up to 3x4 (6 pairs). */
export const PRO_MAX_MEMORY_PAIRS = 6;

type ProfileWithLegacyFlag = Profile & {
  is_membership_active?: boolean;
};

/**
 * True when the parent account has active Pro membership.
 * Delegates to `lib/membership.ts` so OPEN_ACCESS_TEST_MODE applies everywhere.
 */
export function isProMembership(
  profile: Profile | ProfileWithLegacyFlag | null | undefined,
): boolean {
  return isProUser(profile);
}

export function getMaxSelectableLetters(
  profile: Profile | ProfileWithLegacyFlag | null | undefined,
): number {
  return isProMembership(profile)
    ? PRO_MAX_TROLLEY_LETTERS
    : FREE_MAX_TROLLEY_LETTERS;
}
