/**
 * Kid games registry for /games hub.
 * Game 1 (Supermarket Trolley) is live; additional games are added only after approval.
 */
export type KidGameStatus = "live" | "coming_soon";

export type KidGameArtTone = "lime" | "amber" | "cyan" | "rose" | "sky";

export type KidGame = {
  id: string;
  title: string;
  blurb: string;
  href?: string;
  status: KidGameStatus;
  artTone: KidGameArtTone;
};

export const KID_GAMES: KidGame[] = [
  {
    id: "supermarket-trolley",
    title: "Supermarket Trolley",
    blurb: "Pick your letters, roll the trolley, and buy 5 matching items on every shelf!",
    href: "/games/trolley",
    status: "live",
    artTone: "lime",
  },
];

export const COMING_SOON_PLACEHOLDERS: KidGame[] = [];

export function getGamesForHub(): KidGame[] {
  return KID_GAMES;
}
