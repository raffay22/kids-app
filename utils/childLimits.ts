import type { Profile } from "@/types/database";

/** Free = 1, Pro Pass = 3, Family Pack add-on = 6 total */
export function getChildLimit(profile: Pick<Profile, "subscription_status" | "family_pack">): number {
  if (profile.family_pack) return 6;
  if (profile.subscription_status === "pro") return 3;
  return 1;
}

export function getTierLabel(profile: Pick<Profile, "subscription_status" | "family_pack">): string {
  if (profile.family_pack) return "Family Pack (6 profiles)";
  if (profile.subscription_status === "pro") return "Pro Pass (3 profiles)";
  return "Free (1 profile)";
}
