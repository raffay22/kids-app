/**
 * Centralized tier gating and feature limits.
 * Import helpers from here (or `@/utils/membership` re-exports) for Free / Basic Pro / Full Member rules.
 */

// Production launch mode: Pro gating is active by default.
// Set NEXT_PUBLIC_OPEN_ACCESS_TEST_MODE=true in .env.local only for QA bypass.
export const OPEN_ACCESS_TEST_MODE =
  (process.env.NEXT_PUBLIC_OPEN_ACCESS_TEST_MODE ?? "false").toLowerCase() ===
  "true";

/** @deprecated Use OPEN_ACCESS_TEST_MODE. Kept so older imports keep working. */
export const FORCE_FREE_TEST_MODE = false;

/** App membership tiers from Prompt B. */
export type MembershipTier = "free" | "basic_pro" | "full_member";

/**
 * Profile shape used for gating.
 * Maps existing DB fields: `subscription_status` + `family_pack`
 * and optional future values (`basic_pro` / `full_member`).
 */
export type MembershipProfile = {
  is_pro?: boolean;
  is_membership_active?: boolean;
  subscription_status?: string | null;
  family_pack?: boolean | null;
  /** Optional school partner free Basic Pro grant. */
  school_code?: string | null;
  school_id?: string | null;
} | null | undefined;

/** Pricing labels (PKR / USD) for shop & admin UI. */
export const TIER_PRICING = {
  free: { label: "Free", pkr: 0, usd: 0 },
  basic_pro: { label: "Basic Pro", pkr: 300, usd: 3 },
  full_member: { label: "Full Membership", pkr: 600, usd: 5 },
  worksheet_bundle: { label: "Worksheet Bundle", pkr: 150, usd: 2 },
} as const;

/** Free-tier feature limits (session / month). */
export const FREE_LIMITS = {
  sentencesPerSession: 3,
  bedtimeStoriesPerMonth: 5,
  toddlerStoriesUnlocked: 3,
  miniGameRoundsPerSession: 3,
  monthlyPdfCredits: 0,
  maxChildren: 1,
} as const;

export const BASIC_PRO_LIMITS = {
  sentencesPerSession: Number.POSITIVE_INFINITY,
  bedtimeStoriesPerMonth: Number.POSITIVE_INFINITY,
  toddlerStoriesUnlocked: Number.POSITIVE_INFINITY,
  miniGameRoundsPerSession: Number.POSITIVE_INFINITY,
  monthlyPdfCredits: 1,
  maxChildren: 3,
} as const;

export const FULL_MEMBER_LIMITS = {
  sentencesPerSession: Number.POSITIVE_INFINITY,
  bedtimeStoriesPerMonth: Number.POSITIVE_INFINITY,
  toddlerStoriesUnlocked: Number.POSITIVE_INFINITY,
  miniGameRoundsPerSession: Number.POSITIVE_INFINITY,
  monthlyPdfCredits: 6,
  maxChildren: 6,
} as const;

const SESSION_SENTENCE_KEY = "kids-app-session-sentence-count-v1";
const SESSION_GAME_KEY_PREFIX = "kids-app-session-game-rounds-v1:";

function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Resolve Free / Basic Pro / Full Membership from profile fields.
 * - `family_pack` or status `full_member` → full_member
 * - active pro / `basic_pro` / school partner → basic_pro
 * - else free
 */
export function getMembershipTier(profile: MembershipProfile): MembershipTier {
  if (OPEN_ACCESS_TEST_MODE) return "full_member";
  if (!profile) return "free";

  const status = (profile.subscription_status ?? "free").toLowerCase();
  if (profile.family_pack === true || status === "full_member" || status === "full") {
    return "full_member";
  }

  if (
    profile.is_pro === true ||
    profile.is_membership_active === true ||
    status === "pro" ||
    status === "active" ||
    status === "basic_pro" ||
    status === "basic" ||
    Boolean(profile.school_code) ||
    Boolean(profile.school_id)
  ) {
    return "basic_pro";
  }

  return "free";
}

export function getTierLimits(tier: MembershipTier) {
  if (tier === "full_member") return FULL_MEMBER_LIMITS;
  if (tier === "basic_pro") return BASIC_PRO_LIMITS;
  return FREE_LIMITS;
}

/**
 * True for Basic Pro or Full Membership (ad-free + unlocked core learning).
 * When OPEN_ACCESS_TEST_MODE is true, always returns true.
 */
