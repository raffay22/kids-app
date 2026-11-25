/**
 * Create/ensure buckets and upload:
 *   public/puzzle-stills/*.jpg  → puzzle-stills/
 *   public/flashcards/verbs/*   → verbs/
 * Also ensures empty `flashcards` bucket exists (marker only).
 *
 * Usage:
 *   node scripts/upload-puzzle-stills-and-verbs.mjs
 *   node scripts/upload-puzzle-stills-and-verbs.mjs --dry-run
 *   node scripts/upload-puzzle-stills-and-verbs.mjs --stills-only
 *   node scripts/upload-puzzle-stills-and-verbs.mjs --verbs-only
 *   node scripts/upload-puzzle-stills-and-verbs.mjs --one
 */
import { createClient } from "@supabase/supabase-js";
import {
  readFileSync,
  existsSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(process.cwd());
const STILLS_DIR = resolve(ROOT, "public", "puzzle-stills");
const VERBS_DIR = resolve(ROOT, "public", "flashcards", "verbs");
const DRY_RUN = process.argv.includes("--dry-run");
const STILLS_ONLY = process.argv.includes("--stills-only");
const VERBS_ONLY = process.argv.includes("--verbs-only");
const ONE = process.argv.includes("--one");

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

const supabase = createClient(url, key, { auth: { persistSession: false } });

/** @type {{ bucket: string, objectPath: string, filePath: string, contentType: string }[]} */
const jobs = [];

function contentTypeFor(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

if (!VERBS_ONLY && existsSync(STILLS_DIR)) {
  for (const file of readdirSync(STILLS_DIR)) {
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
    jobs.push({
      bucket: "puzzle-stills",
      objectPath: file,
      filePath: join(STILLS_DIR, file),
      contentType: contentTypeFor(file),
    });
  }
}

if (!STILLS_ONLY && existsSync(VERBS_DIR)) {
  for (const file of readdirSync(VERBS_DIR)) {
    if (!/\.(mp4|jpe?g|png|webp)$/i.test(file)) continue;
    jobs.push({
      bucket: "verbs",
      objectPath: file,
      filePath: join(VERBS_DIR, file),
      contentType: contentTypeFor(file),
    });
  }
}

jobs.sort((a, b) =>
  `${a.bucket}/${a.objectPath}`.localeCompare(`${b.bucket}/${b.objectPath}`),
);

const work = ONE ? jobs.slice(0, 1) : jobs;

console.log(
  `Found ${jobs.length} file(s); uploading ${work.length}` +
    (DRY_RUN ? " (dry-run)" : ""),
);

if (DRY_RUN) {
  for (const j of work.slice(0, 8)) {
    console.log(`  ${j.bucket}/${j.objectPath}`);
  }
  if (work.length > 8) console.log(`  ... and ${work.length - 8} more`);
  process.exit(0);
}

async function ensureBucket(id, fileSizeLimit = "20MB") {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;
  if (buckets?.some((b) => b.id === id)) {
    console.log(`KEEP bucket ${id}`);
    return;
  }
  const { error } = await supabase.storage.createBucket(id, {
    public: true,
    fileSizeLimit,
  });
  if (error && !/already exists/i.test(error.message)) throw error;
  console.log(`CREATE bucket ${id}`);
}

await ensureBucket("puzzle-stills", "20MB");
await ensureBucket("verbs", "100MB");
await ensureBucket("flashcards", "20MB");

// Marker so flashcards bucket is not empty in the dashboard
{
  const { error } = await supabase.storage.from("flashcards").upload(
    ".emptyFolderPlaceholder",
    Buffer.from(""),
    {
      contentType: "application/octet-stream",
      upsert: true,
    },
  );
  if (error && !/already exists/i.test(error.message ?? "")) {
    console.warn("flashcards placeholder:", error.message);
  } else {
    console.log("OK    flashcards/.emptyFolderPlaceholder");
  }
}

const manifest = {};
let ok = 0;
let fail = 0;

for (const job of work) {
  try {
    const body = readFileSync(job.filePath);
    const { error } = await supabase.storage.from(job.bucket).upload(
      job.objectPath,
      body,
      {
        contentType: job.contentType,
        upsert: true,
      },
    );
    if (error) throw error;
    const { data } = supabase.storage
      .from(job.bucket)
      .getPublicUrl(job.objectPath);
    const key = `${job.bucket}/${job.objectPath}`;
    manifest[key] = data.publicUrl;
    ok++;
    if (ok % 10 === 0 || ok === work.length || ONE) {
      console.log(`Uploaded ${ok}/${work.length} — ${key}`);
    }
  } catch (e) {
    fail++;
    console.error("FAIL", `${job.bucket}/${job.objectPath}`, e.message ?? e);
  }
}

const manifestDir = resolve(ROOT, "media", "cdn");
mkdirSync(manifestDir, { recursive: true });
const manifestPath = resolve(manifestDir, "puzzle-stills-verbs-manifest.json");
writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      uploaded_at: new Date().toISOString(),
      success: ok,
      failed: fail,
      public_urls: manifest,
    },
    null,
    2,
  ),
);

console.log(`\nDone. ok=${ok} fail=${fail}`);
console.log("Manifest:", manifestPath);
if (fail) process.exit(1);
