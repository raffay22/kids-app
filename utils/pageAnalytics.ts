/** Canonical routes shown in admin page-traffic table. */

export const TRACKED_PAGES: { route: string; title: string }[] = [
  { route: "/", title: "Home Dashboard" },
  { route: "/games", title: "Games Hub" },
  { route: "/coloring", title: "Colouring Board" },
  { route: "/games/stories", title: "Stories Hub" },
  { route: "/worksheets", title: "Worksheets Hub" },

  { route: "/shop", title: "Parent Shop" },
  { route: "/flashcards", title: "Flashcards" },
  { route: "/sentences", title: "Sentences" },
  { route: "/analytics", title: "Progress Tracking" },
  { route: "/asd", title: "ASD Sensory Hub" },
  { route: "/upgrade", title: "Upgrade" },
  { route: "/pecs", title: "PECS" },
];

export type PageAnalyticsRow = {
  id?: string;
  page_route: string;
  page_title: string;
  total_views: number;
  active_users_now: number;
  updated_at?: string;
};

/** Normalize deep links to a hub route for analytics buckets. */
export function normalizePageRoute(pathname: string): string | null {
  if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/brand-stats")) {
    return null;
  }
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return null;
  if (pathname.startsWith("/games/stories")) return "/games/stories";
  if (pathname.startsWith("/asd/")) return "/asd";
  if (pathname.startsWith("/games/") && pathname !== "/games") {
    // Individual games still count under games hub traffic
    return "/games";
  }
  const known = TRACKED_PAGES.find((p) => p.route === pathname);
  if (known) return known.route;
  return pathname.length > 1 ? pathname : "/";
}

export function titleForRoute(route: string): string {
  return TRACKED_PAGES.find((p) => p.route === route)?.title ?? route;
}
