import type { Profile } from "@/types/database";

export const FREE_MAX_TROLLEY_LETTERS = 3;
export const PRO_MAX_TROLLEY_LETTERS = 8;

type ProfileWithLegacyFlag = Profile & {
  is_membership_active?: boolean;
};

/**
 * True when the parent account has active Pro membership.
 * Supports both `subscription_status === "pro"` and `is_membership_active === true`.
 */
export function isProMembership(
  profile: Profile | ProfileWithLegacyFlag | null | undefined,
): boolean {
  if (!profile) return false;
  const legacy = (profile as ProfileWithLegacyFlag).is_membership_active;
  if (legacy === true) return true;
  return profile.subscription_status === "pro";
}

export function getMaxSelectableLetters(
  profile: Profile | ProfileWithLegacyFlag | null | undefined,
): number {
  return isProMembership(profile)
    ? PRO_MAX_TROLLEY_LETTERS
    : FREE_MAX_TROLLEY_LETTERS;
}
