/**
 * Create public Storage buckets used by this project on a fresh Supabase.
 *
 * Buckets:
 *   phonics            — phonics MP4/MP3
 *   story-animations   — toddler / IQ story media (NOT bedtime)
 *   puzzle-stills      — JPG stills for puzzles / nouns / objects
 *   flashcards         — non-verb flashcard media (future / misc)
 *   verbs              — verb / action flashcard clips + posters
 *   colour-board       — colouring sheet images
 *   brand-ads          — admin brand ad creatives
 *   worksheets         — printable PDFs by age/category (age-2-4/math/…)
 *   payment-slips      — admin payment receipts
 *
 * Usage: node scripts/setup-supabase-buckets.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());

function loadEnvLocal() {
  const envPath = resolve(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const BUCKETS = [
  { id: "phonics", public: true },
  { id: "story-animations", public: true },
  { id: "puzzle-stills", public: true },
  { id: "flashcards", public: true },
  { id: "verbs", public: true },
  { id: "colour-board", public: true },
  { id: "brand-ads", public: true },
  { id: "worksheets", public: true },
  { id: "payment-slips", public: false },
];

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: existing, error: listErr } = await supabase.storage.listBuckets();
if (listErr) {
  console.error("listBuckets failed:", listErr.message);
  process.exit(1);
}

const have = new Set((existing ?? []).map((b) => b.id || b.name));
console.log("Existing buckets:", [...have].join(", ") || "(none)");

for (const b of BUCKETS) {
  if (have.has(b.id)) {
    console.log(`KEEP ${b.id}`);
    continue;
  }
  const { error } = await supabase.storage.createBucket(b.id, {
    public: b.public,
    fileSizeLimit:
      b.id === "story-animations" || b.id === "phonics" || b.id === "verbs"
        ? "100MB"
        : "20MB",
  });
  if (error && !/already exists/i.test(error.message)) {
    console.error(`FAIL create ${b.id}:`, error.message);
  } else {
    console.log(`CREATE ${b.id} (public=${b.public})`);
  }
}

const { data: after } = await supabase.storage.listBuckets();
console.log(
  "Done. Buckets now:",
  (after ?? []).map((b) => b.id || b.name).join(", "),
);
