/**
 * Create empty letter folders H–Z inside the Supabase `phonics` bucket.
 * Does NOT upload phonics media — only tiny folder markers.
 *
 * Usage:
 *   node scripts/create-phonics-letter-folders.mjs
 *   node scripts/create-phonics-letter-folders.mjs --from H --to Z
 *   node scripts/create-phonics-letter-folders.mjs --all   # A–Z
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const BUCKET = "phonics";
const PLACEHOLDER = ".emptyFolderPlaceholder";

function loadEnv() {
  const env = {};
  const path = resolve(ROOT, ".env.local");
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    const k = trimmed.slice(0, i).trim();
    const v = trimmed.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
    env[k] = v;
  }
  return env;
}

function parseRange(argv) {
  if (argv.includes("--all")) return { from: "A", to: "Z" };
  let from = "H";
  let to = "Z";
  const fi = argv.indexOf("--from");
  const ti = argv.indexOf("--to");
  if (fi >= 0 && argv[fi + 1]) from = argv[fi + 1].toUpperCase();
  if (ti >= 0 && argv[ti + 1]) to = argv[ti + 1].toUpperCase();
  return { from, to };
}

function lettersBetween(from, to) {
  const a = from.charCodeAt(0);
  const b = to.charCodeAt(0);
  if (a < 65 || b > 90 || a > b) {
    throw new Error(`Invalid range ${from}-${to}; use A–Z`);
  }
  const out = [];
  for (let c = a; c <= b; c++) out.push(String.fromCharCode(c));
  return out;
}

async function main() {
  const env = { ...loadEnv(), ...process.env };
  const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const { from, to } = parseRange(process.argv.slice(2));
  const letters = lettersBetween(from, to);
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error("listBuckets failed:", listErr.message);
    process.exit(1);
  }
  if (!buckets?.some((b) => b.id === BUCKET || b.name === BUCKET)) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: "100MB",
    });
    if (createErr && !/already exists|duplicate/i.test(createErr.message)) {
      console.error("createBucket failed:", createErr.message);
      process.exit(1);
    }
    console.log(`Created bucket ${BUCKET}`);
  } else {
    console.log(`Using bucket ${BUCKET}`);
  }

  const body = new Blob([""], { type: "application/octet-stream" });
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const letter of letters) {
    const objectPath = `${letter}/${PLACEHOLDER}`;
    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, body, {
      upsert: true,
      contentType: "application/octet-stream",
      cacheControl: "3600",
    });
    if (error) {
      // Already exists without upsert support in some projects
      if (/already exists|Duplicate|The resource already exists/i.test(error.message)) {
        console.log(`KEEP  ${letter}/`);
        skip += 1;
        continue;
      }
      console.error(`FAIL  ${letter}/  ${error.message}`);
      fail += 1;
      continue;
    }
    console.log(`OK    ${letter}/`);
    ok += 1;
  }

  console.log(`\nDone. created=${ok} kept=${skip} failed=${fail} (letters ${from}–${to})`);
  console.log("No phonics media was uploaded — folders only.");
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
