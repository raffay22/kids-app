import { getPhonicSound } from "@/utils/phonicsSounds";
import { resolveLottieUrl } from "@/utils/lottieUrl";
import { createClient } from "@/utils/supabase/client";
import { NOUN_OBJECT_CARDS } from "@/utils/nounFlashcards";
import { VERB_ACTION_CARDS } from "@/utils/verbFlashcards";

export type FlashcardCategory = "nouns" | "verbs" | "abc";

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

export type FlashcardItem = {
  id: string;
  word: string;
  category: FlashcardCategory;
  /** Display label for ABC letters */
  prompt?: string;
  /** Concrete noun shown as the hero image (ABC: Apple for A) */
  exampleWord?: string;
  /** Supabase/CDN Lottie JSON URL when set */
  lottieUrl?: string;
  /** Exact 3D still for nouns/objects (preferred over SVG/Lottie) */
  imageSrc?: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
};

export const CATEGORY_STYLES: Record<
  FlashcardCategory,
  { tab: string; card: string; label: string; gradient: string }
> = {
  nouns: {
    label: "Nouns & Objects",
    tab: "border-sky-400 bg-sky-100 text-sky-900",
    card: "border-sky-300 bg-gradient-to-br from-sky-50 to-blue-100 text-sky-900",
    gradient: "from-sky-400 to-blue-500",
  },
  verbs: {
    label: "Action Verbs",
    tab: "border-emerald-400 bg-emerald-100 text-emerald-900",
    card: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-900",
    gradient: "from-emerald-400 to-green-500",
  },
  abc: {
    label: "ABC Alphabet",
    tab: "border-purple-400 bg-purple-100 text-purple-900",
    card: "border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-100 text-purple-900",
    gradient: "from-purple-400 to-fuchsia-500",
  },
};

export const FLASHCARD_DECK: FlashcardItem[] = [
  // Nouns & Objects — clean 3D stills (exact word ↔ image)
  ...NOUN_OBJECT_CARDS.map((noun) => ({
    id: noun.id,
    word: noun.word,
    category: "nouns" as const,
    imageSrc: noun.imageSrc,
  })),
  // Action Verbs — short 3D action clips (verb-only speech)
  ...VERB_ACTION_CARDS.map((verb) => ({
    id: verb.id,
    word: verb.word,
    category: "verbs" as const,
    imageSrc: verb.imageSrc,
    videoUrl: verb.videoSrc,
  })),
  // ABC Alphabet — full A–Z with matching example images
  ...buildAbcCards(),
];

/** Local 3D noun + verb decks always win over remote rows (old SVG / wrong icons). */
export function mergeFlashcardDeck(remote: FlashcardItem[] | null): FlashcardItem[] {
  const localNouns = NOUN_OBJECT_CARDS.map((noun) => ({
    id: noun.id,
    word: noun.word,
    category: "nouns" as const,
    imageSrc: noun.imageSrc,
  }));
  const localVerbs = VERB_ACTION_CARDS.map((verb) => ({
    id: verb.id,
    word: verb.word,
    category: "verbs" as const,
    imageSrc: verb.imageSrc,
    videoUrl: verb.videoSrc,
  }));
  const localAbc = FLASHCARD_DECK.filter((card) => card.category === "abc");
  if (!remote?.length) return [...localNouns, ...localVerbs, ...localAbc];

  const remoteAbc = remote.filter((card) => card.category === "abc");
  const abc = remoteAbc.length > 0 ? remoteAbc : localAbc;
  return [...localNouns, ...localVerbs, ...abc];
}

export function getCardsByCategory(
  category: FlashcardCategory,
  deck: FlashcardItem[] = FLASHCARD_DECK,
): FlashcardItem[] {
  return deck.filter((c) => c.category === category);
}

/** Build 4-option quiz choices including the correct answer */
export function buildChoices(correct: FlashcardItem, pool: FlashcardItem[]): string[] {
  const distractors = pool
    .filter((c) => c.id !== correct.id && c.category === correct.category)
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
): {
  card: FlashcardItem;
  choices: string[];
} | null {
  const categoryPool = getCardsByCategory(category, deck);
  const pool = categoryPool.filter((c) => !excludeIds.includes(c.id));
  if (pool.length === 0) return null;

  const card = pool[Math.floor(Math.random() * pool.length)];
  const choices = buildChoices(card, categoryPool);
  return { card, choices };
}
