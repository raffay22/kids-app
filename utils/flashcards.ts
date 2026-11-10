import { getPhonicSound } from "@/utils/phonicsSounds";
import { resolveLottieUrl } from "@/utils/lottieUrl";
import { createClient } from "@/utils/supabase/client";

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
  // Nouns & Objects
  { id: "n-water", word: "Water", category: "nouns" },
  { id: "n-milk", word: "Milk", category: "nouns" },
  { id: "n-chair", word: "Chair", category: "nouns" },
  { id: "n-dog", word: "Dog", category: "nouns" },
  { id: "n-cat", word: "Cat", category: "nouns" },
  { id: "n-apple", word: "Apple", category: "nouns" },
  { id: "n-book", word: "Book", category: "nouns" },
  { id: "n-rabbit", word: "Rabbit", category: "nouns" },
  { id: "n-sun", word: "Sun", category: "nouns" },
  { id: "n-cloud", word: "Cloud", category: "nouns" },
  // Action Verbs
  { id: "v-drink", word: "Drink", category: "verbs" },
  { id: "v-eat", word: "Eat", category: "verbs" },
  { id: "v-jump", word: "Jump", category: "verbs" },
  { id: "v-sleep", word: "Sleep", category: "verbs" },
  { id: "v-run", word: "Run", category: "verbs" },
  // ABC Alphabet — full A–Z with matching example images
  ...buildAbcCards(),
];

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
