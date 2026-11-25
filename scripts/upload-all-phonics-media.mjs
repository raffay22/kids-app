/**
 * Upload all produced phonics MP4 + MP3 files to the public Supabase `phonics` bucket.
 *
 * Object layout matches local PWA paths: A/a1_apple.mp4, B/b1_ball.mp4, …
 *
 * Usage:
 *   node scripts/upload-all-phonics-media.mjs
 *   node scripts/upload-all-phonics-media.mjs --dry-run
 *   node scripts/upload-all-phonics-media.mjs --videos-only
 *
 * Requires in .env.local (project root):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const ROOT = resolve(process.cwd());
const PUBLIC_PHONICS = resolve(ROOT, "public", "phonics");
const DRY_RUN = process.argv.includes("--dry-run");
const VIDEOS_ONLY = process.argv.includes("--videos-only");

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

if (!existsSync(PUBLIC_PHONICS)) {
  console.error("Missing", PUBLIC_PHONICS);
  process.exit(1);
}

/** @type {{ objectPath: string, filePath: string, contentType: string }[]} */
const jobs = [];

for (const letterDir of readdirSync(PUBLIC_PHONICS, { withFileTypes: true })) {
  if (!letterDir.isDirectory()) continue;
  const letter = letterDir.name;
  const dir = join(PUBLIC_PHONICS, letter);
  for (const file of readdirSync(dir)) {
    const lower = file.toLowerCase();
    if (lower.endsWith(".mp4")) {
      jobs.push({
        objectPath: `${letter}/${file}`,
        filePath: join(dir, file),
        contentType: "video/mp4",
      });
    } else if (!VIDEOS_ONLY && lower.endsWith(".mp3")) {
      jobs.push({
        objectPath: `${letter}/${file}`,
        filePath: join(dir, file),
        contentType: "audio/mpeg",
      });
    }
  }
}

jobs.sort((a, b) => a.objectPath.localeCompare(b.objectPath));

console.log(
  `Found ${jobs.length} file(s) to upload (${VIDEOS_ONLY ? "videos only" : "mp4 + mp3"})`,
);

if (DRY_RUN) {
  for (const j of jobs.slice(0, 5)) console.log("  ", j.objectPath);
  if (jobs.length > 5) console.log(`  ... and ${jobs.length - 5} more`);
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
if (listErr) throw listErr;
if (!buckets?.some((b) => b.id === "phonics")) {
  const { error: createErr } = await supabase.storage.createBucket("phonics", {
    public: true,
  });
  if (createErr && !/already exists/i.test(createErr.message)) {
    throw createErr;
  }
}

const manifest = {};
let ok = 0;
let fail = 0;
const concurrency = 4;
let idx = 0;

async function uploadOne(job) {
  const body = readFileSync(job.filePath);
  const { error } = await supabase.storage.from("phonics").upload(job.objectPath, body, {
    contentType: job.contentType,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("phonics").getPublicUrl(job.objectPath);
  manifest[job.objectPath] = data.publicUrl;
}

async function worker() {
  while (idx < jobs.length) {
    const i = idx++;
    const job = jobs[i];
    try {
      await uploadOne(job);
      ok++;
      if (ok % 10 === 0 || ok === jobs.length) {
        console.log(`Uploaded ${ok}/${jobs.length} — latest ${job.objectPath}`);
      }
    } catch (e) {
      fail++;
      console.error("FAIL", job.objectPath, e.message ?? e);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const manifestPath = resolve(ROOT, "media", "phonics", "supabase-upload-manifest.json");
writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      bucket: "phonics",
      uploaded_at: new Date().toISOString(),
      success: ok,
      failed: fail,
      public_urls: manifest,
    },
    null,
    2,
  ),
);

console.log(JSON.stringify({ ok, fail, manifestPath, total: jobs.length }));
process.exit(fail > 0 ? 1 : 0);