export function isProUser(profile: MembershipProfile): boolean {
  if (OPEN_ACCESS_TEST_MODE) return true;
  const tier = getMembershipTier(profile);
  return tier === "basic_pro" || tier === "full_member";
}

/** Full Membership Pass (multi-child + 6 PDF credits / month). */
export function isFullMember(profile: MembershipProfile): boolean {
  if (OPEN_ACCESS_TEST_MODE) return true;
  return getMembershipTier(profile) === "full_member";
}

/** Pronouns flashcards: locked on Free; unlocked on Basic Pro / Full. */
export function canAccessPronouns(profile: MembershipProfile): boolean {
  return isProUser(profile);
}

/** Phonics, nouns/verbs, math, trolley, ASD/Emergency PECS — always free. */
export function isAlwaysFreeFeature(
  feature:
    | "phonics"
    | "nouns_verbs"
    | "math"
    | "trolley"
    | "asd_pecs"
    | "emergency_pecs",
): boolean {
  void feature;
  return true;
}

/**
 * Max sentences allowed in the current browser session.
 * Free = 3; Pro / Full = unlimited.
 * (Named per Prompt B; returns the allowed count / limit.)
 */
export function getDailySentenceCount(profile: MembershipProfile): number {
  return getTierLimits(getMembershipTier(profile)).sentencesPerSession;
}

/** Alias with clearer name for UI code. */
export function getSessionSentenceLimit(profile: MembershipProfile): number {
  return getDailySentenceCount(profile);
}

/** Monthly worksheet PDF credits: Free 0, Basic Pro 1, Full 6. */
export function getMonthlyPdfCredits(profile: MembershipProfile): number {
  return getTierLimits(getMembershipTier(profile)).monthlyPdfCredits;
}

export function getBedtimeStoriesMonthlyLimit(profile: MembershipProfile): number {
  return getTierLimits(getMembershipTier(profile)).bedtimeStoriesPerMonth;
}

export function getToddlerStoriesUnlockLimit(profile: MembershipProfile): number {
  return getTierLimits(getMembershipTier(profile)).toddlerStoriesUnlocked;
}

export function getMiniGameRoundsLimit(profile: MembershipProfile): number {
  return getTierLimits(getMembershipTier(profile)).miniGameRoundsPerSession;
}

export function getMaxChildrenForTier(profile: MembershipProfile): number {
  return getTierLimits(getMembershipTier(profile)).maxChildren;
}

/** True while Pro paywalls / upgrade CTAs should stay hidden. */
export function hideProPaywalls(): boolean {
  return OPEN_ACCESS_TEST_MODE;
}

/** Ads only for Free tier (hidden in test mode). */
export function shouldShowAds(profile: MembershipProfile): boolean {
  if (OPEN_ACCESS_TEST_MODE) return false;
  return getMembershipTier(profile) === "free";
}

/* ——— Session counters (client) ——— */

function readInt(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(key);
    const n = raw == null ? 0 : Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function writeInt(key: string, n: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, String(Math.max(0, Math.floor(n))));
  } catch {
    // ignore
  }
}

/** Sentences completed in this tab session. */
export function getSessionSentenceUsed(): number {
  return readInt(SESSION_SENTENCE_KEY);
}

export function incrementSessionSentenceUsed(): number {
  const next = getSessionSentenceUsed() + 1;
  writeInt(SESSION_SENTENCE_KEY, next);
  return next;
}

export function canStartAnotherSentence(profile: MembershipProfile): boolean {
  const limit = getSessionSentenceLimit(profile);
  if (!Number.isFinite(limit)) return true;
  return getSessionSentenceUsed() < limit;
}

export function getSessionGameRoundsUsed(gameId: string): number {
  return readInt(`${SESSION_GAME_KEY_PREFIX}${gameId}`);
}

export function incrementSessionGameRounds(gameId: string): number {
  const next = getSessionGameRoundsUsed(gameId) + 1;
  writeInt(`${SESSION_GAME_KEY_PREFIX}${gameId}`, next);
  return next;
}

export function canStartAnotherGameRound(
  profile: MembershipProfile,
  gameId: string,
): boolean {
  const limit = getMiniGameRoundsLimit(profile);
  if (!Number.isFinite(limit)) return true;
  return getSessionGameRoundsUsed(gameId) < limit;
}

/** Month key used when wiring bedtime free-story rotation to DB. */
export function getMembershipMonthKey(): string {
  return monthKey();
}
