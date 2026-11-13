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
  /** Kid-friendly cover art matching the game theme. */
  coverSrc: string;
  coverAlt: string;
};

export const KID_GAMES: KidGame[] = [
  {
    id: "picture-puzzle",
    title: "3D Picture Frame Puzzle",
    blurb: "NEW · Real cardboard-style picture puzzles — 4 or 8 pieces from phonics stills!",
    href: "/games/picture-puzzle",
    status: "live",
    artTone: "rose",
    coverSrc: "/games/covers/picture-puzzle.jpg",
    coverAlt: "Colorful picture puzzle pieces in a wooden frame",
  },
  {
    id: "word-search",
    title: "Daily Kids Word Puzzle",
    blurb: "Newspaper word search with crayon highlighter — 4 age levels!",
    href: "/games/word-search",
    status: "live",
    artTone: "sky",
    coverSrc: "/games/covers/word-search.jpg",
    coverAlt: "Newspaper word search with a crayon highlighter",
  },
  {
    id: "early-math-lab",
    title: "Early 3D Math Lab",
    blurb: "Toddler count, Explorer coins, plus Pro times tables for ages 7–8!",
    href: "/games/math",
    status: "live",
    artTone: "amber",
    coverSrc: "/games/covers/math-lab.jpg",
    coverAlt: "Gold coins and fruit for counting math",
  },
  {
    id: "cognitive-logic",
    title: "Logic Puzzles",
    blurb: "Patterns, tangram & odd-one-out — Easy, Advanced, plus Pro for ages 7–8!",
    href: "/games/logic",
    status: "live",
    artTone: "rose",
    coverSrc: "/games/covers/logic.jpg",
    coverAlt: "Tangram shapes and pattern puzzle pieces",
  },
  {
    id: "supermarket-trolley",
    title: "Supermarket Trolley",
    blurb: "Pick your letters, roll the trolley, and buy 5 matching items on every shelf!",
    href: "/games/trolley",
    status: "live",
    artTone: "lime",
    coverSrc: "/games/covers/trolley.jpg",
    coverAlt: "Cute supermarket trolley filled with groceries",
  },
  {
    id: "coin-toy-shop",
    title: "Math & Coin Toy Shop",
    blurb: "Count gold coins into the Saving Bank and bring a toy home. 5 stars equals 2 coins.",
    href: "/games/coin-shop",
    status: "live",
    artTone: "amber",
    coverSrc: "/games/covers/coin-shop.jpg",
    coverAlt: "Gold coins and toys in a coin shop",
  },
  {
    id: "tactile-memory",
    title: "3D Tactile Memory",
    blurb: "Flip frosted glass cards and match phonics friends on cozy boards!",
    href: "/games/memory",
    status: "live",
    artTone: "cyan",
    coverSrc: "/games/covers/memory.jpg",
    coverAlt: "Frosted glass memory cards with animal friends",
  },
];

export const COMING_SOON_PLACEHOLDERS: KidGame[] = [];

export function getGamesForHub(): KidGame[] {
  return KID_GAMES;
}
