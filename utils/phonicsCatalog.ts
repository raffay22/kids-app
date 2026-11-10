import schema from "@/alphabet_phonics_3d_schema.json";
import { PHONICS_CARD_DURATION_S } from "@/utils/phonicsDuration";
import type { PhonicsBlend } from "@/utils/phonics";

export { PHONICS_CARD_DURATION_S };

export type PhonicsVariation = {
  id: string;
  word: string;
  action_3d_animation: string;
  file_name: string;
  file_size_guidelines: string;
  elevenlabs_script: string;
  duration_seconds?: number;
};

export type LetterPhonics = {
  phonics_sound: string;
  variations: PhonicsVariation[];
};

export type PhonicsCardMedia = {
  letter: string;
  variantCode: string;
  variation: PhonicsVariation;
  phonicsSound: string;
  /** Local PWA path after a card is produced. */
  localVideoSrc: string | null;
  localAudioSrc: string | null;
};

const LETTER_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const RAW_SCHEMA = schema as Record<string, LetterPhonics | undefined>;

/** A–Z only. Never include `_rules` or other JSON helper keys. */
const LETTERS: Record<string, LetterPhonics> = Object.fromEntries(
  LETTER_KEYS.flatMap((key) => {
    const value = RAW_SCHEMA[key];
    return value?.variations ? [[key, value] as const] : [];
  }),
);

