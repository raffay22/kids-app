/**
 * Upload story media to the public Supabase `story-animations` bucket.
 * Sends ONE file at a time so large videos transfer reliably.
 *
 * Usage:
 *   node scripts/upload-story-animations.mjs --dry-run
 *   node scripts/upload-story-animations.mjs --story story_toddler_07
 *   node scripts/upload-story-animations.mjs --videos-only
 *   node scripts/upload-story-animations.mjs --one
 *
 * Requires in .env.local (project root):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import {
  readFileSync,
  existsSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { resolve, join, extname } from "node:path";

const ROOT = resolve(process.cwd());
const PUBLIC_STORIES = resolve(ROOT, "public", "stories");
const BUCKET = "story-animations";
const DRY_RUN = process.argv.includes("--dry-run");
const VIDEOS_ONLY = process.argv.includes("--videos-only");
const ONE_ONLY = process.argv.includes("--one");
const storyFlagIndex = process.argv.indexOf("--story");
const STORY_FILTER =
  storyFlagIndex >= 0 ? process.argv[storyFlagIndex + 1] : null;

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

function contentTypeFor(file) {
  const ext = extname(file).toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

loadEnvLocal();

if (!existsSync(PUBLIC_STORIES)) {
  console.error("Missing", PUBLIC_STORIES);
  process.exit(1);
}

/** @type {{ objectPath: string, filePath: string, contentType: string }[]} */
const jobs = [];

for (const storyDir of readdirSync(PUBLIC_STORIES, { withFileTypes: true })) {
  if (!storyDir.isDirectory()) continue;
  if (STORY_FILTER && storyDir.name !== STORY_FILTER) continue;
  const dir = join(PUBLIC_STORIES, storyDir.name);
  for (const file of readdirSync(dir)) {
    const lower = file.toLowerCase();
    const isVideo = lower.endsWith(".mp4");
    const isAudio = lower.endsWith(".mp3");
    const isImage =
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp");
    if (VIDEOS_ONLY && !isVideo) continue;
    if (!isVideo && !isAudio && !isImage) continue;
    jobs.push({
      objectPath: `${storyDir.name}/${file}`,
      filePath: join(dir, file),
      contentType: contentTypeFor(file),
    });
  }
}

jobs.sort((a, b) => a.objectPath.localeCompare(b.objectPath));
const queue = ONE_ONLY ? jobs.slice(0, 1) : jobs;

console.log(
  `Found ${jobs.length} file(s)${STORY_FILTER ? ` for ${STORY_FILTER}` : ""}; uploading ${queue.length} one-by-one (${VIDEOS_ONLY ? "videos only" : "media"})`,
);

if (DRY_RUN) {
  for (const j of queue.slice(0, 12)) console.log("  ", j.objectPath);
  if (queue.length > 12) console.log(`  ... and ${queue.length - 12} more`);
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
if (!buckets?.some((b) => b.id === BUCKET || b.name === BUCKET)) {
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });
  if (createErr && !/already exists/i.test(createErr.message)) {
    throw createErr;
  }
  console.log(`Created public bucket ${BUCKET}`);
}

const manifestPath = resolve(
  ROOT,
  "media",
  "stories",
  "supabase-upload-manifest.json",
);
let manifest = {};
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8")).files ?? {};
  } catch {
    manifest = {};
  }
}

let ok = 0;
let fail = 0;

for (const job of queue) {
  try {
    const body = readFileSync(job.filePath);
    const { error } = await supabase.storage.from(BUCKET).upload(job.objectPath, body, {
      contentType: job.contentType,
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(job.objectPath);
    manifest[job.objectPath] = data.publicUrl;
    ok++;
    console.log(`OK ${ok}/${queue.length}  ${job.objectPath}`);
  } catch (e) {
    fail++;
    console.error("FAIL", job.objectPath, e.message ?? e);
  }
}

mkdirSync(resolve(ROOT, "media", "stories"), { recursive: true });
writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      bucket: BUCKET,
      public: true,
      cacheControl: "31536000",
      uploaded_at: new Date().toISOString(),
      ok,
      fail,
      files: manifest,
    },
    null,
    2,
  ),
);

console.log(`Done. ok=${ok} fail=${fail}. Manifest → ${manifestPath}`);
if (fail) process.exit(1);
