import { pronounsPublicUrl, PRONOUNS_CDN_BASE_URL } from "@/utils/supabaseMedia";

export { PRONOUNS_CDN_BASE_URL, pronounsPublicUrl };

export type FlashcardDifficultyLevel = "basic" | "advanced" | "pro";

export type PronounFlashcard = {
  id: string;
  /** Pronoun answer ("I", "You", "He vs She", etc.). */
  word: string;
  /** Difficulty tier: Level 1: Basic, Level 2: Advanced, Level 3: Pro. */
  level: FlashcardDifficultyLevel;
  /** Fill-in-the-blank quiz prompt shown on the card. */
  clue: string;
  /** Full example sentence spoken aloud on "Hear it". */
  sentence: string;
  /** Cloud storage CDN WebP image URL from the `pronouns` bucket. */
  imageSrc: string;
};

export const PRONOUN_CARDS: PronounFlashcard[] = [
  // ============================================================================
  // LEVEL 1: BASIC (10 cards)
  // ============================================================================
  {
    id: "p-i",
    word: "I",
    level: "basic",
    clue: "___ am happy!",
    sentence: "I am happy!",
    imageSrc: pronounsPublicUrl("I-pronoune.webp"),
  },
  {
    id: "p-you",
    word: "You",
    level: "basic",
    clue: "___ are my friend!",
    sentence: "You are my friend!",
    imageSrc: pronounsPublicUrl("You-pronoun.webp"),
  },
  {
    id: "p-he",
    word: "He",
    level: "basic",
    clue: "___ is a smiling boy.",
    sentence: "He is a smiling boy.",
    imageSrc: pronounsPublicUrl("He-pronoun.webp"),
  },
  {
    id: "p-she",
    word: "She",
    level: "basic",
    clue: "___ is a happy girl.",
    sentence: "She is a happy girl.",
    imageSrc: pronounsPublicUrl("she-pronoun.webp"),
  },
  {
    id: "p-it",
    word: "It",
    level: "basic",
    clue: "___ is a cute puppy.",
    sentence: "It is a cute puppy.",
    imageSrc: pronounsPublicUrl("It-pronoun.webp"),
  },
  {
    id: "p-we",
    word: "We",
    level: "basic",
    clue: "___ play together!",
    sentence: "We play together!",
    imageSrc: pronounsPublicUrl("we-pronoun.webp"),
  },
  {
    id: "p-they",
    word: "They",
    level: "basic",
    clue: "___ are having fun!",
    sentence: "They are having fun!",
    imageSrc: pronounsPublicUrl("they-pronoun.webp"),
  },
  {
    id: "p-me",
    word: "Me",
    level: "basic",
    clue: "Pass the ball to ___!",
    sentence: "Pass the ball to me!",
    imageSrc: pronounsPublicUrl("me-pronoun.webp"),
  },
  {
    id: "p-us",
    word: "Us",
    level: "basic",
    clue: "Come play with ___!",
    sentence: "Come play with us!",
    imageSrc: pronounsPublicUrl("us-pronoun.webp"),
  },
  {
    id: "p-them",
    word: "Them",
    level: "basic",
    clue: "Let us wave hello to ___!",
    sentence: "Let us wave hello to them!",
    imageSrc: pronounsPublicUrl("theme-pronoun.webp"),
  },

  // ============================================================================
  // LEVEL 2: ADVANCED (10 cards)
  // ============================================================================
  {
    id: "p-mine",
    word: "Mine",
    level: "advanced",
    clue: "This toy is ___!",
    sentence: "This toy is mine!",
    imageSrc: pronounsPublicUrl("mine-pronoun.webp"),
  },
  {
    id: "p-yours",
    word: "Yours",
    level: "advanced",
    clue: "That bright backpack is ___!",
    sentence: "That bright backpack is yours!",
    imageSrc: pronounsPublicUrl("yours-pronoun.webp"),
  },
  {
    id: "p-his",
    word: "His",
    level: "advanced",
    clue: "That blue ball is ___.",
    sentence: "That blue ball is his.",
    imageSrc: pronounsPublicUrl("his-pronun.webp"),
  },
  {
    id: "p-hers",
    word: "Hers",
    level: "advanced",
    clue: "That pretty teddy bear is ___.",
    sentence: "That pretty teddy bear is hers.",
    imageSrc: pronounsPublicUrl("hers-pronoun.webp"),
  },
  {
    id: "p-ours",
    word: "Ours",
    level: "advanced",
    clue: "This big playground is ___!",
    sentence: "This big playground is ours!",
    imageSrc: pronounsPublicUrl("ours-pronoun.webp"),
  },
  {
    id: "p-theirs",
    word: "Theirs",
    level: "advanced",
    clue: "That colorful puzzle is ___!",
    sentence: "That colorful puzzle is theirs!",
    imageSrc: pronounsPublicUrl("theres-pronoun.webp"),
  },
  {
    id: "p-myself",
    word: "Myself",
    level: "advanced",
    clue: "I can do it all by ___!",
    sentence: "I can do it all by myself!",
    imageSrc: pronounsPublicUrl("myself-pronoun.webp"),
  },
  {
    id: "p-yourself",
    word: "Yourself",
    level: "advanced",
    clue: "You did a great job all by ___!",
    sentence: "You did a great job all by yourself!",
    imageSrc: pronounsPublicUrl("ypurself-pronoun.webp"),
  },
  {
    id: "p-this",
    word: "This",
    level: "advanced",
    clue: "___ apple is right here!",
    sentence: "This apple is right here!",
    imageSrc: pronounsPublicUrl("this-pronoun.webp"),
  },
  {
    id: "p-that",
    word: "That",
    level: "advanced",
    clue: "___ tree is over there!",
    sentence: "That tree is over there!",
    imageSrc: pronounsPublicUrl("that-pronoun.webp"),
  },

  // ============================================================================
  // LEVEL 3: PRO (10 cards)
  // ============================================================================
  {
    id: "p-he-vs-she",
    word: "He vs She",
    level: "pro",
    clue: "Which pair compares a boy and a girl?",
    sentence: "He is a boy, and she is a girl.",
    imageSrc: pronounsPublicUrl("HE-SHE-Pronoun.webp"),
  },
  {
    id: "p-these-vs-those",
    word: "These vs Those",
    level: "pro",
    clue: "Which pair compares things near and far?",
    sentence: "These are near, and those are far away.",
    imageSrc: pronounsPublicUrl("these-and-those-pronoun.webp"),
  },
  {
    id: "p-mine-vs-theirs",
    word: "Mine vs Theirs",
    level: "pro",
    clue: "Which pair compares what belongs to me and to them?",
    sentence: "This one is mine, and that one is theirs.",
    imageSrc: pronounsPublicUrl("mine-pronoun.webp"),
  },
  {
    id: "p-themselves",
    word: "Themselves",
    level: "pro",
    clue: "They built the tower all by ___!",
    sentence: "They built the tower all by themselves!",
    imageSrc: pronounsPublicUrl("themselves-pronone.webp"),
  },
  {
    id: "p-who",
    word: "Who",
    level: "pro",
    clue: "___ is at the door?",
    sentence: "Who is at the door?",
    imageSrc: pronounsPublicUrl("who-pronoun.webp"),
  },
  {
    id: "p-what-vs-which",
    word: "What vs Which",
    level: "pro",
    clue: "Which pair asks about a thing and a choice?",
    sentence: "What is in the box, and which one do you choose?",
    imageSrc: pronounsPublicUrl("which-and-what-pronoun.webp"),
  },
  {
    id: "p-everyone-vs-no-one",
    word: "Everyone vs No One",
    level: "pro",
    clue: "Which pair compares all people and zero people?",
    sentence: "Everyone is here, or no one is here.",
    imageSrc: pronounsPublicUrl("everyone-onone-pronoun.webp"),
  },
  {
    id: "p-each-other",
    word: "Each Other",
    level: "pro",
    clue: "Good friends help ___!",
    sentence: "Good friends help each other!",
    imageSrc: pronounsPublicUrl("eachother-pronoun.webp"),
  },
  {
    id: "p-himself",
    word: "Himself",
    level: "pro",
    clue: "He tied his shoes all by ___!",
    sentence: "He tied his shoes all by himself!",
    imageSrc: pronounsPublicUrl("himself-pronoun.webp"),
  },
  {
    id: "p-each",
    word: "Each",
    level: "pro",
    clue: "___ kid gets a shiny star!",
    sentence: "Each kid gets a shiny star!",
    imageSrc: pronounsPublicUrl("each-pronoun.webp"),
  },
];

export function getPronounCardByWord(word: string): PronounFlashcard | undefined {
  const key = word.trim().toLowerCase();
  return PRONOUN_CARDS.find((card) => card.word.toLowerCase() === key);
}