/** Cards we have actually rendered. Never point at missing files. */
const PRODUCED_VIDEO: Record<string, string> = {
  a1_apple: "/phonics/A/a1_apple.mp4",
  a2_aeroplane: "/phonics/A/a2_aeroplane.mp4",
  a3_ant: "/phonics/A/a3_ant.mp4",
  a4_alligator: "/phonics/A/a4_alligator.mp4",
  a5_astronaut: "/phonics/A/a5_astronaut.mp4",
  b1_ball: "/phonics/B/b1_ball.mp4",
  b2_bus: "/phonics/B/b2_bus.mp4",
  b3_bear: "/phonics/B/b3_bear.mp4",
  b4_butterfly: "/phonics/B/b4_butterfly.mp4",
  b5_banana: "/phonics/B/b5_banana.mp4",
  c1_cat: "/phonics/C/c1_cat.mp4",
  c2_car: "/phonics/C/c2_car.mp4",
  c3_cupcake: "/phonics/C/c3_cupcake.mp4",
  c4_cow: "/phonics/C/c4_cow.mp4",
  c5_clock: "/phonics/C/c5_clock.mp4",
  d1_dog: "/phonics/D/d1_dog.mp4",
  d2_duck: "/phonics/D/d2_duck.mp4",
  d3_drum: "/phonics/D/d3_drum.mp4",
  d4_dolphin: "/phonics/D/d4_dolphin.mp4",
  d5_dinosaur: "/phonics/D/d5_dinosaur.mp4",
  e1_elephant: "/phonics/E/e1_elephant.mp4",
  e2_egg: "/phonics/E/e2_egg.mp4",
  e3_eagle: "/phonics/E/e3_eagle.mp4",
  e4_engine: "/phonics/E/e4_engine.mp4",
  e5_earth: "/phonics/E/e5_earth.mp4",
  f1_fish: "/phonics/F/f1_fish.mp4",
  f2_frog: "/phonics/F/f2_frog.mp4",
  f3_flower: "/phonics/F/f3_flower.mp4",
  f4_fox: "/phonics/F/f4_fox.mp4",
  f5_fireengine: "/phonics/F/f5_fireengine.mp4",
  g1_giraffe: "/phonics/G/g1_giraffe.mp4",
  g2_guitar: "/phonics/G/g2_guitar.mp4",
  g3_grapes: "/phonics/G/g3_grapes.mp4",
  g4_gift: "/phonics/G/g4_gift.mp4",
  g5_gorilla: "/phonics/G/g5_gorilla.mp4",
  h1_horse: "/phonics/H/h1_horse.mp4",
  h2_hat: "/phonics/H/h2_hat.mp4",
  h3_house: "/phonics/H/h3_house.mp4",
  h4_helicopter: "/phonics/H/h4_helicopter.mp4",
  h5_hippo: "/phonics/H/h5_hippo.mp4",
  i1_icecream: "/phonics/I/i1_icecream.mp4",
  i2_igloo: "/phonics/I/i2_igloo.mp4",
  i3_iguana: "/phonics/I/i3_iguana.mp4",
  i4_island: "/phonics/I/i4_island.mp4",
  i5_ink: "/phonics/I/i5_ink.mp4",
  j1_juice: "/phonics/J/j1_juice.mp4",
  j2_jellyfish: "/phonics/J/j2_jellyfish.mp4",
  j3_jet: "/phonics/J/j3_jet.mp4",
  j4_jaguar: "/phonics/J/j4_jaguar.mp4",
  j5_jug: "/phonics/J/j5_jug.mp4",
  k1_kite: "/phonics/K/k1_kite.mp4",
  k2_kangaroo: "/phonics/K/k2_kangaroo.mp4",
  k3_koala: "/phonics/K/k3_koala.mp4",
  k4_king: "/phonics/K/k4_king.mp4",
  k5_key: "/phonics/K/k5_key.mp4",
  l1_lion: "/phonics/L/l1_lion.mp4",
  l2_lamp: "/phonics/L/l2_lamp.mp4",
  l3_lemon: "/phonics/L/l3_lemon.mp4",
  l4_leaf: "/phonics/L/l4_leaf.mp4",
  l5_lollipop: "/phonics/L/l5_lollipop.mp4",
  m1_monkey: "/phonics/M/m1_monkey.mp4",
  m2_moon: "/phonics/M/m2_moon.mp4",
  m3_mango: "/phonics/M/m3_mango.mp4",
  m4_milk: "/phonics/M/m4_milk.mp4",
  m5_mouse: "/phonics/M/m5_mouse.mp4",
  n1_nest: "/phonics/N/n1_nest.mp4",
  n2_net: "/phonics/N/n2_net.mp4",
  n3_nut: "/phonics/N/n3_nut.mp4",
  n4_night: "/phonics/N/n4_night.mp4",
  n5_needle: "/phonics/N/n5_needle.mp4",
  o1_owl: "/phonics/O/o1_owl.mp4",
  o2_orange: "/phonics/O/o2_orange.mp4",
  o3_octopus: "/phonics/O/o3_octopus.mp4",
  o4_ostrich: "/phonics/O/o4_ostrich.mp4",
  o5_onion: "/phonics/O/o5_onion.mp4",
  p1_panda: "/phonics/P/p1_panda.mp4",
  p2_penguin: "/phonics/P/p2_penguin.mp4",
  p3_parrot: "/phonics/P/p3_parrot.mp4",
  p4_pencil: "/phonics/P/p4_pencil.mp4",
  p5_pizza: "/phonics/P/p5_pizza.mp4",
  q1_queen: "/phonics/Q/q1_queen.mp4",
  q2_quail: "/phonics/Q/q2_quail.mp4",
  q3_quilt: "/phonics/Q/q3_quilt.mp4",
  q4_question: "/phonics/Q/q4_question.mp4",
  q5_quarter: "/phonics/Q/q5_quarter.mp4",
  r1_rabbit: "/phonics/R/r1_rabbit.mp4",
  r2_rocket: "/phonics/R/r2_rocket.mp4",
  r3_rainbow: "/phonics/R/r3_rainbow.mp4",
  r4_ring: "/phonics/R/r4_ring.mp4",
  r5_robot: "/phonics/R/r5_robot.mp4",
  s1_sun: "/phonics/S/s1_sun.mp4",
  s2_star: "/phonics/S/s2_star.mp4",
  s3_ship: "/phonics/S/s3_ship.mp4",
  s4_snake: "/phonics/S/s4_snake.mp4",
  s5_strawberry: "/phonics/S/s5_strawberry.mp4",
  t1_tiger: "/phonics/T/t1_tiger.mp4",
  t2_train: "/phonics/T/t2_train.mp4",
  t3_turtle: "/phonics/T/t3_turtle.mp4",
  t4_tree: "/phonics/T/t4_tree.mp4",
  t5_telephone: "/phonics/T/t5_telephone.mp4",
  u1_umbrella: "/phonics/U/u1_umbrella.mp4",
  u2_unicorn: "/phonics/U/u2_unicorn.mp4",
  u3_uniform: "/phonics/U/u3_uniform.mp4",
  u4_urn: "/phonics/U/u4_urn.mp4",
  u5_underwater: "/phonics/U/u5_underwater.mp4",
  v1_van: "/phonics/V/v1_van.mp4",
  v2_violin: "/phonics/V/v2_violin.mp4",
  v3_vase: "/phonics/V/v3_vase.mp4",
  v4_volcano: "/phonics/V/v4_volcano.mp4",
  v5_vegetables: "/phonics/V/v5_vegetables.mp4",
  w1_whale: "/phonics/W/w1_whale.mp4",
  w2_watermelon: "/phonics/W/w2_watermelon.mp4",
  w3_watch: "/phonics/W/w3_watch.mp4",
  w4_windmill: "/phonics/W/w4_windmill.mp4",
  w5_wolf: "/phonics/W/w5_wolf.mp4",
  x1_xylophone: "/phonics/X/x1_xylophone.mp4",
  x2_xray: "/phonics/X/x2_xray.mp4",
  x3_xmas_tree: "/phonics/X/x3_xmas_tree.mp4",
  x4_xenops: "/phonics/X/x4_xenops.mp4",
  x5_xiphosura: "/phonics/X/x5_xiphosura.mp4",
  y1_yacht: "/phonics/Y/y1_yacht.mp4",
  y2_yoyo: "/phonics/Y/y2_yoyo.mp4",
  y3_yak: "/phonics/Y/y3_yak.mp4",
  y4_yogurt: "/phonics/Y/y4_yogurt.mp4",
  y5_yarn: "/phonics/Y/y5_yarn.mp4",
  z1_zebra: "/phonics/Z/z1_zebra.mp4",
  z2_zipper: "/phonics/Z/z2_zipper.mp4",
  z3_zoo: "/phonics/Z/z3_zoo.mp4",
  z4_zero: "/phonics/Z/z4_zero.mp4",
  z5_zucchini: "/phonics/Z/z5_zucchini.mp4",
};

