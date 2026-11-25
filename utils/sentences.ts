import { resolveSentenceMedia } from "@/utils/sentenceMedia";

export type TargetVocabulary = {
  word: string;
  meaning: string;
  icon_name: string;
};

/** Playgroup · Grade 1–2 · Pro (Grade 3–5) */
export type SentenceLevel = "basic" | "explorer" | "pro";

export type SentenceRecord = {
  id: string;
  sentence_id: string;
  category: string;
  target_age_group: string;
  level: SentenceLevel;
  target_vocabulary: TargetVocabulary;
  full_sentence: string;
  word_bank: string[];
  correct_order: string[];
  is_active: boolean;
  created_at?: string;
  lottie_url?: string | null;
  /** Matched 3D still (small) */
  imageSrc?: string | null;
  /** Optional short action clip when verb-led */
  videoSrc?: string | null;
};

export const SENTENCE_LEVEL_META: Record<
  SentenceLevel,
  { label: string; blurb: string; ages: string; requiresPro: boolean }
> = {
  basic: {
    label: "Basic",
    blurb: "Playgroup · tiny easy sentences",
    ages: "Playgroup",
    requiresPro: false,
  },
  explorer: {
    label: "Grade 1–2",
    blurb: "School routines · short daily sentences",
    ages: "Class 1–2",
    requiresPro: false,
  },
  pro: {
    label: "Pro · Grade 3–5",
    blurb: "Longer, richer sentences",
    ages: "Grade 3–5",
    requiresPro: true,
  },
};

