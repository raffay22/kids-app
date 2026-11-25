/** Placement keys for multi-slot brand banners (admin-managed, not AdSense). */

export const BRAND_AD_PLACEMENTS = [
  { id: "HOME_TOP", label: "Home — Top", route: "/", position: "TOP_HEADER" },
  { id: "HOME_BOTTOM", label: "Home — Bottom", route: "/", position: "FOOTER_INLINE" },
  { id: "GAMES_HUB", label: "Games Hub", route: "/games", position: "INLINE" },
  { id: "STORIES_HUB", label: "Stories Hub", route: "/games/stories", position: "INLINE" },
  { id: "STORIES_BEDTIME", label: "Bedtime Stories", route: "/games/stories/bedtime", position: "INLINE" },
  { id: "STORIES_TODDLERS", label: "Toddler Stories", route: "/games/stories/toddlers", position: "INLINE" },
  { id: "ANALYTICS_PAGE", label: "Progress Analytics", route: "/analytics", position: "INLINE" },
  { id: "SHOP_PAGE", label: "Parent Shop", route: "/shop", position: "INLINE" },
  { id: "GAME_PICTURE_PUZZLE", label: "Picture Puzzle Game", route: "/games/picture-puzzle", position: "INLINE" },
  { id: "GAME_MATH", label: "Coin Math Game", route: "/games/math", position: "INLINE" },
  { id: "GAME_WORD_SEARCH", label: "Word Search Game", route: "/games/word-search", position: "INLINE" },
  { id: "GAME_LOGIC", label: "Logic & Tangram Game", route: "/games/logic", position: "INLINE" },
  { id: "FOOTER_INLINE", label: "Allowed Routes Footer Strip", route: "*", position: "FOOTER_INLINE" },
] as const;

export type BrandAdPlacementId = (typeof BRAND_AD_PLACEMENTS)[number]["id"];

export type BrandAdMediaType = "image" | "video";

export type BrandAd = {
  id: string;
  brand_name: string;
  headline: string | null;
  media_type: BrandAdMediaType;
  media_url: string;
  media_path: string | null;
  click_url: string | null;
  whatsapp_phone: string | null;
  whatsapp_message: string | null;
  placement: string;
  target_page_route: string | null;
  banner_position: "TOP_HEADER" | "INLINE" | "FOOTER_INLINE";
  monthly_rent_pkr: number | null;
  brand_contact_email: string | null;
  is_active: boolean;
  sort_order: number;
  total_impressions: number;
  total_clicks: number;
  proof_token: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Allowed banner ad routes with exact placement keys. */
export function placementForPath(
  pathname: string,
): BrandAdPlacementId | null {
  if (pathname === "/") return "HOME_TOP";
  if (pathname === "/games") return "GAMES_HUB";
  if (
    pathname === "/games/stories/bedtime" ||
    pathname.startsWith("/games/stories/bedtime/")
  ) {
    return "STORIES_BEDTIME";
  }
  if (
    pathname === "/games/stories/toddlers" ||
    pathname.startsWith("/games/stories/toddlers/")
  ) {
    return "STORIES_TODDLERS";
  }
  if (
    pathname === "/games/stories" ||
    pathname.startsWith("/games/stories/")
  ) {
    return "STORIES_HUB";
  }
  if (pathname === "/analytics" || pathname.startsWith("/analytics/")) {
    return "ANALYTICS_PAGE";
  }
  if (pathname === "/shop" || pathname.startsWith("/shop/")) {
    return "SHOP_PAGE";
  }
  if (
    pathname === "/games/picture-puzzle" ||
    pathname.startsWith("/games/picture-puzzle/")
  ) {
    return "GAME_PICTURE_PUZZLE";
  }
  if (pathname === "/games/math" || pathname.startsWith("/games/math/")) {
    return "GAME_MATH";
  }
  if (
    pathname === "/games/word-search" ||
    pathname.startsWith("/games/word-search/")
  ) {
    return "GAME_WORD_SEARCH";
  }
  if (pathname === "/games/logic" || pathname.startsWith("/games/logic/")) {
    return "GAME_LOGIC";
  }
  return null;
}

/** Extra bottom placement for home dashboard. */
export function bottomPlacementForPath(pathname: string): BrandAdPlacementId | null {
  if (pathname === "/") return "HOME_BOTTOM";
  return null;
}

/** Routes that get the global footer brand strip. */
export function showFooterBrandStrip(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/games") return true;
  if (pathname === "/games/stories" || pathname.startsWith("/games/stories/")) {
    return true;
  }
  if (pathname === "/analytics" || pathname.startsWith("/analytics/")) {
    return true;
  }
  if (pathname === "/shop" || pathname.startsWith("/shop/")) {
    return true;
  }
  if (
    pathname === "/games/picture-puzzle" ||
    pathname.startsWith("/games/picture-puzzle/")
  ) {
    return true;
  }
  if (pathname === "/games/math" || pathname.startsWith("/games/math/")) {
    return true;
  }
  if (
    pathname === "/games/word-search" ||
    pathname.startsWith("/games/word-search/")
  ) {
    return true;
  }
  if (pathname === "/games/logic" || pathname.startsWith("/games/logic/")) {
    return true;
  }
  return false;
}

export function placementLabel(id: string): string {
  return BRAND_AD_PLACEMENTS.find((p) => p.id === id)?.label ?? id;
}

export function buildBrandClickUrl(ad: Pick<BrandAd, "click_url" | "whatsapp_phone" | "whatsapp_message">): string | null {
  const phone = (ad.whatsapp_phone ?? "").replace(/\D/g, "");
  if (phone) {
    const text = encodeURIComponent(ad.whatsapp_message ?? "Hi! I saw your ad on Kids Learning App.");
    return `https://wa.me/${phone}?text=${text}`;
  }
  const url = (ad.click_url ?? "").trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function ctrPercent(impressions: number, clicks: number): string {
  if (!impressions) return "0.00";
  return ((clicks / impressions) * 100).toFixed(2);
}

export function brandProofUrl(token: string, appUrl?: string): string {
  const base = (appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "") || "";
  return `${base}/brand-stats/${token}`;
}