const PRODUCED_AUDIO: Record<string, string> = {
  a1_apple: "/phonics/A/a1_apple.mp3",
  a2_aeroplane: "/phonics/A/a2_aeroplane.mp3",
  a3_ant: "/phonics/A/a3_ant.mp3",
  a4_alligator: "/phonics/A/a4_alligator.mp3",
  a5_astronaut: "/phonics/A/a5_astronaut.mp3",
  b1_ball: "/phonics/B/b1_ball.mp3",
  b2_bus: "/phonics/B/b2_bus.mp3",
  b3_bear: "/phonics/B/b3_bear.mp3",
  b4_butterfly: "/phonics/B/b4_butterfly.mp3",
  b5_banana: "/phonics/B/b5_banana.mp3",
  c1_cat: "/phonics/C/c1_cat.mp3",
  c2_car: "/phonics/C/c2_car.mp3",
  c3_cupcake: "/phonics/C/c3_cupcake.mp3",
  c4_cow: "/phonics/C/c4_cow.mp3",
  c5_clock: "/phonics/C/c5_clock.mp3",
  d1_dog: "/phonics/D/d1_dog.mp3",
  d2_duck: "/phonics/D/d2_duck.mp3",
  d3_drum: "/phonics/D/d3_drum.mp3",
  d4_dolphin: "/phonics/D/d4_dolphin.mp3",
  d5_dinosaur: "/phonics/D/d5_dinosaur.mp3",
  e1_elephant: "/phonics/E/e1_elephant.mp3",
  e2_egg: "/phonics/E/e2_egg.mp3",
  e3_eagle: "/phonics/E/e3_eagle.mp3",
  e4_engine: "/phonics/E/e4_engine.mp3",
  e5_earth: "/phonics/E/e5_earth.mp3",
  f1_fish: "/phonics/F/f1_fish.mp3",
  f2_frog: "/phonics/F/f2_frog.mp3",
  f3_flower: "/phonics/F/f3_flower.mp3",
  f4_fox: "/phonics/F/f4_fox.mp3",
  f5_fireengine: "/phonics/F/f5_fireengine.mp3",
  g1_giraffe: "/phonics/G/g1_giraffe.mp3",
  g2_guitar: "/phonics/G/g2_guitar.mp3",
  g3_grapes: "/phonics/G/g3_grapes.mp3",
  g4_gift: "/phonics/G/g4_gift.mp3",
  g5_gorilla: "/phonics/G/g5_gorilla.mp3",
  h1_horse: "/phonics/H/h1_horse.mp3",
  h2_hat: "/phonics/H/h2_hat.mp3",
  h3_house: "/phonics/H/h3_house.mp3",
  h4_helicopter: "/phonics/H/h4_helicopter.mp3",
  h5_hippo: "/phonics/H/h5_hippo.mp3",
  i1_icecream: "/phonics/I/i1_icecream.mp3",
  i2_igloo: "/phonics/I/i2_igloo.mp3",
  i3_iguana: "/phonics/I/i3_iguana.mp3",
  i4_island: "/phonics/I/i4_island.mp3",
  i5_ink: "/phonics/I/i5_ink.mp3",
  j1_juice: "/phonics/J/j1_juice.mp3",
  j2_jellyfish: "/phonics/J/j2_jellyfish.mp3",
  j3_jet: "/phonics/J/j3_jet.mp3",
  j4_jaguar: "/phonics/J/j4_jaguar.mp3",
  j5_jug: "/phonics/J/j5_jug.mp3",
  k1_kite: "/phonics/K/k1_kite.mp3",
  k2_kangaroo: "/phonics/K/k2_kangaroo.mp3",
  k3_koala: "/phonics/K/k3_koala.mp3",
  k4_king: "/phonics/K/k4_king.mp3",
  k5_key: "/phonics/K/k5_key.mp3",
  l1_lion: "/phonics/L/l1_lion.mp3",
  l2_lamp: "/phonics/L/l2_lamp.mp3",
  l3_lemon: "/phonics/L/l3_lemon.mp3",
  l4_leaf: "/phonics/L/l4_leaf.mp3",
  l5_lollipop: "/phonics/L/l5_lollipop.mp3",
  m1_monkey: "/phonics/M/m1_monkey.mp3",
  m2_moon: "/phonics/M/m2_moon.mp3",
  m3_mango: "/phonics/M/m3_mango.mp3",
  m4_milk: "/phonics/M/m4_milk.mp3",
  m5_mouse: "/phonics/M/m5_mouse.mp3",
  n1_nest: "/phonics/N/n1_nest.mp3",
  n2_net: "/phonics/N/n2_net.mp3",
  n3_nut: "/phonics/N/n3_nut.mp3",
  n4_night: "/phonics/N/n4_night.mp3",
  n5_needle: "/phonics/N/n5_needle.mp3",
  o1_owl: "/phonics/O/o1_owl.mp3",
  o2_orange: "/phonics/O/o2_orange.mp3",
  o3_octopus: "/phonics/O/o3_octopus.mp3",
  o4_ostrich: "/phonics/O/o4_ostrich.mp3",
  o5_onion: "/phonics/O/o5_onion.mp3",
  p1_panda: "/phonics/P/p1_panda.mp3",
  p2_penguin: "/phonics/P/p2_penguin.mp3",
  p3_parrot: "/phonics/P/p3_parrot.mp3",
  p4_pencil: "/phonics/P/p4_pencil.mp3",
  p5_pizza: "/phonics/P/p5_pizza.mp3",
  q1_queen: "/phonics/Q/q1_queen.mp3",
  q2_quail: "/phonics/Q/q2_quail.mp3",
  q3_quilt: "/phonics/Q/q3_quilt.mp3",
  q4_question: "/phonics/Q/q4_question.mp3",
  q5_quarter: "/phonics/Q/q5_quarter.mp3",
  r1_rabbit: "/phonics/R/r1_rabbit.mp3",
  r2_rocket: "/phonics/R/r2_rocket.mp3",
  r3_rainbow: "/phonics/R/r3_rainbow.mp3",
  r4_ring: "/phonics/R/r4_ring.mp3",
  r5_robot: "/phonics/R/r5_robot.mp3",
  s1_sun: "/phonics/S/s1_sun.mp3",
  s2_star: "/phonics/S/s2_star.mp3",
  s3_ship: "/phonics/S/s3_ship.mp3",
  s4_snake: "/phonics/S/s4_snake.mp3",
  s5_strawberry: "/phonics/S/s5_strawberry.mp3",
  t1_tiger: "/phonics/T/t1_tiger.mp3",
  t2_train: "/phonics/T/t2_train.mp3",
  t3_turtle: "/phonics/T/t3_turtle.mp3",
  t4_tree: "/phonics/T/t4_tree.mp3",
  t5_telephone: "/phonics/T/t5_telephone.mp3",
  u1_umbrella: "/phonics/U/u1_umbrella.mp3",
  u2_unicorn: "/phonics/U/u2_unicorn.mp3",
  u3_uniform: "/phonics/U/u3_uniform.mp3",
  u4_urn: "/phonics/U/u4_urn.mp3",
  u5_underwater: "/phonics/U/u5_underwater.mp3",
  v1_van: "/phonics/V/v1_van.mp3",
  v2_violin: "/phonics/V/v2_violin.mp3",
  v3_vase: "/phonics/V/v3_vase.mp3",
  v4_volcano: "/phonics/V/v4_volcano.mp3",
  v5_vegetables: "/phonics/V/v5_vegetables.mp3",
  w1_whale: "/phonics/W/w1_whale.mp3",
  w2_watermelon: "/phonics/W/w2_watermelon.mp3",
  w3_watch: "/phonics/W/w3_watch.mp3",
  w4_windmill: "/phonics/W/w4_windmill.mp3",
  w5_wolf: "/phonics/W/w5_wolf.mp3",
  x1_xylophone: "/phonics/X/x1_xylophone.mp3",
  x2_xray: "/phonics/X/x2_xray.mp3",
  x3_xmas_tree: "/phonics/X/x3_xmas_tree.mp3",
  x4_xenops: "/phonics/X/x4_xenops.mp3",
  x5_xiphosura: "/phonics/X/x5_xiphosura.mp3",
  y1_yacht: "/phonics/Y/y1_yacht.mp3",
  y2_yoyo: "/phonics/Y/y2_yoyo.mp3",
  y3_yak: "/phonics/Y/y3_yak.mp3",
  y4_yogurt: "/phonics/Y/y4_yogurt.mp3",
  y5_yarn: "/phonics/Y/y5_yarn.mp3",
  z1_zebra: "/phonics/Z/z1_zebra.mp3",
  z2_zipper: "/phonics/Z/z2_zipper.mp3",
  z3_zoo: "/phonics/Z/z3_zoo.mp3",
  z4_zero: "/phonics/Z/z4_zero.mp3",
  z5_zucchini: "/phonics/Z/z5_zucchini.mp3",
};

