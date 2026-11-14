import { getNounCardByWord } from "@/utils/nounFlashcards";
import { getVerbCardByWord } from "@/utils/verbFlashcards";

export type SentenceMedia = {
  imageSrc?: string;
  videoSrc?: string;
  label: string;
};

const STOP = new Set([
  "a",
  "an",
  "the",
  "to",
  "in",
  "on",
  "at",
  "of",
  "for",
  "and",
  "or",
  "my",
  "me",
  "i",
  "we",
  "you",
  "he",
  "she",
  "it",
  "they",
  "is",
  "am",
  "are",
  "was",
  "were",
  "with",
  "from",
  "this",
  "that",
  "his",
  "her",
  "our",
  "their",
]);

/** Map common sentence words → noun/verb media keys. */
const ALIASES: Record<string, string> = {
  sleeps: "Sleep",
  sleeping: "Sleep",
  slept: "Sleep",
  runs: "Run",
  running: "Run",
  jumps: "Jump",
  jumping: "Jump",
  eats: "Eat",
  eating: "Eat",
  drinks: "Drink",
  drinking: "Drink",
  swims: "Swim",
  swimming: "Swim",
  writes: "Write",
  writing: "Write",
  walks: "Walk",
  walking: "Walk",
  reads: "Read",
  reading: "Read",
  plays: "Play",
  playing: "Play",
  flies: "Fly",
  flying: "Fly",
  washes: "Wash",
  washing: "Wash",
  brushes: "Brush",
  brushing: "Brush",
  smiles: "Smile",
  smiling: "Smile",
  waves: "Wave",
  waving: "Wave",
  claps: "Clap",
  clapping: "Clap",
  hugs: "Hug",
  hugging: "Hug",
  looks: "Look",
  looking: "Look",
  listens: "Listen",
  listening: "Listen",
  sings: "Sing",
  singing: "Sing",
  dances: "Dance",
  dancing: "Dance",
  draws: "Draw",
  drawing: "Draw",
  paints: "Paint",
  painting: "Paint",
  climbs: "Climb",
  climbing: "Climb",
  crawls: "Crawl",
  crawling: "Crawl",
  hops: "Hop",
  hopping: "Hop",
  stretches: "Stretch",
  yawns: "Yawn",
  wakes: "Wake",
  morning: "Sun",
  night: "Moon",
  homework: "Book",
  teacher: "Book",
  breakfast: "Apple",
  house: "House",
  friend: "Ball",
  friends: "Ball",
  school: "Bus",
  water: "Whale",
  milk: "Milk",
  apple: "Apple",
  dog: "Dog",
  cat: "Cat",
  sun: "Sun",
  moon: "Moon",
  ball: "Ball",
  tree: "Tree",
  fish: "Fish",
  bird: "Eagle",
  car: "Car",
  bus: "Bus",
  book: "Book",
  flower: "Flower",
  rain: "Umbrella",
  umbrella: "Umbrella",
  toothbrush: "Brush",
  teeth: "Brush",
  hands: "Wash",
  park: "Tree",
  garden: "Flower",
  kitchen: "Pizza",
  bed: "Moon",
  bicycle: "Van",
  bike: "Van",
};

function titleCase(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function lookupKey(raw: string): SentenceMedia | null {
  const clean = raw.replace(/[^a-zA-Z'-]/g, "");
  if (!clean) return null;
  const alias = ALIASES[clean.toLowerCase()] ?? titleCase(clean);
  const verb = getVerbCardByWord(alias);
  if (verb) {
    return { videoSrc: verb.videoSrc, imageSrc: verb.imageSrc, label: verb.word };
  }
  const noun = getNounCardByWord(alias);
  if (noun) {
    return { imageSrc: noun.imageSrc, label: noun.word };
  }
  return null;
}

/**
 * Pick a small matching 3D still/video for a sentence from nouns/verbs catalogs.
 */
export function resolveSentenceMedia(
  fullSentence: string,
  preferredWord?: string,
): SentenceMedia {
  if (preferredWord) {
    const preferred = lookupKey(preferredWord);
    if (preferred) return preferred;
  }

  const tokens = fullSentence.split(/\s+/);
  for (const token of tokens) {
    const key = token.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
    if (!key || STOP.has(key)) continue;
    const hit = lookupKey(token);
    if (hit) return hit;
  }

  return { imageSrc: "/puzzle-stills/s1_sun.jpg", label: "Sun" };
}
