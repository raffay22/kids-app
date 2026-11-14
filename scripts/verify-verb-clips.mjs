import fs from "node:fs";

const t = fs.readFileSync("utils/verbFlashcards.ts", "utf8");
const words = [...t.matchAll(/card\("([^"]+)"\)/g)].map((m) => m[1]);
const miss = words.filter((w) => {
  const slug = w.toLowerCase().replace(/\s+/g, "_");
  return !fs.existsSync(`public/flashcards/verbs/${slug}.mp4`);
});
console.log(JSON.stringify({ verbs: words.length, missing: miss }, null, 2));
