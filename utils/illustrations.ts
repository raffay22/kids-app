/**
 * Illustration registry — word-accurate matching only.
 * Letters resolve to phonics example words (A → Apple).
 * Abstract sentence vocabulary resolves through explicit aliases.
 * Lottie is used ONLY for verified /public/lottie/*.json files.
 */
import type { KidPose } from "@/components/scenes/KidCharacter";
import type { BadgeTheme } from "@/components/scenes/BadgeScenes";
import { getPhonicSound } from "@/utils/phonicsSounds";

export type CoreSceneKey =
  | "sun"
  | "apple"
  | "dog"
  | "cat"
  | "milk"
  | "water"
  | "chair"
  | "book"
  | "rabbit"
  | "cloud"
  | "moon"
  | "ball"
  | "tree"
  | "fish"
  | "lion"
  | "pizza"
  | "elephant";

export type SceneResolution =
  | { kind: "kid"; pose: KidPose }
  | { kind: "core"; key: CoreSceneKey }
  | { kind: "badge"; theme: BadgeTheme };

export type IllustrationEntry = {
  scene: SceneResolution;
  lottieSrc?: string;
  accent: string;
};

/** Verified Lottie files that exist under /public/lottie/ */
const LOTTIE = {
  sun: "/lottie/sun.json",
  apple: "/lottie/apple.json",
  dog: "/lottie/dog.json",
  cat: "/lottie/cat.json",
  book: "/lottie/book.json",
  moon: "/lottie/moon.json",
  ball: "/lottie/ball.json",
  tree: "/lottie/tree.json",
  star: "/lottie/star.json",
  success: "/lottie/success.json",
} as const;

/**
 * Maps abstract / sentence vocabulary to a concrete illustration word.
 * No fuzzy regex — explicit only, so images always match the lesson.
 */
const VOCAB_ALIASES: Record<string, string> = {
  assignments: "book",
  homework: "book",
  assignment: "book",
  teacher: "book",
  promptly: "sun",
  morning: "sun",
  breakfast: "apple",
  scrumptious: "apple",
  delicious: "apple",
  hungry: "apple",
  meal: "apple",
  food: "apple",
  lunch: "apple",
  dinner: "apple",
  octopus: "fish",
  garden: "tree",
  jump: "jump",
  yawn: "sleep",
  goat: "rabbit",
  juice: "apple",
  kite: "ball",
  nest: "bird",
  queen: "lion",
  rain: "cloud",
  umbrella: "cloud",
  van: "ball",
  zebra: "rabbit",
  ship: "fish",
  phone: "book",
  whale: "fish",
  street: "tree",
  spring: "tree",
  splash: "water",
  thumb: "ball",
  hat: "ball",
  igloo: "moon",
  "yo-yo": "ball",
  yo: "ball",
  xylophone: "ball",
  "x-ray": "fish",
  scratch: "cat",
  three: "tree",
};

/** Direct word → scene. Keys are lowercase concrete nouns / verbs. */
const WORD_MAP: Record<string, IllustrationEntry> = {
  // Action verbs — calm static SVG mascot poses (no Lottie)
  drink: { scene: { kind: "kid", pose: "drink" }, accent: "#2dd4bf" },
  eat: { scene: { kind: "kid", pose: "eat" }, accent: "#fb923c" },
  jump: { scene: { kind: "kid", pose: "jump" }, accent: "#a78bfa" },
  sleep: { scene: { kind: "kid", pose: "sleep" }, accent: "#8b5cf6" },
  run: { scene: { kind: "kid", pose: "run" }, accent: "#38bdf8" },

  // Nouns — Lottie only when file is verified + matches
  sun: { scene: { kind: "core", key: "sun" }, lottieSrc: LOTTIE.sun, accent: "#fbbf24" },
  apple: { scene: { kind: "core", key: "apple" }, lottieSrc: LOTTIE.apple, accent: "#ef4444" },
  dog: { scene: { kind: "core", key: "dog" }, lottieSrc: LOTTIE.dog, accent: "#d97706" },
  cat: { scene: { kind: "core", key: "cat" }, lottieSrc: LOTTIE.cat, accent: "#f59e0b" },
  milk: { scene: { kind: "core", key: "milk" }, accent: "#7dd3fc" },
  water: { scene: { kind: "core", key: "water" }, accent: "#38bdf8" },
  chair: { scene: { kind: "core", key: "chair" }, accent: "#fb923c" },
  book: { scene: { kind: "core", key: "book" }, lottieSrc: LOTTIE.book, accent: "#7c3aed" },
  rabbit: { scene: { kind: "core", key: "rabbit" }, accent: "#f8fafc" },
  cloud: { scene: { kind: "core", key: "cloud" }, accent: "#bae6fd" },
  moon: { scene: { kind: "core", key: "moon" }, lottieSrc: LOTTIE.moon, accent: "#c4b5fd" },
  ball: { scene: { kind: "core", key: "ball" }, lottieSrc: LOTTIE.ball, accent: "#fb923c" },
  tree: { scene: { kind: "core", key: "tree" }, lottieSrc: LOTTIE.tree, accent: "#22c55e" },
  fish: { scene: { kind: "core", key: "fish" }, accent: "#0ea5e9" },
  lion: { scene: { kind: "core", key: "lion" }, accent: "#f59e0b" },
  pizza: { scene: { kind: "core", key: "pizza" }, accent: "#fbbf24" },
  elephant: { scene: { kind: "core", key: "elephant" }, accent: "#a78bfa" },
  orange: { scene: { kind: "core", key: "apple" }, lottieSrc: LOTTIE.apple, accent: "#fb923c" },
  bird: { scene: { kind: "core", key: "rabbit" }, accent: "#38bdf8" },
};

/**
 * Resolve any display word (letter, verb, sentence vocab) to the concrete
 * illustration key used in WORD_MAP.
 */
export function resolveIllustrationWord(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // ABC single letter → phonics example word (A → apple)
  const phonic = getPhonicSound(trimmed);
  if (phonic) return phonic.example.toLowerCase();

  const key = trimmed.toLowerCase();

  if (WORD_MAP[key]) return key;
  if (VOCAB_ALIASES[key]) return VOCAB_ALIASES[key];

  return key;
}

/** Human-readable caption for the resolved illustration (e.g. "Apple"). */
export function getIllustrationCaption(raw: string): string {
  const key = resolveIllustrationWord(raw);
  if (!key) return raw.trim();
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/** Example word for ABC / phonics display (e.g. "A" → "Apple"). */
export function getExampleWordForLetter(raw: string): string | null {
  return getPhonicSound(raw)?.example ?? null;
}

export function getIllustrationEntry(rawWord: string): IllustrationEntry {
  const key = resolveIllustrationWord(rawWord);
  if (key && WORD_MAP[key]) return WORD_MAP[key];

  // Last resort: calm themed badge (never a random unrelated Lottie)
  return { scene: { kind: "badge", theme: "sparkle" }, accent: "#a78bfa" };
}
