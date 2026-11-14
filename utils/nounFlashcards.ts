/**
 * Nouns & Objects flashcards — 3D stills from phonics (exact word ↔ image).
 * No SVG aliases. No videos.
 */

export type NounFlashcard = {
  id: string;
  word: string;
  /** Display label when different from word (e.g. Fire Engine) */
  label: string;
  imageSrc: string;
  stillId: string;
};

/** Skip abstract / unclear / obscure stills for toddler noun cards. */
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
 * Curated phonics stills → noun/object cards (exact match).
 * Word is the English noun kids learn; image is that object’s 3D still.
 */
const NOUN_STILLS: { stillId: string; word: string }[] = [
  { stillId: "a1_apple", word: "Apple" },
  { stillId: "a2_aeroplane", word: "Aeroplane" },
  { stillId: "a3_ant", word: "Ant" },
  { stillId: "a4_alligator", word: "Alligator" },
  { stillId: "b1_ball", word: "Ball" },
  { stillId: "b2_bus", word: "Bus" },
  { stillId: "b3_bear", word: "Bear" },
  { stillId: "b4_butterfly", word: "Butterfly" },
  { stillId: "b5_banana", word: "Banana" },
  { stillId: "c1_cat", word: "Cat" },
  { stillId: "c2_car", word: "Car" },
  { stillId: "c3_cupcake", word: "Cupcake" },
  { stillId: "c4_cow", word: "Cow" },
  { stillId: "c5_clock", word: "Clock" },
  { stillId: "d1_dog", word: "Dog" },
  { stillId: "d2_duck", word: "Duck" },
  { stillId: "d3_drum", word: "Drum" },
  { stillId: "d4_dolphin", word: "Dolphin" },
  { stillId: "d5_dinosaur", word: "Dinosaur" },
  { stillId: "e1_elephant", word: "Elephant" },
  { stillId: "e2_egg", word: "Egg" },
  { stillId: "e3_eagle", word: "Eagle" },
  { stillId: "f1_fish", word: "Fish" },
  { stillId: "f2_frog", word: "Frog" },
  { stillId: "f3_flower", word: "Flower" },
  { stillId: "f4_fox", word: "Fox" },
  { stillId: "f5_fireengine", word: "Fire Engine" },
  { stillId: "g1_giraffe", word: "Giraffe" },
  { stillId: "g2_guitar", word: "Guitar" },
  { stillId: "g3_grapes", word: "Grapes" },
  { stillId: "g4_gift", word: "Gift" },
  { stillId: "g5_gorilla", word: "Gorilla" },
  { stillId: "h1_horse", word: "Horse" },
  { stillId: "h2_hat", word: "Hat" },
  { stillId: "h3_house", word: "House" },
  { stillId: "h4_helicopter", word: "Helicopter" },
  { stillId: "h5_hippo", word: "Hippo" },
  { stillId: "i1_icecream", word: "Ice Cream" },
  { stillId: "i2_igloo", word: "Igloo" },
  { stillId: "j1_juice", word: "Juice" },
  { stillId: "j2_jellyfish", word: "Jellyfish" },
  { stillId: "j3_jet", word: "Jet" },
  { stillId: "j4_jaguar", word: "Jaguar" },
  { stillId: "j5_jug", word: "Jug" },
  { stillId: "k1_kite", word: "Kite" },
  { stillId: "k2_kangaroo", word: "Kangaroo" },
  { stillId: "k3_koala", word: "Koala" },
  { stillId: "k5_key", word: "Key" },
  { stillId: "l1_lion", word: "Lion" },
  { stillId: "l2_lamp", word: "Lamp" },
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
  { stillId: "p4_pencil", word: "Pencil" },
  { stillId: "p5_pizza", word: "Pizza" },
  { stillId: "q3_quilt", word: "Quilt" },
  { stillId: "r1_rabbit", word: "Rabbit" },
  { stillId: "r2_rocket", word: "Rocket" },
  { stillId: "r3_rainbow", word: "Rainbow" },
  { stillId: "r4_ring", word: "Ring" },
  { stillId: "r5_robot", word: "Robot" },
  { stillId: "s1_sun", word: "Sun" },
  { stillId: "s2_star", word: "Star" },
  { stillId: "s3_ship", word: "Ship" },
  { stillId: "s4_snake", word: "Snake" },
  { stillId: "s5_strawberry", word: "Strawberry" },
  { stillId: "t1_tiger", word: "Tiger" },
  { stillId: "t2_train", word: "Train" },
  { stillId: "t3_turtle", word: "Turtle" },
  { stillId: "t4_tree", word: "Tree" },
  { stillId: "t5_telephone", word: "Telephone" },
  { stillId: "u1_umbrella", word: "Umbrella" },
  { stillId: "u2_unicorn", word: "Unicorn" },
  { stillId: "v1_van", word: "Van" },
  { stillId: "v2_violin", word: "Violin" },
  { stillId: "v3_vase", word: "Vase" },
  { stillId: "v5_vegetables", word: "Vegetables" },
  { stillId: "w1_whale", word: "Whale" },
  { stillId: "w2_watermelon", word: "Watermelon" },
  { stillId: "w3_watch", word: "Watch" },
  { stillId: "w5_wolf", word: "Wolf" },
  { stillId: "x1_xylophone", word: "Xylophone" },
  { stillId: "x3_xmas_tree", word: "Christmas Tree" },
  { stillId: "y2_yoyo", word: "Yo-Yo" },
  { stillId: "y3_yak", word: "Yak" },
  { stillId: "y4_yogurt", word: "Yogurt" },
  { stillId: "z1_zebra", word: "Zebra" },
];

function stillPath(stillId: string): string {
  return `/puzzle-stills/${stillId}.jpg`;
}

function toNounCard(entry: { stillId: string; word: string }): NounFlashcard {
  const slug = entry.stillId.split("_").slice(1).join("_");
  const label =
    LABEL_OVERRIDES[slug] ??
    entry.word.replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: `n-${entry.stillId}`,
    word: label,
    label,
    imageSrc: stillPath(entry.stillId),
    stillId: entry.stillId,
  };
}

export const NOUN_OBJECT_CARDS: NounFlashcard[] = NOUN_STILLS.filter(
  (entry) => !SKIP_STILLS.has(entry.stillId),
).map(toNounCard);

/** Lookup by display word (case-insensitive). */
export function getNounCardByWord(word: string): NounFlashcard | undefined {
  const key = word.trim().toLowerCase();
  return NOUN_OBJECT_CARDS.find((card) => card.word.toLowerCase() === key);
}
