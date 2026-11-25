/**
 * Objects flashcards — man-made things, toys, vehicles, tools.
 * Reuses the same puzzle-stills already in the app (no new images).
 */

import {
  isSkippedStill,
  toStillCard,
  type NounFlashcard,
} from "@/utils/nounFlashcards";

export type ObjectFlashcard = NounFlashcard;

const OBJECT_STILLS: { stillId: string; word: string }[] = [
  { stillId: "a2_aeroplane", word: "Aeroplane" },
  { stillId: "b1_ball", word: "Ball" },
  { stillId: "b2_bus", word: "Bus" },
  { stillId: "c2_car", word: "Car" },
  { stillId: "c5_clock", word: "Clock" },
  { stillId: "d3_drum", word: "Drum" },
  { stillId: "f5_fireengine", word: "Fire Engine" },
  { stillId: "g2_guitar", word: "Guitar" },
  { stillId: "g4_gift", word: "Gift" },
  { stillId: "h2_hat", word: "Hat" },
  { stillId: "h3_house", word: "House" },
  { stillId: "h4_helicopter", word: "Helicopter" },
  { stillId: "i2_igloo", word: "Igloo" },
  { stillId: "j3_jet", word: "Jet" },
  { stillId: "j5_jug", word: "Jug" },
  { stillId: "k1_kite", word: "Kite" },
  { stillId: "k5_key", word: "Key" },
  { stillId: "l2_lamp", word: "Lamp" },
  { stillId: "p4_pencil", word: "Pencil" },
  { stillId: "q3_quilt", word: "Quilt" },
  { stillId: "r2_rocket", word: "Rocket" },
  { stillId: "r4_ring", word: "Ring" },
  { stillId: "r5_robot", word: "Robot" },
  { stillId: "s3_ship", word: "Ship" },
  { stillId: "t2_train", word: "Train" },
  { stillId: "t5_telephone", word: "Telephone" },
  { stillId: "u1_umbrella", word: "Umbrella" },
  { stillId: "v1_van", word: "Van" },
  { stillId: "v2_violin", word: "Violin" },
  { stillId: "v3_vase", word: "Vase" },
  { stillId: "w3_watch", word: "Watch" },
  { stillId: "x1_xylophone", word: "Xylophone" },
  { stillId: "x3_xmas_tree", word: "Christmas Tree" },
  { stillId: "y2_yoyo", word: "Yo-Yo" },
];

export const OBJECT_CARDS: ObjectFlashcard[] = OBJECT_STILLS.filter(
  (entry) => !isSkippedStill(entry.stillId),
).map((entry) => toStillCard(entry, "o"));

export function getObjectCardByWord(word: string): ObjectFlashcard | undefined {
  const key = word.trim().toLowerCase();
  return OBJECT_CARDS.find((card) => card.word.toLowerCase() === key);
}
