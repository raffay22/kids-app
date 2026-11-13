/**
 * Centralized Pro Membership Feature Flag.
 * Import `isProUser` / `OPEN_ACCESS_TEST_MODE` for Free vs Pro gating across the app.
 */

// 🧪 TESTING TOGGLE: Set to true while building/testing so every game & feature is unlocked.
// Set to false later when real Pro pricing / membership gating ships.
export const OPEN_ACCESS_TEST_MODE = true;

/** @deprecated Use OPEN_ACCESS_TEST_MODE. Kept so older imports keep working. */
export const FORCE_FREE_TEST_MODE = false;

export type MembershipProfile = {
  is_membership_active?: boolean;
  subscription_status?: string | null;
} | null | undefined;

/**
 * Single source of truth for Pro status.
 * When OPEN_ACCESS_TEST_MODE is true, always returns true (full app access).
 */
export function isProUser(profile: MembershipProfile): boolean {
  if (OPEN_ACCESS_TEST_MODE) {
    return true; // Full access during testing — no Free-tier locks
  }

  if (!profile) return false;

  if (profile.is_membership_active === true) return true;
  return profile.subscription_status === "pro";
}

/** True while Pro paywalls / upgrade CTAs should stay hidden. */
export function hideProPaywalls(): boolean {
  return OPEN_ACCESS_TEST_MODE;
}
