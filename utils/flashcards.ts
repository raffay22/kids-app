import { getPhonicSound } from "@/utils/phonicsSounds";
import { resolveLottieUrl } from "@/utils/lottieUrl";
import { createClient } from "@/utils/supabase/client";
import { puzzleStillsPublicUrl } from "@/utils/supabaseMedia";
import { NOUN_CARDS } from "@/utils/nounFlashcards";
import { OBJECT_CARDS } from "@/utils/objectFlashcards";
import {
  PRONOUN_CARDS,
  type FlashcardDifficultyLevel,
} from "@/utils/pronounFlashcards";
import { VERB_ACTION_CARDS } from "@/utils/verbFlashcards";

export type { FlashcardDifficultyLevel };

export type FlashcardCategory =
  | "nouns"
  | "objects"
  | "verbs"
  | "pronouns"
  | "adjectives"
  | "vowels_consonants"
  | "abc";

/** Raw row from public.flashcards */
export type FlashcardRow = {
  flashcard_id: string;
  word: string;
  category: string;
  example_word?: string | null;
  lottie_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export function dbCategoryToUi(category: string): FlashcardCategory {
  if (category === "alphabet") return "abc";
  if (category === "object") return "objects";
  if (category === "pronoun") return "pronouns";
  if (category === "adjective") return "adjectives";
  if (category === "vowels" || category === "vowels_consonants") return "vowels_consonants";
  return category as FlashcardCategory;
}

export function mapFlashcardRow(row: FlashcardRow): FlashcardItem {
  return {
    id: row.flashcard_id,
    word: row.word,
    category: dbCategoryToUi(row.category),
    exampleWord: row.example_word ?? undefined,
    lottieUrl: resolveLottieUrl(row.lottie_url),
  };
}

/** Fetch active flashcards from Supabase; returns null on error or empty. */
export async function fetchFlashcardsFromSupabase(): Promise<FlashcardItem[] | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("flashcards")
      .select("flashcard_id, word, category, example_word, lottie_url, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) return null;
    return (data as FlashcardRow[]).map(mapFlashcardRow);
  } catch {
    return null;
  }
}

const ABC_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const VOWEL_SET = new Set(["A", "E", "I", "O", "U"]);

function buildAbcCards(): FlashcardItem[] {
  return ABC_LETTERS.map((letter) => {
    const phonic = getPhonicSound(letter)!;
    return {
      id: `a-${letter}`,
      word: letter.toUpperCase(),
      category: "abc" as const,
      exampleWord: phonic.example,
      prompt: `${phonic.display} — ${phonic.speakText}`,
    };
  });
}

/** Existing 3D still images paired with their exact matching word (A–Z) from `puzzle-stills`. */
const LETTER_3D_STILL: Record<string, { word: string; stillFile: string }> = {
  A: { word: "Apple", stillFile: "a1_apple.jpg" },
  B: { word: "Ball", stillFile: "b1_ball.jpg" },
  C: { word: "Cat", stillFile: "c1_cat.jpg" },
  D: { word: "Dog", stillFile: "d1_dog.jpg" },
  E: { word: "Elephant", stillFile: "e1_elephant.jpg" },
  F: { word: "Fish", stillFile: "f1_fish.jpg" },
  G: { word: "Giraffe", stillFile: "g1_giraffe.jpg" },
  H: { word: "Hat", stillFile: "h2_hat.jpg" },
  I: { word: "Igloo", stillFile: "i2_igloo.jpg" },
  J: { word: "Juice", stillFile: "j1_juice.jpg" },
  K: { word: "Kite", stillFile: "k1_kite.jpg" },
  L: { word: "Lion", stillFile: "l1_lion.jpg" },
  M: { word: "Moon", stillFile: "m2_moon.jpg" },
  N: { word: "Nest", stillFile: "n1_nest.jpg" },
  O: { word: "Octopus", stillFile: "o3_octopus.jpg" },
  P: { word: "Pizza", stillFile: "p5_pizza.jpg" },
  Q: { word: "Queen", stillFile: "q1_queen.jpg" },
  R: { word: "Rabbit", stillFile: "r1_rabbit.jpg" },
  S: { word: "Sun", stillFile: "s1_sun.jpg" },
  T: { word: "Tree", stillFile: "t4_tree.jpg" },
  U: { word: "Umbrella", stillFile: "u1_umbrella.jpg" },
  V: { word: "Van", stillFile: "v1_van.jpg" },
  W: { word: "Whale", stillFile: "w1_whale.jpg" },
  X: { word: "Xylophone", stillFile: "x1_xylophone.jpg" },
  Y: { word: "Yarn", stillFile: "y5_yarn.jpg" },
  Z: { word: "Zebra", stillFile: "z1_zebra.jpg" },
};

