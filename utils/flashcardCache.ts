import localforage from "localforage";
import type { FlashcardItem } from "@/utils/flashcards";

const CACHE_KEY = "flashcard_word_cache";
const MAX_CACHED = 20;

const cacheStore = localforage.createInstance({ name: "kids-learning", storeName: "flashcard_cache" });

export async function cacheFlashcardWord(card: FlashcardItem): Promise<void> {
  const existing = (await cacheStore.getItem<FlashcardItem[]>(CACHE_KEY)) ?? [];
  const filtered = existing.filter((c) => c.id !== card.id);
  const next = [{ ...card }, ...filtered].slice(0, MAX_CACHED);
  await cacheStore.setItem(CACHE_KEY, next);
}

export async function getCachedFlashcards(): Promise<FlashcardItem[]> {
  return (await cacheStore.getItem<FlashcardItem[]>(CACHE_KEY)) ?? [];
}

export async function getCachedWordsForCategory(
  category: FlashcardItem["category"],
): Promise<FlashcardItem[]> {
  const all = await getCachedFlashcards();
  return all.filter((c) => c.category === category);
}
