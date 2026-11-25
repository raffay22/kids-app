/**
 * Upload colouring sheets to public Supabase bucket `colour-board`.
 * One file at a time. Object path = filename (e.g. unicorn.jpg).
 *
 * Usage:
 *   node scripts/upload-colour-board.mjs
 *   node scripts/upload-colour-board.mjs --dry-run
 *   node scripts/upload-colour-board.mjs --one
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
const DIR = resolve(ROOT, "public", "coloring", "sheets");
const BUCKET = "colour-board";
const DRY_RUN = process.argv.includes("--dry-run");
const ONE_ONLY = process.argv.includes("--one");

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
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

loadEnvLocal();

if (!existsSync(DIR)) {
  console.error("Missing", DIR);
  process.exit(1);
}

const jobs = readdirSync(DIR)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort()
  .map((file) => ({
    objectPath: file,
    filePath: join(DIR, file),
    contentType: contentTypeFor(file),
  }));

const queue = ONE_ONLY ? jobs.slice(0, 1) : jobs;
console.log(`Found ${jobs.length} sheet(s); uploading ${queue.length}`);

if (DRY_RUN) {
  for (const j of queue) console.log(" ", j.objectPath);
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
if (listErr) throw listErr;
if (!buckets?.some((b) => b.id === BUCKET || b.name === BUCKET)) {
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });
  if (createErr && !/already exists/i.test(createErr.message)) throw createErr;
  console.log(`Created public bucket ${BUCKET}`);
}

const manifestPath = resolve(
  ROOT,
  "media",
  "coloring",
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

mkdirSync(resolve(ROOT, "media", "coloring"), { recursive: true });
writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      bucket: BUCKET,
      public: true,
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
