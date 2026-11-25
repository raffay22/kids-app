import { TIER_PRICING } from "@/lib/membership";

export type SchoolDiscountType = "FREE_100" | "PERCENTAGE" | "CUSTOM_PRICE";

export type PartnerSchool = {
  id: string;
  school_name: string;
  city: string | null;
  school_code: string | null;
  school_token: string;
  discount_type: SchoolDiscountType;
  discount_percentage: number;
  custom_price_pkr: number;
  is_active: boolean;
  joined_students_count: number;
  created_at?: string;
  updated_at?: string;
};

export type SchoolDiscountPreset =
  | "free_100"
  | "off_50"
  | "off_70"
  | "custom";

export const SCHOOL_DISCOUNT_PRESETS: {
  id: SchoolDiscountPreset;
  label: string;
  discount_type: SchoolDiscountType;
  discount_percentage: number;
  custom_price_pkr: number;
  blurb: string;
}[] = [
  {
    id: "free_100",
    label: "100% Free",
    discount_type: "FREE_100",
    discount_percentage: 100,
    custom_price_pkr: 0,
    blurb: "Basic Pro at Rs. 0",
  },
  {
    id: "off_50",
    label: "50% Off",
    discount_type: "PERCENTAGE",
    discount_percentage: 50,
    custom_price_pkr: 150,
    blurb: "Rs. 150 / month",
  },
  {
    id: "off_70",
    label: "70% Off",
    discount_type: "PERCENTAGE",
    discount_percentage: 70,
    custom_price_pkr: 90,
    blurb: "Rs. 90 / month",
  },
  {
    id: "custom",
    label: "Custom PKR",
    discount_type: "CUSTOM_PRICE",
    discount_percentage: 0,
    custom_price_pkr: 0,
    blurb: "Set an explicit monthly price",
  },
];

const BASIC_PRO_PKR = TIER_PRICING.basic_pro.pkr;

/** Resolved monthly PKR after school discount. */
export function resolveSchoolMonthlyPrice(school: {
  discount_type: SchoolDiscountType;
  discount_percentage: number;
  custom_price_pkr: number;
}): number {
  if (school.discount_type === "FREE_100" || school.discount_percentage >= 100) {
    return 0;
  }
  if (school.discount_type === "CUSTOM_PRICE") {
    return Math.max(0, Number(school.custom_price_pkr) || 0);
  }
  // PERCENTAGE — prefer explicit custom_price_pkr when set (preset packs)
  if (Number(school.custom_price_pkr) > 0) {
    return Number(school.custom_price_pkr);
  }
  const pct = Math.min(100, Math.max(0, Number(school.discount_percentage) || 0));
  return Math.round(BASIC_PRO_PKR * (100 - pct) / 100);
}

export function schoolInvitePath(token: string): string {
  return `/signup?school_token=${encodeURIComponent(token)}`;
}

export function schoolInviteUrl(token: string, origin?: string): string {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://kids.growvabusiness.com";
  return `${base.replace(/\/$/, "")}${schoolInvitePath(token)}`;
}

export function whatsappSchoolInviteText(schoolName: string, inviteUrl: string): string {
  return [
    `Hello parents of ${schoolName}!`,
    "",
    "Your school partnered with Kids Learning App for soft speech & calm play.",
    "Tap this secure invite link to join with your school discount:",
    inviteUrl,
    "",
    "(Do not share a manual promo code — only this link activates school pricing.)",
  ].join("\n");
}

export function whatsappSchoolInviteUrl(schoolName: string, inviteUrl: string): string {
  return `https://wa.me/?text=${encodeURIComponent(
    whatsappSchoolInviteText(schoolName, inviteUrl),
  )}`;
}

export function makeSchoolCode(schoolName: string, city?: string | null): string {
  const base = `${schoolName}-${city || ""}`
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 18);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SCH-${base || "PARTNER"}-${suffix}`;
}

export function randomSchoolToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return Array.from({ length: 48 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}
