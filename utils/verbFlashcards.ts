/**
 * Action-verb flashcards — short 3D action clips.
 * Display + quiz answers use continuous form (Running).
 * Speech uses a full present-continuous sentence that matches the clip.
 * Media resolves to the Supabase `verbs` bucket (CDN).
 */

import { verbsPublicUrl } from "@/utils/supabaseMedia";

export type VerbFlashcard = {
  id: string;
  /** Continuous form shown on the card and in answer choices ("Running"). */
  word: string;
  /** Base infinitive used for media filenames ("Run"). */
  baseWord: string;
  /** Full sentence spoken aloud ("The boy is running."). */
  sentence: string;
  /** Short looping/muted action clip */
  videoSrc: string;
  /** Poster / fallback still */
  imageSrc: string;
};

function toIng(base: string): string {
  const w = base.toLowerCase();
  // Common CVC doubling (run→running, hop→hopping, sit→sitting…)
  if (/[aeiou][bdfglmnprst]$/.test(w) && !/[aeiou][aeiou]/.test(w.slice(-3))) {
    if (!/(ear|eat|ook|eep|ash|ush|ush|elp|ive|ake|ose|ite)$/.test(w)) {
      const doubles = new Set([
        "run",
        "sit",
        "swim",
        "hop",
        "hug",
        "clap",
        "nod",
        "pat",
        "stop",
        "get",
        "put",
        "cut",
        "hit",
        "shop",
      ]);
      if (doubles.has(w)) return `${w}${w.slice(-1)}ing`;
    }
  }
  if (w.endsWith("ie")) return `${w.slice(0, -2)}ying`;
  if (w.endsWith("e") && !w.endsWith("ee") && !w.endsWith("oe")) {
    return `${w.slice(0, -1)}ing`;
  }
  return `${w}ing`;
}

function titleCaseIng(base: string): string {
  const ing = toIng(base);
  return ing.charAt(0).toUpperCase() + ing.slice(1);
}

function card(
  baseWord: string,
  sentence: string,
  opts?: { video?: string; image?: string; word?: string },
): VerbFlashcard {
  const slug = baseWord.toLowerCase().replace(/\s+/g, "_");
  const word = opts?.word ?? titleCaseIng(baseWord);
  return {
    id: `v-${slug}`,
    word,
    baseWord,
    sentence,
    videoSrc: opts?.video ?? verbsPublicUrl(`${slug}.mp4`),
    imageSrc: opts?.image ?? verbsPublicUrl(`${slug}.jpg`),
  };
}

/**
 * 50+ toddler action verbs in continuous form.
 * Local source: public/flashcards/verbs/ · runtime: Supabase `verbs` bucket.
 */
export const VERB_ACTION_CARDS: VerbFlashcard[] = [
  card("Drink", "The boy is drinking water."),
  card("Eat", "Penny is eating bamboo."),
  card("Sleep", "The bear is sleeping."),
  card("Swim", "The dolphin is swimming."),
  card("Write", "The boy is writing."),
  card("Hold", "The child is holding a toy."),
  card("Run", "The boy is running."),
  card("Jump", "The child is jumping."),
  card("Walk", "The girl is walking."),
  card("Sit", "The boy is sitting."),
  card("Stand", "The girl is standing."),
  card("Clap", "The child is clapping."),
  card("Wave", "The girl is waving."),
  card("Smile", "The boy is smiling."),
  card("Laugh", "The child is laughing."),
  card("Cry", "The baby is crying."),
  card("Hug", "The child is hugging a friend."),
  card("Look", "The boy is looking."),
  card("Listen", "The girl is listening."),
  card("Read", "The boy is reading a book."),
  card("Draw", "The child is drawing."),
  card("Paint", "The boy is painting."),
  card("Sing", "The girl is singing."),
  card("Dance", "The child is dancing."),
  card("Play", "The children are playing."),
  card("Throw", "The boy is throwing the ball."),
  card("Catch", "The boy is catching the ball."),
  card("Kick", "The boy is kicking the ball."),
  card("Push", "The child is pushing."),
  card("Pull", "Benny is pulling the carrot."),
  card("Open", "The child is opening the door."),
  card("Close", "The child is closing the box."),
  card("Wash", "The boy is washing his hands."),
  card("Brush", "The girl is brushing her hair."),
  card("Pour", "The child is pouring water."),
  card("Cook", "The cook is cooking food."),
  card("Clean", "The child is cleaning."),
  card("Help", "The child is helping."),
  card("Give", "The boy is giving a gift."),
  card("Take", "The girl is taking the toy."),
  card("Climb", "The child is climbing."),
  card("Crawl", "The baby is crawling."),
  card("Hop", "The frog is hopping."),
  card("Stretch", "Leo is stretching."),
  card("Yawn", "The child is yawning."),
  card("Breathe", "The bear is breathing softly."),
  card("Fly", "The aeroplane is flying."),
  card("Splash", "The child is splashing in the water."),
  card("Pat", "The child is patting soft wool."),
  card("Roll", "The child is rolling."),
  card("Swing", "The child is swinging."),
  card("Reach", "The child is reaching up."),
  card("Point", "The boy is pointing."),
  card("Nod", "The girl is nodding."),
  card("Wake", "The bear is waking up."),
];

export function getVerbCardByWord(word: string): VerbFlashcard | undefined {
  const key = word.trim().toLowerCase();
  if (!key) return undefined;
  return VERB_ACTION_CARDS.find((verb) => {
    return (
      verb.word.toLowerCase() === key ||
      verb.baseWord.toLowerCase() === key ||
      verb.sentence.toLowerCase() === key ||
      toIng(verb.baseWord) === key
    );
  });
}

export function getVerbSentence(word: string): string | undefined {
  return getVerbCardByWord(word)?.sentence;
}