function makeSentence(opts: {
  id: string;
  level: SentenceLevel;
  category: string;
  word: string;
  meaning: string;
  sentence: string;
  distractors?: string[];
}): SentenceRecord {
  const correct_order = opts.sentence
    .replace(/[.!?]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const distractors = opts.distractors ?? [];
  const word_bank = [...correct_order, ...distractors];
  // light shuffle copy for bank variety (deterministic-ish by id)
  const seed = opts.id.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const bank = [...word_bank].sort((a, b) => {
    const ha = (a.charCodeAt(0) + seed) % 7;
    const hb = (b.charCodeAt(0) + seed) % 7;
    return ha - hb || a.localeCompare(b);
  });
  const media = resolveSentenceMedia(opts.sentence, opts.word);
  const age =
    opts.level === "basic" ? "2-4" : opts.level === "explorer" ? "5-7" : "8-11";

  return {
    id: opts.id,
    sentence_id: opts.id,
    category: opts.category,
    target_age_group: age,
    level: opts.level,
    target_vocabulary: {
      word: opts.word,
      meaning: opts.meaning,
      icon_name: "Sparkles",
    },
    full_sentence: opts.sentence,
    word_bank: bank,
    correct_order,
    is_active: true,
    imageSrc: media.imageSrc ?? null,
    videoSrc: media.videoSrc ?? null,
  };
}

/** Basic — playgroup: very short / easy. */
const BASIC_SENTENCES: SentenceRecord[] = [
  makeSentence({
    id: "basic_01",
    level: "basic",
    category: "Actions",
    word: "Run",
    meaning: "Move fast with your legs",
    sentence: "I run",
    distractors: ["jump", "sleep"],
  }),
  makeSentence({
    id: "basic_02",
    level: "basic",
    category: "Actions",
    word: "Jump",
    meaning: "Go up and down",
    sentence: "I jump",
    distractors: ["run", "sit"],
  }),
  makeSentence({
    id: "basic_03",
    level: "basic",
    category: "Night",
    word: "Sleep",
    meaning: "Rest with eyes closed",
    sentence: "She sleeps at night",
    distractors: ["runs", "day"],
  }),
  makeSentence({
    id: "basic_04",
    level: "basic",
    category: "Food",
    word: "Eat",
    meaning: "Put food in your mouth",
    sentence: "He eats an apple",
    distractors: ["drinks", "ball"],
  }),
  makeSentence({
    id: "basic_05",
    level: "basic",
    category: "Food",
    word: "Drink",
    meaning: "Take a sip",
    sentence: "I drink milk",
    distractors: ["eat", "run"],
  }),
  makeSentence({
    id: "basic_06",
    level: "basic",
    category: "Animals",
    word: "Dog",
    meaning: "A friendly pet",
    sentence: "The dog runs",
    distractors: ["cat", "sleeps"],
  }),
  makeSentence({
    id: "basic_07",
    level: "basic",
    category: "Animals",
    word: "Cat",
    meaning: "A soft pet",
    sentence: "The cat sleeps",
    distractors: ["dog", "jumps"],
  }),
  makeSentence({
    id: "basic_08",
    level: "basic",
    category: "Sky",
    word: "Sun",
    meaning: "Bright light in the day",
    sentence: "I see the sun",
    distractors: ["moon", "eat"],
  }),
  makeSentence({
    id: "basic_09",
    level: "basic",
    category: "Sky",
    word: "Moon",
    meaning: "Light in the night sky",
    sentence: "I see the moon",
    distractors: ["sun", "run"],
  }),
  makeSentence({
    id: "basic_10",
    level: "basic",
    category: "Play",
    word: "Ball",
    meaning: "A round toy",
    sentence: "I play with a ball",
    distractors: ["book", "sleep"],
  }),
  makeSentence({
    id: "basic_11",
    level: "basic",
    category: "Actions",
    word: "Walk",
    meaning: "Move with steps",
    sentence: "I walk to school",
    distractors: ["fly", "home"],
  }),
  makeSentence({
    id: "basic_12",
    level: "basic",
    category: "Actions",
    word: "Sit",
    meaning: "Rest on a chair",
    sentence: "I sit on a chair",
    distractors: ["stand", "run"],
  }),
  makeSentence({
    id: "basic_13",
    level: "basic",
    category: "Actions",
    word: "Wave",
    meaning: "Say hello with your hand",
    sentence: "I wave hello",
    distractors: ["sleep", "eat"],
  }),
  makeSentence({
    id: "basic_14",
    level: "basic",
    category: "Actions",
    word: "Clap",
    meaning: "Hit hands together",
    sentence: "I clap my hands",
    distractors: ["kick", "feet"],
  }),
  makeSentence({
    id: "basic_15",
    level: "basic",
    category: "Water",
    word: "Swim",
    meaning: "Move in water",
    sentence: "The fish swims",
    distractors: ["flies", "dog"],
  }),
  makeSentence({
    id: "basic_16",
    level: "basic",
    category: "Nature",
    word: "Tree",
    meaning: "A tall plant",
    sentence: "I see a big tree",
    distractors: ["car", "eat"],
  }),
];

/** Grade 1–2 — current daily-routine style (local, with matched media). */
const EXPLORER_SENTENCES: SentenceRecord[] = [
  makeSentence({
    id: "explorer_01",
    level: "explorer",
    category: "School",
    word: "Homework",
    meaning: "School work from your teacher",
    sentence: "My teacher gave me homework today",
    distractors: ["tomorrow", "play"],
  }),
  makeSentence({
    id: "explorer_02",
    level: "explorer",
    category: "Friends",
    word: "House",
    meaning: "A place where people live",
    sentence: "I am going to my friend's house",
    distractors: ["school", "park"],
  }),
  makeSentence({
    id: "explorer_03",
    level: "explorer",
    category: "Morning",
    word: "Morning",
    meaning: "When the sun comes up",
    sentence: "I wake up early in the morning",
    distractors: ["night", "late"],
  }),
  makeSentence({
    id: "explorer_04",
    level: "explorer",
    category: "Food",
    word: "Breakfast",
    meaning: "Morning meal",
    sentence: "I eat breakfast every morning",
    distractors: ["dinner", "ball"],
  }),
  makeSentence({
    id: "explorer_05",
    level: "explorer",
    category: "Hygiene",
    word: "Brush",
    meaning: "Clean your teeth",
    sentence: "I brush my teeth every night",
    distractors: ["wash", "toys"],
  }),
  makeSentence({
    id: "explorer_06",
    level: "explorer",
    category: "Hygiene",
    word: "Wash",
    meaning: "Clean with water",
    sentence: "I wash my hands before lunch",
    distractors: ["brush", "feet"],
  }),
  makeSentence({
    id: "explorer_07",
    level: "explorer",
    category: "Play",
    word: "Park",
    meaning: "A place to play outside",
    sentence: "We play ball at the park",
    distractors: ["sleep", "kitchen"],
  }),
  makeSentence({
    id: "explorer_08",
    level: "explorer",
    category: "Reading",
    word: "Read",
    meaning: "Look at words in a book",
    sentence: "I read a book after school",
    distractors: ["write", "run"],
  }),
  makeSentence({
    id: "explorer_09",
    level: "explorer",
    category: "Weather",
    word: "Umbrella",
    meaning: "Keeps you dry in the rain",
    sentence: "I take my umbrella in the rain",
    distractors: ["ball", "sun"],
  }),
  makeSentence({
    id: "explorer_10",
    level: "explorer",
    category: "Pets",
    word: "Dog",
    meaning: "A friendly pet",
    sentence: "My dog likes to run and jump",
    distractors: ["cat", "sleep"],
  }),
  makeSentence({
    id: "explorer_11",
    level: "explorer",
    category: "Travel",
    word: "Bus",
    meaning: "A big vehicle for many people",
    sentence: "I ride the bus to school",
    distractors: ["car", "home"],
  }),
  makeSentence({
    id: "explorer_12",
    level: "explorer",
    category: "Kindness",
    word: "Help",
    meaning: "Do something nice for someone",
    sentence: "I help my friend at school",
    distractors: ["push", "park"],
  }),
  makeSentence({
    id: "explorer_13",
    level: "explorer",
    category: "Evening",
    word: "Sleep",
    meaning: "Rest at night",
    sentence: "I sleep in my soft bed",
    distractors: ["run", "kitchen"],
  }),
  makeSentence({
    id: "explorer_14",
    level: "explorer",
    category: "Food",
    word: "Milk",
    meaning: "A healthy white drink",
    sentence: "She drinks milk with her apple",
    distractors: ["juice", "car"],
  }),
  makeSentence({
    id: "explorer_15",
    level: "explorer",
    category: "Actions",
    word: "Write",
    meaning: "Make words with a pencil",
    sentence: "I write my name on paper",
    distractors: ["draw", "jump"],
  }),
];

/** Pro — Grade 3–5 longer sentences. */
const PRO_SENTENCES: SentenceRecord[] = [
  makeSentence({
    id: "pro_01",
    level: "pro",
    category: "School",
    word: "Homework",
    meaning: "Tasks you finish after school",
    sentence: "After school I finish my homework before I play outside",
    distractors: ["never", "cookies"],
  }),
  makeSentence({
    id: "pro_02",
    level: "pro",
    category: "Morning",
    word: "Breakfast",
    meaning: "The first meal of the day",
    sentence: "Every morning I wash my hands and eat a healthy breakfast",
    distractors: ["skip", "night"],
  }),
  makeSentence({
    id: "pro_03",
    level: "pro",
    category: "Friendship",
    word: "Help",
    meaning: "Do something kind for a friend",
    sentence: "Kind friends share toys and help each other at the park",
    distractors: ["hide", "break"],
  }),
  makeSentence({
    id: "pro_04",
    level: "pro",
    category: "Reading",
    word: "Library",
    meaning: "A quiet place full of books",
    sentence: "We walk to the library and read a new book together",
    distractors: ["shout", "kitchen"],
  }),
  makeSentence({
    id: "pro_05",
    level: "pro",
    category: "Nature",
    word: "Garden",
    meaning: "A place where plants grow",
    sentence: "In the garden I water the flowers and watch the bees",
    distractors: ["cars", "sleep"],
  }),
  makeSentence({
    id: "pro_06",
    level: "pro",
    category: "Weather",
    word: "Umbrella",
    meaning: "Protection from rain",
    sentence: "When it rains I open my umbrella and walk carefully home",
    distractors: ["swim", "dance"],
  }),
  makeSentence({
    id: "pro_07",
    level: "pro",
    category: "Health",
    word: "Exercise",
    meaning: "Moving your body to stay strong",
    sentence: "After dinner we stretch stretch and jump to stay healthy",
    distractors: ["never", "sugar"],
  }),
  makeSentence({
    id: "pro_08",
    level: "pro",
    category: "Animals",
    word: "Dolphin",
    meaning: "A smart sea animal",
    sentence: "The dolphin swims under the bright blue waves near the ship",
    distractors: ["flies", "forest"],
  }),
  makeSentence({
    id: "pro_09",
    level: "pro",
    category: "Creativity",
    word: "Paint",
    meaning: "Make a colorful picture",
    sentence: "She paints a rainbow tree while her brother draws a rocket",
    distractors: ["eats", "hides"],
  }),
  makeSentence({
    id: "pro_10",
    level: "pro",
    category: "Responsibility",
    word: "Clean",
    meaning: "Make things tidy",
    sentence: "Before bedtime I clean my room and brush my teeth",
    distractors: ["mess", "skip"],
  }),
  makeSentence({
    id: "pro_11",
    level: "pro",
    category: "Travel",
    word: "Train",
    meaning: "A long vehicle on tracks",
    sentence: "Our family rides the train to the city and looks out the window",
    distractors: ["swims", "hides"],
  }),
  makeSentence({
    id: "pro_12",
    level: "pro",
    category: "Kindness",
    word: "Help",
    meaning: "Support someone",
    sentence: "I help my little sister climb the steps and hold her hand",
    distractors: ["push", "leave"],
  }),
];

// Fix accidental duplicate word in pro_07
PRO_SENTENCES[6] = makeSentence({
  id: "pro_07",
  level: "pro",
  category: "Health",
  word: "Jump",
  meaning: "Move up and down to stay strong",
  sentence: "After dinner we stretch and jump to stay healthy",
  distractors: ["never", "sugar"],
});

export const LOCAL_SENTENCE_DECK: SentenceRecord[] = [
  ...BASIC_SENTENCES,
  ...EXPLORER_SENTENCES,
  ...PRO_SENTENCES,
];

/** @deprecated Prefer LOCAL_SENTENCE_DECK by level */
export const FALLBACK_SENTENCES = EXPLORER_SENTENCES;

export function getSentencesByLevel(level: SentenceLevel): SentenceRecord[] {
  return LOCAL_SENTENCE_DECK.filter((s) => s.level === level && s.is_active);
}

export function buildWordPills(wordBank: string[]): { id: string; word: string }[] {
  const counts = new Map<string, number>();
  return wordBank.map((word) => {
    const n = counts.get(word) ?? 0;
    counts.set(word, n + 1);
    return { id: `${word}-${n}`, word };
  });
}

export function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

/** Normalize JSONB / string fields that may arrive as strings from Supabase. */
export function normalizeSentence(raw: SentenceRecord): SentenceRecord {
  const parseList = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return value.split(/\s+/).filter(Boolean);
      }
    }
    return [];
  };

  let vocab = raw.target_vocabulary;
  if (typeof vocab === "string") {
    try {
      vocab = JSON.parse(vocab) as TargetVocabulary;
    } catch {
      vocab = { word: String(vocab), meaning: "", icon_name: "Sparkles" };
    }
  }

  const full = raw.full_sentence;
  const media =
    raw.imageSrc || raw.videoSrc
      ? { imageSrc: raw.imageSrc, videoSrc: raw.videoSrc }
      : resolveSentenceMedia(full, vocab?.word);

  let level: SentenceLevel = raw.level ?? "explorer";
  if (!raw.level) {
    if (raw.target_age_group === "2-4" || raw.target_age_group === "playgroup") {
      level = "basic";
    } else if (
      raw.target_age_group === "8-11" ||
      raw.target_age_group === "7-10" ||
      raw.target_age_group === "pro"
    ) {
      level = "pro";
    }
  }

  return {
    ...raw,
    level,
    target_vocabulary: vocab,
    word_bank: parseList(raw.word_bank),
    correct_order: parseList(raw.correct_order),
    imageSrc: media.imageSrc ?? null,
    videoSrc: media.videoSrc ?? null,
  };
}
