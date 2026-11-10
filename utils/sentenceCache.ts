import localforage from "localforage";
import type { SentenceRecord } from "@/utils/sentences";

const CACHE_KEY = "sentence_cache";
const MAX_CACHED = 30;

const cacheStore = localforage.createInstance({ name: "kids-learning", storeName: "sentence_cache" });

export async function cacheSentences(sentences: SentenceRecord[]): Promise<void> {
  const slice = sentences.slice(0, MAX_CACHED);
  await cacheStore.setItem(CACHE_KEY, slice);
}

export async function getCachedSentences(): Promise<SentenceRecord[]> {
  return (await cacheStore.getItem<SentenceRecord[]>(CACHE_KEY)) ?? [];
}

export async function appendToSentenceCache(sentence: SentenceRecord): Promise<void> {
  const existing = await getCachedSentences();
  const filtered = existing.filter((s) => s.sentence_id !== sentence.sentence_id);
  const next = [sentence, ...filtered].slice(0, MAX_CACHED);
  await cacheStore.setItem(CACHE_KEY, next);
}
