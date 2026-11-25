/** Bloom Blast — 15 sub-levels across 3 age groups. Only Level 1 is playable in this pass. */

export type BloomAgeGroup = 1 | 2 | 3;

export type BloomShapeKind = "circle" | "square" | "triangle" | "star" | "heart" | "oval" | "diamond";

export type BloomColorName = "red" | "blue" | "yellow" | "green" | "purple" | "orange" | "pink" | "white";

export type BloomSpawnItem = {
  shape: BloomShapeKind;
  color: BloomColorName;
  /** Hex fill for crystal glass body */
  fill: string;
  /** Brighter rim / glow */
  glow: string;
  label: string;
};

export type BloomLevelRule =
  | { type: "any" } // any spawned item counts
  | { type: "color"; color: BloomColorName }
  | { type: "size"; size: "big" | "small" }
  | { type: "shape"; shapes: BloomShapeKind[] };

export type BloomLevelConfig = {
  id: number; // 1–15
  group: BloomAgeGroup;
  groupLabel: string;
  title: string;
  blurb: string;
  targetScore: number;
  maxMisses: number;
  /** Items that can spawn this level */
  spawnPool: BloomSpawnItem[];
  rule: BloomLevelRule;
  /** Ready for play in this build */
  enabled: boolean;
};

export const BLOOM_UNLOCK_KEY = "bloom_blast_unlocked_level";

export const PRIMARY_SHAPES: BloomSpawnItem[] = [
  {
    shape: "circle",
    color: "red",
    fill: "#ef4444",
    glow: "#fca5a5",
    label: "Red Circle",
  },
  {
    shape: "square",
    color: "blue",
    fill: "#3b82f6",
    glow: "#93c5fd",
    label: "Blue Square",
  },
  {
    shape: "triangle",
    color: "yellow",
    fill: "#eab308",
    glow: "#fde047",
    label: "Yellow Triangle",
  },
];

/** Full 15-slot blueprint; only level 1 is enabled for now. */
export const BLOOM_LEVELS: BloomLevelConfig[] = [
  {
    id: 1,
    group: 1,
    groupLabel: "Tiny Explorers (Ages 2–4)",
    title: "Primary Shapes",
    blurb: "Slash Red Circle, Blue Square, and Yellow Triangle!",
    targetScore: 10,
    maxMisses: 3,
    spawnPool: PRIMARY_SHAPES,
    rule: { type: "any" },
    enabled: true,
  },
  {
    id: 2,
    group: 1,
    groupLabel: "Tiny Explorers (Ages 2–4)",
    title: "Extended Shapes",
    blurb: "Star, Heart, Oval, Diamond — coming next!",
    targetScore: 10,
    maxMisses: 3,
    spawnPool: [],
    rule: { type: "any" },
    enabled: false,
  },
  {
    id: 3,
    group: 1,
    groupLabel: "Tiny Explorers (Ages 2–4)",
    title: "Single Color Challenges",
    blurb: "Blast only BLUE!",
    targetScore: 10,
    maxMisses: 3,
    spawnPool: [],
    rule: { type: "color", color: "blue" },
    enabled: false,
  },
  {
    id: 4,
    group: 1,
    groupLabel: "Tiny Explorers (Ages 2–4)",
    title: "Big vs Small",
    blurb: "Blast only BIG shapes!",
    targetScore: 10,
    maxMisses: 3,
    spawnPool: [],
    rule: { type: "size", size: "big" },
    enabled: false,
  },
  {
    id: 5,
    group: 1,
    groupLabel: "Tiny Explorers (Ages 2–4)",
    title: "Fast Shape Rainbow Mix",
    blurb: "Final mastery to unlock Group 2",
    targetScore: 12,
    maxMisses: 3,
    spawnPool: [],
    rule: { type: "any" },
    enabled: false,
  },
  // Group 2 placeholders (6–10)
  ...([6, 7, 8, 9, 10] as const).map((id) => ({
    id,
    group: 2 as const,
    groupLabel: "Little Builders (Ages 4–6)",
    title: `Group 2 · Level ${id}`,
    blurb: "Coming in a later chat",
    targetScore: 12,
    maxMisses: 3,
    spawnPool: [] as BloomSpawnItem[],
    rule: { type: "any" } as BloomLevelRule,
    enabled: false,
  })),
  // Group 3 placeholders (11–15)
  ...([11, 12, 13, 14, 15] as const).map((id) => ({
    id,
    group: 3 as const,
    groupLabel: "Young Masters (Ages 6–9)",
    title: `Group 3 · Level ${id}`,
    blurb: "Coming in a later chat",
    targetScore: 15,
    maxMisses: 3,
    spawnPool: [] as BloomSpawnItem[],
    rule: { type: "any" } as BloomLevelRule,
    enabled: false,
  })),
];

export function getBloomLevel(id: number): BloomLevelConfig | undefined {
  return BLOOM_LEVELS.find((l) => l.id === id);
}

export function readUnlockedLevel(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = window.localStorage.getItem(BLOOM_UNLOCK_KEY);
    const n = Number(raw || "1");
    return Number.isFinite(n) && n >= 1 ? Math.min(15, Math.floor(n)) : 1;
  } catch {
    return 1;
  }
}

export function writeUnlockedLevel(level: number) {
  if (typeof window === "undefined") return;
  try {
    const cur = readUnlockedLevel();
    const next = Math.max(cur, Math.min(15, Math.floor(level)));
    window.localStorage.setItem(BLOOM_UNLOCK_KEY, String(next));
  } catch {
    // ignore
  }
}

export function isCorrectHit(level: BloomLevelConfig, item: BloomSpawnItem, size?: "big" | "small"): boolean {
  const rule = level.rule;
  if (rule.type === "any") return true;
  if (rule.type === "color") return item.color === rule.color;
  if (rule.type === "shape") return rule.shapes.includes(item.shape);
  if (rule.type === "size") return size === rule.size;
  return true;
}