function buildVowelsConsonantsCards(): FlashcardItem[] {
  return ABC_LETTERS.map((letter) => {
    const upper = letter.toUpperCase();
    const isVowel = VOWEL_SET.has(upper);
    const kindLabel = isVowel ? "Vowel" : "Consonant";
    const answerLabel = `${kindLabel} ${upper}`;
    const entry = LETTER_3D_STILL[upper] ?? { word: "Apple", stillFile: "a1_apple.jpg" };
    return {
      id: `vc-${letter}`,
      word: answerLabel,
      category: "vowels_consonants" as const,
      exampleWord: entry.word,
      prompt: `Letter ${upper} (${entry.word}) — Is ${upper} a Vowel or a Consonant?`,
      speakText: `${upper} is a ${kindLabel}! ${upper} is for ${entry.word}.`,
      imageSrc: puzzleStillsPublicUrl(entry.stillFile),
    };
  });
}

type AdjectiveCardDef = {
  id: string;
  word: string;
  level: FlashcardDifficultyLevel;
  clue: string;
  sentence: string;
  stillFile: string;
};

const ADJECTIVE_DEFS: AdjectiveCardDef[] = [
  // ============================================================================
  // LEVEL 1: BASIC ADJECTIVES (Ages 2–4 · Core Size, Feeling, Temperature, Speed)
  // ============================================================================
  {
    id: "adj-big",
    word: "Big",
    level: "basic",
    clue: "The elephant is very ___!",
    sentence: "The elephant is very big!",
    stillFile: "e1_elephant.jpg",
  },
  {
    id: "adj-small",
    word: "Small",
    level: "basic",
    clue: "The little mouse is very ___!",
    sentence: "The little mouse is very small!",
    stillFile: "m5_mouse.jpg",
  },
  {
    id: "adj-happy",
    word: "Happy",
    level: "basic",
    clue: "The playful puppy looks so ___!",
    sentence: "The playful puppy looks so happy!",
    stillFile: "d1_dog.jpg",
  },
  {
    id: "adj-hot",
    word: "Hot",
    level: "basic",
    clue: "The bright summer sun is very ___!",
    sentence: "The bright summer sun is very hot!",
    stillFile: "s1_sun.jpg",
  },
  {
    id: "adj-cold",
    word: "Cold",
    level: "basic",
    clue: "The snowy ice cream is very ___!",
    sentence: "The snowy ice cream is very cold!",
    stillFile: "i1_icecream.jpg",
  },
  {
    id: "adj-fast",
    word: "Fast",
    level: "basic",
    clue: "The red race car zooms so ___!",
    sentence: "The red race car zooms so fast!",
    stillFile: "c2_car.jpg",
  },
  {
    id: "adj-slow",
    word: "Slow",
    level: "basic",
    clue: "The green turtle walks very ___!",
    sentence: "The green turtle walks very slow!",
    stillFile: "t3_turtle.jpg",
  },
  {
    id: "adj-tall",
    word: "Tall",
    level: "basic",
    clue: "The giraffe has a long neck and is ___!",
    sentence: "The giraffe is very tall!",
    stillFile: "g1_giraffe.jpg",
  },
  {
    id: "adj-soft",
    word: "Soft",
    level: "basic",
    clue: "The cuddly bear feels so ___!",
    sentence: "The cuddly bear feels so soft!",
    stillFile: "b3_bear.jpg",
  },
  {
    id: "adj-sweet",
    word: "Sweet",
    level: "basic",
    clue: "The pink cupcake tastes ___!",
    sentence: "The pink cupcake tastes sweet!",
    stillFile: "c3_cupcake.jpg",
  },

  // ============================================================================
  // LEVEL 2: ADVANCED ADJECTIVES (Ages 4–6 · Sensory, Character & Comparatives)
  // ============================================================================
  {
    id: "adj-brave",
    word: "Brave",
    level: "advanced",
    clue: "The fearless lion is very ___!",
    sentence: "The fearless lion is very brave!",
    stillFile: "l1_lion.jpg",
  },
  {
    id: "adj-loud",
    word: "Loud",
    level: "advanced",
    clue: "Banging the marching drum makes a ___ sound!",
    sentence: "The marching drum makes a loud sound!",
    stillFile: "d3_drum.jpg",
  },
  {
    id: "adj-heavy",
    word: "Heavy",
    level: "advanced",
    clue: "The huge hippo is very ___!",
    sentence: "The huge hippo is very heavy!",
    stillFile: "h5_hippo.jpg",
  },
  {
    id: "adj-bright",
    word: "Bright",
    level: "advanced",
    clue: "The glowing golden star is so ___!",
    sentence: "The glowing golden star is so bright!",
    stillFile: "s2_star.jpg",
  },
  {
    id: "adj-colorful",
    word: "Colorful",
    level: "advanced",
    clue: "The rainbow in the sky is so ___!",
    sentence: "The rainbow in the sky is so colorful!",
    stillFile: "r3_rainbow.jpg",
  },
  {
    id: "adj-clean",
    word: "Clean",
    level: "advanced",
    clue: "The sparkling white igloo looks so ___!",
    sentence: "The sparkling white igloo looks so clean!",
    stillFile: "i2_igloo.jpg",
  },
  {
    id: "adj-fluffy",
    word: "Fluffy",
    level: "advanced",
    clue: "The little white rabbit is so ___!",
    sentence: "The little white rabbit is so fluffy!",
    stillFile: "r1_rabbit.jpg",
  },
  {
    id: "adj-shiny",
    word: "Shiny",
    level: "advanced",
    clue: "The golden ring is so ___!",
    sentence: "The golden ring is so shiny!",
    stillFile: "r4_ring.jpg",
  },
  {
    id: "adj-bigger",
    word: "Bigger",
    level: "advanced",
    clue: "A blue whale is ___ than a fish!",
    sentence: "A blue whale is bigger than a fish!",
    stillFile: "w1_whale.jpg",
  },
  {
    id: "adj-faster",
    word: "Faster",
    level: "advanced",
    clue: "A space rocket is ___ than a bicycle!",
    sentence: "A space rocket is faster than a bicycle!",
    stillFile: "r2_rocket.jpg",
  },

  // ============================================================================
  // LEVEL 3: PRO ADJECTIVES (Ages 6–9 · Superlatives & Rich Descriptive Vocab)
  // ============================================================================
  {
    id: "adj-biggest",
    word: "Biggest",
    level: "pro",
    clue: "Planet Earth is the ___ home we share!",
    sentence: "Planet Earth is the biggest home we share!",
    stillFile: "e5_earth.jpg",
  },
  {
    id: "adj-fastest",
    word: "Fastest",
    level: "pro",
    clue: "The sky jet is the ___ flyer of all!",
    sentence: "The sky jet is the fastest flyer of all!",
    stillFile: "j3_jet.jpg",
  },
  {
    id: "adj-generous",
    word: "Generous",
    level: "pro",
    clue: "Sharing a wrapped gift with friends is ___!",
    sentence: "Sharing a wrapped gift with friends is generous!",
    stillFile: "g4_gift.jpg",
  },
  {
    id: "adj-curious",
    word: "Curious",
    level: "pro",
    clue: "The playful monkey loves exploring — it is ___!",
    sentence: "The curious monkey loves exploring new things!",
    stillFile: "m1_monkey.jpg",
  },
  {
    id: "adj-gentle",
    word: "Gentle",
    level: "pro",
    clue: "The friendly dolphin is kind and ___!",
    sentence: "The friendly dolphin is kind and gentle!",
    stillFile: "d4_dolphin.jpg",
  },
  {
    id: "adj-patient",
    word: "Patient",
    level: "pro",
    clue: "The wise owl waits calmly — it is ___!",
    sentence: "The wise owl waits calmly. It is patient!",
    stillFile: "o1_owl.jpg",
  },
  {
    id: "adj-creative",
    word: "Creative",
    level: "pro",
    clue: "Drawing original pictures with a pencil is ___!",
    sentence: "Drawing original pictures with a pencil is creative!",
    stillFile: "p4_pencil.jpg",
  },
  {
    id: "adj-delicious",
    word: "Delicious",
    level: "pro",
    clue: "This warm slice of pizza tastes ___!",
    sentence: "This warm slice of pizza tastes delicious!",
    stillFile: "p5_pizza.jpg",
  },
  {
    id: "adj-enormous",
    word: "Enormous",
    level: "pro",
    clue: "The giant dinosaur was ___ in size!",
    sentence: "The giant dinosaur was enormous in size!",
    stillFile: "d5_dinosaur.jpg",
  },
  {
    id: "adj-ancient",
    word: "Ancient",
    level: "pro",
    clue: "The royal king's crown is from ___ times!",
    sentence: "The royal king's crown is from ancient times!",
    stillFile: "k4_king.jpg",
  },
];

