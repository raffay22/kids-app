import fs from "node:fs";
const t = fs.readFileSync("utils/nounFlashcards.ts", "utf8");
const n = [...t.matchAll(/stillId: "([^"]+)"/g)].map((m) => m[1]);
const skip = new Set([
  "n4_night",
  "q4_question",
  "u5_underwater",
  "x2_xray",
  "x4_xenops",
  "x5_xiphosura",
  "z4_zero",
  "e5_earth",
  "u3_uniform",
  "u4_urn",
]);
const kept = n.filter((id) => !skip.has(id));
console.log({ entries: n.length, kept: kept.length });