export function getLetterPhonics(letter: string): LetterPhonics | null {
  const raw = letter.trim().toUpperCase();
  if (LETTERS[raw]) return LETTERS[raw];
  const first = raw.replace(/[^A-Z]/g, "").charAt(0);
  return first ? LETTERS[first] ?? null : null;
}

export function variantCode(letter: string, index: number): string {
  return `${letter.toUpperCase()}${index + 1}`;
}

export function getVariation(
  letter: string,
  index = 0,
): PhonicsCardMedia | null {
  const data = getLetterPhonics(letter);
  const variation = data?.variations[index];
  if (!data || !variation) return null;

  return {
    letter: letter.toUpperCase(),
    variantCode: variantCode(letter, index),
    variation,
    phonicsSound: data.phonics_sound,
    localVideoSrc: PRODUCED_VIDEO[variation.id] ?? null,
    localAudioSrc: PRODUCED_AUDIO[variation.id] ?? null,
  };
}

export function getMediaByWord(word: string): PhonicsCardMedia | null {
  const needle = word?.trim().toLowerCase();
  if (!needle) return null;
  for (const letter of LETTER_KEYS) {
    const variations = LETTERS[letter]?.variations;
    if (!variations) continue;
    const index = variations.findIndex((v) => v.word.toLowerCase() === needle);
    if (index >= 0) return getVariation(letter, index);
  }
  return null;
}