function buildAdjectiveCards(): FlashcardItem[] {
  return ADJECTIVE_DEFS.map((def) => ({
    id: def.id,
    word: def.word,
    category: "adjectives" as const,
    level: def.level,
    prompt: def.clue,
    speakText: def.sentence,
    imageSrc: puzzleStillsPublicUrl(def.stillFile),
  }));
}

export type FlashcardItem = {
  id: string;
  word: string;
  category: FlashcardCategory;
  /** Optional difficulty tier for leveled tabs (Pronouns & Adjectives). */
  level?: FlashcardDifficultyLevel;
  /** Display label or fill-in-the-blank clue */
  prompt?: string;
  /** Full sentence spoken on Hear it */
  speakText?: string;
  /** Concrete noun shown as the hero image (ABC: Apple for A) */
  exampleWord?: string;
  /** Supabase/CDN Lottie JSON URL when set */
  lottieUrl?: string;
  /** Exact 3D still or matched scene illustration */
  imageSrc?: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
};

export const CATEGORY_STYLES: Record<
  FlashcardCategory,
  { tab: string; card: string; label: string; gradient: string }
> = {
  nouns: {
    label: "Nouns",
    tab: "border-sky-400 bg-sky-100 text-sky-900",
    card: "border-sky-300 bg-gradient-to-br from-sky-50 to-blue-100 text-sky-900",
    gradient: "from-sky-400 to-blue-500",
  },
  objects: {
    label: "Objects",
    tab: "border-amber-400 bg-amber-100 text-amber-900",
    card: "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-100 text-amber-950",
    gradient: "from-amber-400 to-orange-500",
  },
  verbs: {
    label: "Action Verbs",
    tab: "border-emerald-400 bg-emerald-100 text-emerald-900",
    card: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-900",
    gradient: "from-emerald-400 to-green-500",
  },
  pronouns: {
    label: "Pronouns",
    tab: "border-rose-400 bg-rose-100 text-rose-900",
    card: "border-rose-300 bg-gradient-to-br from-rose-50 to-pink-100 text-rose-950",
    gradient: "from-rose-400 to-pink-500",
  },
  adjectives: {
    label: "Adjectives",
    tab: "border-teal-400 bg-teal-100 text-teal-900",
    card: "border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-100 text-teal-950",
    gradient: "from-teal-400 to-cyan-500",
  },
  vowels_consonants: {
    label: "Vowels & Consonants",
    tab: "border-indigo-400 bg-indigo-100 text-indigo-900",
    card: "border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-950",
    gradient: "from-indigo-400 to-blue-500",
  },
  abc: {
    label: "ABC Alphabet",
    tab: "border-purple-400 bg-purple-100 text-purple-900",
    card: "border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-100 text-purple-900",
    gradient: "from-purple-400 to-fuchsia-500",
  },
};

