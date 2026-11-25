import type { SupabaseClient } from "@supabase/supabase-js";

export const COUNTRY_COOKIE = "kids_detected_country";
export const COUNTRY_STORAGE_KEY = "kids_country_override";

export type CountryOption = {
  code: string;
  name: string;
  flag: string;
};

/**
 * World country list with Pakistan pinned at the top for UpgradeCheckout.
 */
export const COUNTRIES: CountryOption[] = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "BN", name: "Brunei", flag: "🇧🇳" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "GE", name: "Georgia", flag: "🇬🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "LY", name: "Libya", flag: "🇱🇾" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MV", name: "Maldives", flag: "🇲🇻" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "PS", name: "Palestine", flag: "🇵🇸" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "SD", name: "Sudan", flag: "🇸🇩" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "SY", name: "Syria", flag: "🇸🇾" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "YE", name: "Yemen", flag: "🇾🇪" },
  { code: "OTHER", name: "Other Country", flag: "🌍" },
];

export function isPakistanCountry(code: string | null | undefined): boolean {
  return (code ?? "").trim().toUpperCase() === "PK";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  const val = decodeURIComponent(match.split("=").slice(1).join("=")).trim();
  return val || null;
}

function normalizeCode(raw: string | null | undefined): string | null {
  const clean = (raw ?? "").trim().toUpperCase();
  if (!clean) return null;
  if (clean === "OTHER") return "OTHER";
  if (/^[A-Z]{2}$/.test(clean)) return clean;
  return null;
}

/**
 * Silently detect country code:
 * 1. Explicit manual override in localStorage
 * 2. Saved profile.country (or auth user_metadata.country)
 * 3. Geo cookie set by middleware from request headers
 * 4. Browser timezone (Asia/Karachi -> PK, otherwise US)
 */
export function detectCountrySilently(
  profileCountry?: string | null,
  metadataCountry?: string | null,
): string {
  if (typeof window !== "undefined") {
    try {
      const stored = normalizeCode(window.localStorage.getItem(COUNTRY_STORAGE_KEY));
      if (stored) return stored;
    } catch {
      /* ignore */
    }
  }

  const fromProfile = normalizeCode(profileCountry);
  if (fromProfile) return fromProfile;

  const fromMeta = normalizeCode(metadataCountry);
  if (fromMeta) return fromMeta;

  const fromCookie = normalizeCode(readCookie(COUNTRY_COOKIE));
  if (fromCookie) return fromCookie;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Karachi") return "PK";
  } catch {
    /* ignore */
  }

  return "US";
}

export function saveCountryOverride(code: string): void {
  const normalized = normalizeCode(code) ?? "US";
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COUNTRY_STORAGE_KEY, normalized);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Safely persist country to `profiles.country`.
 * If migration `022_profile_country.sql` hasn't been applied yet, falls back to
 * Supabase Auth `user_metadata.country` + `localStorage` without throwing.
 */
export async function saveProfileCountrySafe(
  supabase: SupabaseClient,
  userId: string,
  countryCode: string,
): Promise<void> {
  const normalized = normalizeCode(countryCode) ?? "US";
  saveCountryOverride(normalized);

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ country: normalized })
      .eq("id", userId);

    if (error) {
      // Fallback if `profiles.country` column isn't migrated yet
      await supabase.auth.updateUser({ data: { country: normalized } });
    }
  } catch {
    try {
      await supabase.auth.updateUser({ data: { country: normalized } });
    } catch {
      /* ignore */
    }
  }
}
