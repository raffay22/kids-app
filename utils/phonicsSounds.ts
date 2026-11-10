/**
 * Preschool phonics speech mapping.
 * Web Speech API says letter names ("Ay", "Bee") unless we feed it
 * explicit phonetic cue phrases instead of raw letters.
 * Produced cards use alphabet_phonics_3d_schema.json elevenlabs_script.
 */
import { getSchemaScript } from "@/utils/phonicsCatalog";

export type PhonicSound = {
  /** Display form: Aa, Bb, Cc… */
  display: string;
  /** Slow speech string for speechSynthesis */
  speakText: string;
  /** Example word used in the phrase */
  example: string;
};

const LETTER_SOUNDS: Record<string, PhonicSound> = {
  a: {
    display: "Aa",
    example: "Apple",
    speakText: "Ah... ah... A is for Apple! Look, Apple is moving its eyes!",
  },
  b: { display: "Bb", example: "Ball", speakText: "Buh... as in Ball" },
  c: { display: "Cc", example: "Cat", speakText: "Cuh... as in Cat" },
  d: { display: "Dd", example: "Dog", speakText: "Duh... as in Dog" },
  e: { display: "Ee", example: "Elephant", speakText: "Eh... as in Elephant" },
  f: { display: "Ff", example: "Fish", speakText: "Fff... as in Fish" },
  g: { display: "Gg", example: "Garden", speakText: "Guh... as in Garden" },
  h: { display: "Hh", example: "Hat", speakText: "Huh... as in Hat" },
  i: { display: "Ii", example: "Igloo", speakText: "Ih... as in Igloo" },
  j: { display: "Jj", example: "Jump", speakText: "Juh... as in Jump" },
  k: { display: "Kk", example: "Kite", speakText: "Kuh... as in Kite" },
  l: { display: "Ll", example: "Lion", speakText: "Lll... as in Lion" },
  m: { display: "Mm", example: "Moon", speakText: "Mmm... as in Moon" },
  n: { display: "Nn", example: "Nest", speakText: "Nnn... as in Nest" },
  o: { display: "Oo", example: "Octopus", speakText: "Off... as in Octopus" },
  p: { display: "Pp", example: "Pizza", speakText: "Puh... as in Pizza" },
  q: { display: "Qq", example: "Queen", speakText: "Kwuh... as in Queen" },
  r: { display: "Rr", example: "Rain", speakText: "Rrr... as in Rain" },
  s: { display: "Ss", example: "Sun", speakText: "Sss... as in Sun" },
  t: { display: "Tt", example: "Tree", speakText: "Tuh... as in Tree" },
  u: { display: "Uu", example: "Umbrella", speakText: "Uh... as in Umbrella" },
  v: { display: "Vv", example: "Van", speakText: "Vvv... as in Van" },
  w: { display: "Ww", example: "Water", speakText: "Wuh... as in Water" },
  x: { display: "Xx", example: "X-ray", speakText: "Ks... as in X-ray" },
  y: { display: "Yy", example: "Yawn", speakText: "Yuh... as in Yawn" },
  z: { display: "Zz", example: "Zebra", speakText: "Zzz... as in Zebra" },
};

const DIGRAPH_SOUNDS: Record<string, PhonicSound> = {
  sh: { display: "Sh", example: "Ship", speakText: "Shhh... as in Ship" },
  ch: { display: "Ch", example: "Chair", speakText: "Chuh... as in Chair" },
  th: { display: "Th", example: "Thumb", speakText: "Thhh... as in Thumb" },
  ph: { display: "Ph", example: "Phone", speakText: "Fff... as in Phone" },
  wh: { display: "Wh", example: "Whale", speakText: "Www... as in Whale" },
  str: { display: "Str", example: "Street", speakText: "Struh... as in Street" },
  spr: { display: "Spr", example: "Spring", speakText: "Spruh... as in Spring" },
  scr: { display: "Scr", example: "Scratch", speakText: "Scruh... as in Scratch" },
  thr: { display: "Thr", example: "Three", speakText: "Thruuh... as in Three" },
  spl: { display: "Spl", example: "Splash", speakText: "Spluh... as in Splash" },
};

/** Rate & pitch for speech-therapy phonics practice */
export const PHONICS_SPEECH_RATE = 0.75;
export const PHONICS_SPEECH_PITCH = 1.0;

/**
 * Format any blend / letter for on-screen preschool display.
 * "AA" | "A" | "aa" → "Aa"; "SH" → "Sh"; "STR" → "Str"
 */
export function formatPhonicsDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const key = trimmed.toLowerCase();
  if (DIGRAPH_SOUNDS[key]) return DIGRAPH_SOUNDS[key].display;

  // Doubled identical letters: AA, BB → Aa, Bb
  if (/^[A-Za-z]{2}$/.test(trimmed) && trimmed[0].toLowerCase() === trimmed[1].toLowerCase()) {
    const ch = trimmed[0].toUpperCase();
    return `${ch}${ch.toLowerCase()}`;
  }

  // Single letter
  if (/^[A-Za-z]$/.test(trimmed)) {
    const ch = trimmed.toUpperCase();
    return `${ch}${ch.toLowerCase()}`;
  }

  // Title-case digraphs / blends: STR → Str
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/** Look up the full phonic sound entry for a letter or blend. */
export function getPhonicSound(raw: string): PhonicSound | null {
  const key = raw.trim().toLowerCase();
  if (!key) return null;

  if (DIGRAPH_SOUNDS[key]) return DIGRAPH_SOUNDS[key];

  // AA / Aa / a → a
  const letter =
    key.length === 2 && key[0] === key[1]
      ? key[0]
      : key.length === 1
        ? key
        : null;

  if (letter && LETTER_SOUNDS[letter]) return LETTER_SOUNDS[letter];
  return null;
}

/**
 * Resolve the text Web Speech should say.
 * Schema `elevenlabs_script` always wins when the letter/word is in
 * alphabet_phonics_3d_schema.json.
 */
export function resolvePhonicsSpeakText(options: {
  letter?: string;
  blend?: string;
  speakText?: string;
  exampleWord?: string;
}): string {
  const { letter, blend, speakText, exampleWord } = options;

  const schemaLine = getSchemaScript(letter || blend, exampleWord);
  if (schemaLine) return schemaLine;

  const mapped =
    (blend && getPhonicSound(blend)) ||
    (letter && getPhonicSound(letter)) ||
    null;

  if (mapped) {
    if (speakText && /\.\.\./.test(speakText) && speakText.length > mapped.speakText.length) {
      return speakText;
    }
    return mapped.speakText;
  }

  if (speakText && speakText.trim()) return speakText;

  const display = formatPhonicsDisplay(blend || letter || "");
  const word = exampleWord || "this word";
  return `${display}... as in ${word}`;
}