function mapStillDeck(
  cards: { id: string; word: string; imageSrc: string }[],
  category: "nouns" | "objects",
): FlashcardItem[] {
  return cards.map((card) => ({
    id: card.id,
    word: card.word,
    category,
    imageSrc: card.imageSrc,
  }));
}

function mapPronounDeck(): FlashcardItem[] {
  return PRONOUN_CARDS.map((card) => ({
    id: card.id,
    word: card.word,
    category: "pronouns" as const,
    level: card.level,
    prompt: card.clue,
    speakText: card.sentence,
    imageSrc: card.imageSrc,
  }));
}

export const FLASHCARD_DECK: FlashcardItem[] = [
  ...mapStillDeck(NOUN_CARDS, "nouns"),
  ...mapStillDeck(OBJECT_CARDS, "objects"),
  // Action Verbs — continuous form + full sentence speech
  ...VERB_ACTION_CARDS.map((verb) => ({
    id: verb.id,
    word: verb.word,
    category: "verbs" as const,
    prompt: verb.sentence,
    speakText: verb.sentence,
    imageSrc: verb.imageSrc,
    videoUrl: verb.videoSrc,
  })),
  ...mapPronounDeck(),
  ...buildAdjectiveCards(),
  ...buildVowelsConsonantsCards(),
  // ABC Alphabet — full A–Z with matching example images
  ...buildAbcCards(),
];

