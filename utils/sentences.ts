export type TargetVocabulary = {
  word: string;
  meaning: string;
  icon_name: string;
};

export type SentenceRecord = {
  id: string;
  sentence_id: string;
  category: string;
  target_age_group: string;
  target_vocabulary: TargetVocabulary;
  full_sentence: string;
  word_bank: string[];
  correct_order: string[];
  is_active: boolean;
  created_at?: string;
  lottie_url?: string | null;
};

export const FALLBACK_SENTENCES: SentenceRecord[] = [
  {
    id: "fb-1",
    sentence_id: "sent_routine_001",
    category: "School & Homework",
    target_age_group: "3-6",
    target_vocabulary: {
      word: "Homework",
      meaning: "School work from your teacher",
      icon_name: "BookOpen",
    },
    full_sentence: "My teacher gave me homework today",
    word_bank: ["My", "teacher", "gave", "me", "homework", "today", "tomorrow", "play"],
    correct_order: ["My", "teacher", "gave", "me", "homework", "today"],
    is_active: true,
  },
  {
    id: "fb-2",
    sentence_id: "sent_routine_003",
    category: "Morning Routine",
    target_age_group: "3-6",
    target_vocabulary: {
      word: "Morning",
      meaning: "When the sun comes up",
      icon_name: "Sun",
    },
    full_sentence: "I wake up promptly in the morning",
    word_bank: ["I", "wake", "up", "promptly", "in", "the", "morning", "night"],
    correct_order: ["I", "wake", "up", "promptly", "in", "the", "morning"],
    is_active: true,
  },
  {
    id: "fb-3",
    sentence_id: "sent_routine_005",
    category: "Mealtime & Food",
    target_age_group: "3-6",
    target_vocabulary: {
      word: "Breakfast",
      meaning: "Morning meal",
      icon_name: "Apple",
    },
    full_sentence: "Breakfast was scrumptious this morning",
    word_bank: ["Breakfast", "was", "scrumptious", "this", "morning", "evening", "cold"],
    correct_order: ["Breakfast", "was", "scrumptious", "this", "morning"],
    is_active: true,
  },
];

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

  return {
    ...raw,
    target_vocabulary: vocab,
    word_bank: parseList(raw.word_bank),
    correct_order: parseList(raw.correct_order),
  };
}
