/**
 * Nouns flashcards — living things, nature, and food (3D stills).
 * Objects are in objectFlashcards.ts (same image pool, separate category).
 * Stills resolve to the Supabase `puzzle-stills` bucket (CDN).
 */

import { puzzleStillsPublicUrl } from "@/utils/supabaseMedia";

export type NounFlashcard = {
  id: string;
  word: string;
  /** Display label when different from word (e.g. Fire Engine) */
  label: string;
  imageSrc: string;
  stillId: string;
};

/** Skip abstract / unclear / obscure stills for toddler cards. */
const SKIP_STILLS = new Set([
  "n4_night",
  "q4_question",
  "u5_underwater",
  "x2_xray",
  "x4_xenops",
  "x5_xiphosura",
  "z4_zero",
  "e5_earth",
  "u3_uniform",
  "u4_urn",
]);

/** Pretty labels for multi-word / stylized names. */
const LABEL_OVERRIDES: Record<string, string> = {
  aeroplane: "Aeroplane",
  fireengine: "Fire Engine",
  icecream: "Ice Cream",
  xmas_tree: "Christmas Tree",
  yoyo: "Yo-Yo",
};

/**
 * Living / nature / food nouns (not man-made objects).
 */
const NOUN_STILLS: { stillId: string; word: string }[] = [
  { stillId: "a1_apple", word: "Apple" },
  { stillId: "a3_ant", word: "Ant" },
  { stillId: "a4_alligator", word: "Alligator" },
  { stillId: "b3_bear", word: "Bear" },
  { stillId: "b4_butterfly", word: "Butterfly" },
  { stillId: "b5_banana", word: "Banana" },
  { stillId: "c1_cat", word: "Cat" },
  { stillId: "c3_cupcake", word: "Cupcake" },
  { stillId: "c4_cow", word: "Cow" },
  { stillId: "d1_dog", word: "Dog" },
  { stillId: "d2_duck", word: "Duck" },
  { stillId: "d4_dolphin", word: "Dolphin" },
  { stillId: "d5_dinosaur", word: "Dinosaur" },
  { stillId: "e1_elephant", word: "Elephant" },
  { stillId: "e2_egg", word: "Egg" },
  { stillId: "e3_eagle", word: "Eagle" },
  { stillId: "f1_fish", word: "Fish" },
  { stillId: "f2_frog", word: "Frog" },
  { stillId: "f3_flower", word: "Flower" },
  { stillId: "f4_fox", word: "Fox" },
  { stillId: "g1_giraffe", word: "Giraffe" },
  { stillId: "g3_grapes", word: "Grapes" },
  { stillId: "g5_gorilla", word: "Gorilla" },
  { stillId: "h1_horse", word: "Horse" },
  { stillId: "h5_hippo", word: "Hippo" },
  { stillId: "i1_icecream", word: "Ice Cream" },
  { stillId: "j1_juice", word: "Juice" },
  { stillId: "j2_jellyfish", word: "Jellyfish" },
  { stillId: "j4_jaguar", word: "Jaguar" },
  { stillId: "k2_kangaroo", word: "Kangaroo" },
  { stillId: "k3_koala", word: "Koala" },
  { stillId: "l1_lion", word: "Lion" },
  { stillId: "l3_lemon", word: "Lemon" },
  { stillId: "l4_leaf", word: "Leaf" },
  { stillId: "l5_lollipop", word: "Lollipop" },
  { stillId: "m1_monkey", word: "Monkey" },
  { stillId: "m2_moon", word: "Moon" },
  { stillId: "m3_mango", word: "Mango" },
  { stillId: "m4_milk", word: "Milk" },
  { stillId: "m5_mouse", word: "Mouse" },
  { stillId: "o1_owl", word: "Owl" },
  { stillId: "o2_orange", word: "Orange" },
  { stillId: "o3_octopus", word: "Octopus" },
  { stillId: "o5_onion", word: "Onion" },
  { stillId: "p1_panda", word: "Panda" },
  { stillId: "p2_penguin", word: "Penguin" },
  { stillId: "p3_parrot", word: "Parrot" },
  { stillId: "p5_pizza", word: "Pizza" },
  { stillId: "r1_rabbit", word: "Rabbit" },
  { stillId: "r3_rainbow", word: "Rainbow" },
  { stillId: "s1_sun", word: "Sun" },
  { stillId: "s2_star", word: "Star" },
  { stillId: "s4_snake", word: "Snake" },
  { stillId: "s5_strawberry", word: "Strawberry" },
  { stillId: "t1_tiger", word: "Tiger" },
  { stillId: "t3_turtle", word: "Turtle" },
  { stillId: "t4_tree", word: "Tree" },
  { stillId: "u2_unicorn", word: "Unicorn" },
  { stillId: "v5_vegetables", word: "Vegetables" },
  { stillId: "w1_whale", word: "Whale" },
  { stillId: "w2_watermelon", word: "Watermelon" },
  { stillId: "w5_wolf", word: "Wolf" },
  { stillId: "y3_yak", word: "Yak" },
  { stillId: "y4_yogurt", word: "Yogurt" },
  { stillId: "z1_zebra", word: "Zebra" },
];

export function stillPath(stillId: string): string {
  return puzzleStillsPublicUrl(`${stillId}.jpg`);
}

export function toStillCard(
  entry: { stillId: string; word: string },
  idPrefix: "n" | "o",
): NounFlashcard {
  const slug = entry.stillId.split("_").slice(1).join("_");
  const label =
    LABEL_OVERRIDES[slug] ??
    entry.word.replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: `${idPrefix}-${entry.stillId}`,
    word: label,
    label,
    imageSrc: stillPath(entry.stillId),
    stillId: entry.stillId,
  };
}

export function isSkippedStill(stillId: string): boolean {
  return SKIP_STILLS.has(stillId);
}

export const NOUN_CARDS: NounFlashcard[] = NOUN_STILLS.filter(
  (entry) => !SKIP_STILLS.has(entry.stillId),
).map((entry) => toStillCard(entry, "n"));

/** @deprecated Prefer NOUN_CARDS — kept for older imports / media lookup. */
export const NOUN_OBJECT_CARDS = NOUN_CARDS;

/** Lookup by display word (case-insensitive) in the nouns deck. */
export function getNounCardByWord(word: string): NounFlashcard | undefined {
  const key = word.trim().toLowerCase();
  return NOUN_CARDS.find((card) => card.word.toLowerCase() === key);
}