/** Local 3D decks always win over remote rows (old SVG / wrong icons). */
export function mergeFlashcardDeck(remote: FlashcardItem[] | null): FlashcardItem[] {
  const localNouns = mapStillDeck(NOUN_CARDS, "nouns");
  const localObjects = mapStillDeck(OBJECT_CARDS, "objects");
  const localVerbs = VERB_ACTION_CARDS.map((verb) => ({
    id: verb.id,
    word: verb.word,
    category: "verbs" as const,
    prompt: verb.sentence,
    speakText: verb.sentence,
    imageSrc: verb.imageSrc,
    videoUrl: verb.videoSrc,
  }));
  const localPronouns = mapPronounDeck();
  const localAdjectives = buildAdjectiveCards();
  const localVowelsConsonants = buildVowelsConsonantsCards();
  const localAbc = FLASHCARD_DECK.filter((card) => card.category === "abc");
  if (!remote?.length) {
    return [
      ...localNouns,
      ...localObjects,
      ...localVerbs,
      ...localPronouns,
      ...localAdjectives,
      ...localVowelsConsonants,
      ...localAbc,
    ];
  }

  const remoteAbc = remote.filter((card) => card.category === "abc");
  const abc = remoteAbc.length > 0 ? remoteAbc : localAbc;
  return [
    ...localNouns,
    ...localObjects,
    ...localVerbs,
    ...localPronouns,
    ...localAdjectives,
    ...localVowelsConsonants,
    ...abc,
  ];
}

export function getCardsByCategory(
  category: FlashcardCategory,
  deck: FlashcardItem[] = FLASHCARD_DECK,
  level?: FlashcardDifficultyLevel,
): FlashcardItem[] {
  const byCat = deck.filter((c) => c.category === category);
  if (level && (category === "pronouns" || category === "adjectives")) {
    const byLevel = byCat.filter((c) => c.level === level);
    if (byLevel.length > 0) return byLevel;
  }
  return byCat;
}

/** Build 4-option quiz choices including the correct answer */
export function buildChoices(correct: FlashcardItem, pool: FlashcardItem[]): string[] {
  const distractors = pool
    .filter((c) => c.id !== correct.id && c.category === correct.category && c.word !== correct.word)
    .map((c) => c.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const choices = [...distractors, correct.word].sort(() => Math.random() - 0.5);
  return choices;
}

export function pickQuizCard(
  category: FlashcardCategory,
  excludeIds: string[] = [],
  deck: FlashcardItem[] = FLASHCARD_DECK,
  level?: FlashcardDifficultyLevel,
): {
  card: FlashcardItem;
  choices: string[];
} | null {
  const categoryPool = getCardsByCategory(category, deck, level);
  const pool = categoryPool.filter((c) => !excludeIds.includes(c.id));
  if (pool.length === 0) return null;

  const card = pool[Math.floor(Math.random() * pool.length)];
  const choices = buildChoices(card, categoryPool);
  return { card, choices };
}
