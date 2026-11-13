import {
  getLetterPhonics,
  getVariation,
  type PhonicsCardMedia,
} from "@/utils/phonicsCatalog";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Built here (not imported) so Turbopack never hits a stale catalog binding. */
function listProducedPhonicsCards(): PhonicsCardMedia[] {
  const out: PhonicsCardMedia[] = [];
  for (const letter of LETTERS) {
    const data = getLetterPhonics(letter);
    if (!data?.variations?.length) continue;
    data.variations.forEach((_, index) => {
      const media = getVariation(letter, index);
      if (media?.localVideoSrc) out.push(media);
    });
  }
  return out;
}

export const STARS_PER_MEMORY_MATCH = 5;
export const MEMORY_MISMATCH_FLIP_MS = 800;

export type MemoryGridSize = "2x2" | "2x3" | "2x4" | "3x4";
export type MemoryDifficulty = "easy" | "medium" | "hard";

export type MemoryPair = {
  matchKey: string;
  letter: string;
  word: string;
  videoSrc: string;
  audioSrc: string | null;
  praiseLine: string;
};

export type MemoryCardData = {
  uid: string;
  matchKey: string;
  letter: string;
  word: string;
  videoSrc: string;
  audioSrc: string | null;
  praiseLine: string;
};

export type MemoryLayout = {
  id: MemoryGridSize;
  label: string;
  rows: number;
  cols: number;
  pairs: number;
  freeAllowed: boolean;
  difficulty?: MemoryDifficulty;
};

export const MEMORY_LAYOUTS: MemoryLayout[] = [
  {
    id: "2x2",
    label: "2 × 2 · 2 pairs",
    rows: 2,
    cols: 2,
    pairs: 2,
    freeAllowed: true,
    difficulty: "easy",
  },
  {
    id: "2x3",
    label: "2 × 3 · 3 pairs",
    rows: 2,
    cols: 3,
    pairs: 3,
    freeAllowed: true,
    difficulty: "easy",
  },
  {
    id: "2x4",
    label: "2 × 4 · 4 pairs",
    rows: 2,
    cols: 4,
    pairs: 4,
    freeAllowed: false,
    difficulty: "medium",
  },
  {
    id: "3x4",
    label: "3 × 4 · 6 pairs",
    rows: 3,
    cols: 4,
    pairs: 6,
    freeAllowed: false,
    difficulty: "hard",
  },
];

export function layoutForDifficulty(difficulty: MemoryDifficulty): MemoryLayout {
  if (difficulty === "hard") return MEMORY_LAYOUTS.find((l) => l.id === "3x4")!;
  if (difficulty === "medium") return MEMORY_LAYOUTS.find((l) => l.id === "2x4")!;
  return MEMORY_LAYOUTS.find((l) => l.id === "2x3")!;
}

export function getLayout(id: MemoryGridSize): MemoryLayout {
  return MEMORY_LAYOUTS.find((l) => l.id === id) ?? MEMORY_LAYOUTS[0];
}

function secureRandom(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  }
  return Math.random();
}

/** Multi-pass Fisher–Yates so small decks (2×2) are not left in twin/cross order. */
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let pass = 0; pass < 4; pass += 1) {
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(secureRandom() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
  }
  return next;
}

function toPair(media: PhonicsCardMedia): MemoryPair {
  const letter = media.letter.toUpperCase();
  const word = media.variation.word;
  return {
    matchKey: media.variation.id,
    letter,
    word,
    videoSrc: media.localVideoSrc!,
    audioSrc: media.localAudioSrc,
    praiseLine: `Awesome! ${letter} is for ${word}!`,
  };
}

/** True when every match is still sitting as AA BB CC… (shuffle failed / too ordered). */
function isTwinPacked(cards: MemoryCardData[]): boolean {
  if (cards.length < 4) return false;
  for (let i = 0; i < cards.length; i += 2) {
    if (!cards[i + 1] || cards[i].matchKey !== cards[i + 1].matchKey) return false;
  }
  return true;
}

/**
 * True for the common 2×2 “cross” layouts kids can memorize:
 * A B / B A  or  B A / A B
 */
function isCrossPattern(cards: MemoryCardData[], cols: number): boolean {
  if (cards.length !== 4 || cols !== 2) return false;
  const [a, b, c, d] = cards;
  const diag1 = a.matchKey === d.matchKey && b.matchKey === c.matchKey && a.matchKey !== b.matchKey;
  return diag1;
}

function layoutSignature(cards: MemoryCardData[]): string {
  return cards.map((c) => c.matchKey).join("|");
}

let lastDeckSignature = "";

/** Pick N unique produced phonics cards and place each pair into random grid slots. */
export function buildMemoryDeck(pairCount: number, cols = 2): MemoryCardData[] {
  const pool = listProducedPhonicsCards().filter((card) => Boolean(card.localVideoSrc));
  const picked = shuffle(pool).slice(0, Math.max(1, Math.min(pairCount, pool.length)));
  const pairs = picked.map(toPair);
  const total = pairs.length * 2;
  const roundId = Math.floor(secureRandom() * 1e9).toString(36);

  const makeCard = (pair: MemoryPair, index: number, copy: "a" | "b"): MemoryCardData => ({
    uid: `${pair.matchKey}-${copy}-${index}-${roundId}`,
    matchKey: pair.matchKey,
    letter: pair.letter,
    word: pair.word,
    videoSrc: pair.videoSrc,
    audioSrc: pair.audioSrc,
    praiseLine: pair.praiseLine,
  });

  let cards: MemoryCardData[] = [];
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const slots: Array<MemoryCardData | null> = Array.from({ length: total }, () => null);
    const freeIndexes = shuffle(Array.from({ length: total }, (_, i) => i));

    pairs.forEach((pair, index) => {
      const slotA = freeIndexes[index * 2];
      const slotB = freeIndexes[index * 2 + 1];
      slots[slotA] = makeCard(pair, index, "a");
      slots[slotB] = makeCard(pair, index, "b");
    });

    cards = shuffle(slots.filter((c): c is MemoryCardData => Boolean(c)));
    const signature = layoutSignature(cards);

    if (isTwinPacked(cards)) continue;
    if (isCrossPattern(cards, cols)) continue;
    if (signature === lastDeckSignature) continue;

    lastDeckSignature = signature;
    return cards;
  }

  lastDeckSignature = layoutSignature(cards);
  return cards;
}

export function gridClassForLayout(layout: MemoryLayout): string {
  if (layout.cols === 2) return "grid-cols-2";
  if (layout.cols === 3) return "grid-cols-3";
  return "grid-cols-3 sm:grid-cols-4";
}