/** Resolve produced card by schema id (e.g. e4_engine) — avoids wrong-letter fallback. */
export function getMediaByVariationId(variationId: string): PhonicsCardMedia | null {
  const id = variationId.trim().toLowerCase();
  if (!id || !PRODUCED_VIDEO[id]) return null;
  const letter = id.charAt(0).toUpperCase();
  const data = getLetterPhonics(letter);
  if (!data) return null;
  const index = data.variations.findIndex((v) => v.id === id);
  if (index < 0) return null;
  return getVariation(letter, index);
}

export function getMediaByLetter(letter: string): PhonicsCardMedia | null {
  return getVariation(letter, 0);
}

/**
 * Exact `elevenlabs_script` from alphabet_phonics_3d_schema.json.
 * Never invent a phrase — if the card exists in the schema, use that line.
 */
export function getSchemaScript(letter?: string, word?: string): string | null {
  if (word) {
    const byWord = getMediaByWord(word);
    if (byWord) return byWord.variation.elevenlabs_script;
  }
  if (letter) {
    const byLetter = getMediaByLetter(letter);
    if (byLetter) return byLetter.variation.elevenlabs_script;
  }
  return null;
}

export function getSchemaMedia(
  letter?: string,
  word?: string,
  variationId?: string,
): PhonicsCardMedia | null {
  if (variationId) {
    const byId = getMediaByVariationId(variationId);
    if (byId) return byId;
  }
  if (word) {
    const byWord = getMediaByWord(word);
    if (byWord) return byWord;
  }
  if (letter) return getMediaByLetter(letter);
  return null;
}

