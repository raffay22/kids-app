import type { Profile } from "@/types/database";
import {
  getMaxChildrenForTier,
  getMembershipTier,
} from "@/lib/membership";

/** Free = 1, Basic Pro = 3, Full Membership / Family Pack = 6 */
export function getChildLimit(
  profile: Pick<Profile, "subscription_status" | "family_pack">,
): number {
  return getMaxChildrenForTier(profile);
}

export function getTierLabel(
  profile: Pick<Profile, "subscription_status" | "family_pack">,
): string {
  const tier = getMembershipTier(profile);
  if (tier === "full_member") return "Full Membership (6 profiles)";
  if (tier === "basic_pro") return "Basic Pro (3 profiles)";
  return "Free (1 profile)";
}
