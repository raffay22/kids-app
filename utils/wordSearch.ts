/** Newspaper Kids Word Search — banks, grid placement, path helpers. */

export const FREE_WORD_SEARCH_ROUNDS = 3;
export const STARS_PER_WORD_SEARCH_PUZZLE = 5;
export const WORDS_PER_PUZZLE = 10;

export type WordSearchLevelId = 1 | 2 | 3 | 4;

export type WordSearchLevel = {
  id: WordSearchLevelId;
  title: string;
  ageLabel: string;
  letterCount: number;
  freeAllowed: boolean;
  gridSize: number;
  /** Levels 1–2: H+V only. Levels 3–4: also diagonal down-right. */
  allowDiagonal: boolean;
  words: string[];
  emoji: string;
};

export type GridCell = {
  row: number;
  col: number;
  letter: string;
};

export type WordPath = {
  word: string;
  cells: Array<{ row: number; col: number }>;
};

export type WordSearchPuzzle = {
  levelId: WordSearchLevelId;
  grid: string[][];
  words: string[];
  placements: WordPath[];
  size: number;
};

export const WORD_SEARCH_LEVELS: WordSearchLevel[] = [
  {
    id: 1,
    title: "Little Letters",
    ageLabel: "Ages 2–3 · 3 letters",
    letterCount: 3,
    freeAllowed: true,
    gridSize: 8,
    allowDiagonal: false,
    emoji: "🐣",
    words: [
      "CAT",
      "DOG",
      "SUN",
      "BUS",
      "CUP",
      "HAT",
      "BAT",
      "CAR",
      "BED",
      "BEE",
      "COW",
      "FOX",
      "HEN",
      "ANT",
      "OWL",
      "MAP",
    ],
  },
  {
    id: 2,
    title: "Word Sprouts",
    ageLabel: "Ages 3–4 · 4 letters",
    letterCount: 4,
    freeAllowed: true,
    gridSize: 9,
    allowDiagonal: false,
    emoji: "🌱",
    words: [
      "FISH",
      "DUCK",
      "FROG",
      "STAR",
      "BEAR",
      "BIRD",
      "CAKE",
      "TREE",
      "MOON",
      "BALL",
      "BOOK",
      "LION",
      "FORK",
      "MILK",
      "SHIP",
      "KITE",
    ],
  },
  {
    id: 3,
    title: "Puzzle Pros",
    ageLabel: "Ages 4–5 · 5 letters",
    letterCount: 5,
    freeAllowed: false,
    gridSize: 10,
    allowDiagonal: true,
    emoji: "🦊",
    words: [
      "APPLE",
      "PANDA",
      "ROBOT",
      "CLOUD",
      "TIGER",
      "HORSE",
      "HOUSE",
      "TRAIN",
      "GRAPE",
      "BREAD",
      "PLANT",
      "SMILE",
      "WATER",
      "CHAIR",
      "MOUSE",
      "HAPPY",
    ],
  },
  {
    id: 4,
    title: "Word Masters",
    ageLabel: "Ages 5–6 · 6 letters",
    letterCount: 6,
    freeAllowed: false,
    gridSize: 11,
    allowDiagonal: true,
    emoji: "🌟",
    words: [
      "MONKEY",
      "TURTLE",
      "RABBIT",
      "PENCIL",
      "BANANA",
      "ORANGE",
      "FLOWER",
      "PURPLE",
      "YELLOW",
      "CASTLE",
      "ROCKET",
      "BUTTON",
      "KITTEN",
      "PUPPET",
      "PLANET",
      "GARDEN",
    ],
  },
];