/** A1 — first produced card. Schema: a1_apple. */
export const A1_CARD = getVariation("A", 0)!;

/** One card per produced variation. Unproduced letters stay as the base deck. */
export function buildPhonicsDeck(base: PhonicsBlend[]): PhonicsBlend[] {
  const producedLetters = new Set(
    Object.keys(PRODUCED_VIDEO).map((id) => id.charAt(0).toUpperCase()),
  );

  const produced: PhonicsBlend[] = [];
  let sort = 1;
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    if (!producedLetters.has(letter)) continue;
    const data = getLetterPhonics(letter);
    if (!data) continue;
    data.variations.forEach((variation, index) => {
      if (!PRODUCED_VIDEO[variation.id]) return;
      produced.push({
        id: variation.id,
        blend: `${letter}${letter.toLowerCase()}`,
        letter,
        example_word: variation.word,
        speak_text: variation.elevenlabs_script,
        icon_name: "Sparkles",
        sort_order: sort,
        is_active: true,
        created_at: "",
        variant_id: variantCode(letter, index),
        video_url: PRODUCED_VIDEO[variation.id],
        audio_url: PRODUCED_AUDIO[variation.id] ?? null,
      });
      sort += 1;
    });
  }

  const rest = base
    .filter((row) => !producedLetters.has(row.letter.toUpperCase()))
    .map((row, index) => ({ ...row, sort_order: sort + index }));

  return [...produced, ...rest];
}
