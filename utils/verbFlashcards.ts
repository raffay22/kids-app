/**
 * Action-verb flashcards — short 3D action clips.
 * Speech is the verb only ("Drink", "Sleep") — never phonics drills.
 */

export type VerbFlashcard = {
  id: string;
  word: string;
  /** Short looping/muted action clip */
  videoSrc: string;
  /** Poster / fallback still */
  imageSrc: string;
};

const ROOT = "/flashcards/verbs";

function card(
  word: string,
  opts?: { video?: string; image?: string },
): VerbFlashcard {
  const slug = word.toLowerCase().replace(/\s+/g, "_");
  return {
    id: `v-${slug}`,
    word,
    videoSrc: opts?.video ?? `${ROOT}/${slug}.mp4`,
    imageSrc: opts?.image ?? `${ROOT}/${slug}.jpg`,
  };
}

/**
 * 50+ toddler action verbs.
 * Media lives in public/flashcards/verbs/ (3s clips + posters).
 */
export const VERB_ACTION_CARDS: VerbFlashcard[] = [
  card("Drink"),
  card("Eat"),
  card("Sleep"),
  card("Swim"),
  card("Write"),
  card("Hold"),
  card("Run"),
  card("Jump"),
  card("Walk"),
  card("Sit"),
  card("Stand"),
  card("Clap"),
  card("Wave"),
  card("Smile"),
  card("Laugh"),
  card("Cry"),
  card("Hug"),
  card("Look"),
  card("Listen"),
  card("Read"),
  card("Draw"),
  card("Paint"),
  card("Sing"),
  card("Dance"),
  card("Play"),
  card("Throw"),
  card("Catch"),
  card("Kick"),
  card("Push"),
  card("Pull"),
  card("Open"),
  card("Close"),
  card("Wash"),
  card("Brush"),
  card("Pour"),
  card("Cook"),
  card("Clean"),
  card("Help"),
  card("Give"),
  card("Take"),
  card("Climb"),
  card("Crawl"),
  card("Hop"),
  card("Stretch"),
  card("Yawn"),
  card("Breathe"),
  card("Fly"),
  card("Splash"),
  card("Pat"),
  card("Roll"),
  card("Swing"),
  card("Reach"),
  card("Point"),
  card("Nod"),
  card("Wake"),
];

export function getVerbCardByWord(word: string): VerbFlashcard | undefined {
  const key = word.trim().toLowerCase();
  return VERB_ACTION_CARDS.find((card) => card.word.toLowerCase() === key);
}