/** Simple emoji fallbacks when Illustration has no match. */
export const WORD_EMOJI: Record<string, string> = {
  CAT: "🐱",
  DOG: "🐶",
  SUN: "☀️",
  BUS: "🚌",
  CUP: "🥤",
  HAT: "🎩",
  BAT: "🦇",
  CAR: "🚗",
  BED: "🛏️",
  BEE: "🐝",
  COW: "🐮",
  FOX: "🦊",
  HEN: "🐔",
  ANT: "🐜",
  OWL: "🦉",
  MAP: "🗺️",
  FISH: "🐟",
  DUCK: "🦆",
  FROG: "🐸",
  STAR: "⭐",
  BEAR: "🐻",
  BIRD: "🐦",
  CAKE: "🎂",
  TREE: "🌳",
  MOON: "🌙",
  BALL: "⚽",
  BOOK: "📚",
  LION: "🦁",
  FORK: "🍴",
  MILK: "🥛",
  SHIP: "🚢",
  KITE: "🪁",
  APPLE: "🍎",
  PANDA: "🐼",
  ROBOT: "🤖",
  CLOUD: "☁️",
  TIGER: "🐯",
  HORSE: "🐴",
  HOUSE: "🏠",
  TRAIN: "🚂",
  GRAPE: "🍇",
  BREAD: "🍞",
  PLANT: "🌱",
  SMILE: "😊",
  WATER: "💧",
  CHAIR: "🪑",
  MOUSE: "🐭",
  HAPPY: "😄",
  MONKEY: "🐵",
  TURTLE: "🐢",
  RABBIT: "🐰",
  PENCIL: "✏️",
  BANANA: "🍌",
  ORANGE: "🍊",
  FLOWER: "🌸",
  PURPLE: "💜",
  YELLOW: "💛",
  CASTLE: "🏰",
  ROCKET: "🚀",
  BUTTON: "🔘",
  KITTEN: "😺",
  PUPPET: "🎭",
  PLANET: "🪐",
  GARDEN: "🌷",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function getWordSearchLevel(id: WordSearchLevelId): WordSearchLevel {
  return WORD_SEARCH_LEVELS.find((l) => l.id === id) ?? WORD_SEARCH_LEVELS[0];
}

type Dir = { dr: number; dc: number };

function dirsForLevel(allowDiagonal: boolean): Dir[] {
  const base: Dir[] = [
    { dr: 0, dc: 1 }, // right
    { dr: 1, dc: 0 }, // down
  ];
  if (allowDiagonal) base.push({ dr: 1, dc: 1 }); // down-right
  return base;
}

function canPlace(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dir: Dir,
): boolean {
  const size = grid.length;
  for (let i = 0; i < word.length; i += 1) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    if (r < 0 || c < 0 || r >= size || c >= size) return false;
    const existing = grid[r][c];
    if (existing && existing !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  allowDiagonal: boolean,
): WordPath | null {
  const size = grid.length;
  const dirs = shuffle(dirsForLevel(allowDiagonal));
  const starts = shuffle(
    Array.from({ length: size * size }, (_, i) => ({
      row: Math.floor(i / size),
      col: i % size,
    })),
  );

  for (const start of starts) {
    for (const dir of dirs) {
      if (!canPlace(grid, word, start.row, start.col, dir)) continue;
      const cells: Array<{ row: number; col: number }> = [];
      for (let i = 0; i < word.length; i += 1) {
        const r = start.row + dir.dr * i;
        const c = start.col + dir.dc * i;
        grid[r][c] = word[i];
        cells.push({ row: r, col: c });
      }
      return { word, cells };
    }
  }
  return null;
}

export function buildWordSearchPuzzle(levelId: WordSearchLevelId): WordSearchPuzzle {
  const level = getWordSearchLevel(levelId);
  const size = level.gridSize;
  const picked = shuffle(level.words).slice(0, WORDS_PER_PUZZLE);

  const working: (string | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
  const placements: WordPath[] = [];
  const placedWords: string[] = [];

  for (const word of picked) {
    const path = placeWord(working, word, level.allowDiagonal);
    if (path) {
      placements.push(path);
      placedWords.push(word);
    }
  }

  // If placement failed for some, try remaining bank words as fillers
  if (placedWords.length < WORDS_PER_PUZZLE) {
    for (const word of shuffle(level.words)) {
      if (placedWords.includes(word)) continue;
      const path = placeWord(working, word, level.allowDiagonal);
      if (path) {
        placements.push(path);
        placedWords.push(word);
      }
      if (placedWords.length >= WORDS_PER_PUZZLE) break;
    }
  }

  const grid: string[][] = working.map((row) =>
    row.map((cell) => cell ?? LETTERS[Math.floor(Math.random() * LETTERS.length)]),
  );

  return {
    levelId,
    grid,
    words: placedWords,
    placements,
    size,
  };
}

/** Normalize a selection path into a straight line of cells (or empty if invalid). */
export function normalizeSelectionPath(
  cells: Array<{ row: number; col: number }>,
): Array<{ row: number; col: number }> {
  if (cells.length === 0) return [];
  if (cells.length === 1) return cells;

  const first = cells[0];
  const last = cells[cells.length - 1];
  const dr = Math.sign(last.row - first.row);
  const dc = Math.sign(last.col - first.col);

  // Must be axis-aligned or 45° diagonal
  const rowSpan = Math.abs(last.row - first.row);
  const colSpan = Math.abs(last.col - first.col);
  if (rowSpan !== 0 && colSpan !== 0 && rowSpan !== colSpan) return [];

  const steps = Math.max(rowSpan, colSpan);
  if (steps === 0) return [first];

  const path: Array<{ row: number; col: number }> = [];
  for (let i = 0; i <= steps; i += 1) {
    path.push({ row: first.row + dr * i, col: first.col + dc * i });
  }
  return path;
}

export function wordFromPath(
  grid: string[][],
  path: Array<{ row: number; col: number }>,
): string {
  return path.map(({ row, col }) => grid[row]?.[col] ?? "").join("");
}

export function matchTargetWord(
  selected: string,
  targets: string[],
  found: string[],
): string | null {
  const upper = selected.toUpperCase();
  const reverse = upper.split("").reverse().join("");
  for (const word of targets) {
    if (found.includes(word)) continue;
    if (word === upper || word === reverse) return word;
  }
  return null;
}

export function pathKey(cells: Array<{ row: number; col: number }>): string {
  return cells.map((c) => `${c.row},${c.col}`).join("|");
}
