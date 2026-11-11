/**
 * Compress toddler story and phonics MP4s before Supabase upload.
 * Replaces each file in place after a successful smaller encode.
 *
 * Usage:
 *   node scripts/compress-story-and-phonics-videos.mjs
 *   node scripts/compress-story-and-phonics-videos.mjs --stories-only
 *   node scripts/compress-story-and-phonics-videos.mjs --phonics-only
 *   node scripts/compress-story-and-phonics-videos.mjs --dry-run
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  renameSync,
  unlinkSync,
  statSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";

const ROOT = resolve(process.cwd());
const STORIES = resolve(ROOT, "public", "stories");
const PHONICS = resolve(ROOT, "public", "phonics");
const DRY = process.argv.includes("--dry-run");
const STORIES_ONLY = process.argv.includes("--stories-only");
const PHONICS_ONLY = process.argv.includes("--phonics-only");

function ffmpegOk() {
  const r = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  return r.status === 0;
}

function listMp4(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMp4(full));
    else if (entry.name.toLowerCase().endsWith(".mp4")) out.push(full);
  }
  return out.sort();
}

function compressOne(filePath) {
  const tmp = `${filePath}.compressed.tmp.mp4`;
  if (existsSync(tmp)) unlinkSync(tmp);
  const args = [
    "-y",
    "-i",
    filePath,
    "-vf",
    "scale='min(1280,iw)':-2",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    tmp,
  ];
  const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.status !== 0) {
    if (existsSync(tmp)) unlinkSync(tmp);
    return {
      ok: false,
      error: (r.stderr || r.stdout || "ffmpeg failed").slice(-400),
    };
  }
  const before = statSync(filePath).size;
  const after = statSync(tmp).size;
  if (after >= before * 0.98) {
    unlinkSync(tmp);
    return { ok: true, skipped: true, before, after: before };
  }
  renameSync(tmp, filePath);
  return { ok: true, skipped: false, before, after };
}

if (!ffmpegOk()) {
  console.error("ffmpeg not found on PATH");
  process.exit(1);
}

const jobs = [];
if (!PHONICS_ONLY) jobs.push(...listMp4(STORIES));
if (!STORIES_ONLY) jobs.push(...listMp4(PHONICS));

console.log(`Found ${jobs.length} MP4 file(s) to compress`);
if (DRY) {
  for (const f of jobs.slice(0, 10)) console.log(" ", f);
  if (jobs.length > 10) console.log(` ... and ${jobs.length - 10} more`);
  process.exit(0);
}

let ok = 0;
let fail = 0;
let saved = 0;
const report = [];

for (let i = 0; i < jobs.length; i++) {
  const file = jobs[i];
  const rel = file.replace(ROOT + "\\", "").replace(ROOT + "/", "");
  try {
    const result = compressOne(file);
    if (!result.ok) {
      fail++;
      console.error(`FAIL ${i + 1}/${jobs.length} ${rel}`, result.error);
      report.push({ file: rel, ok: false, error: result.error });
      continue;
    }
    ok++;
    const delta = result.before - result.after;
    saved += Math.max(0, delta);
    console.log(
      `${result.skipped ? "KEEP" : "OK  "} ${i + 1}/${jobs.length} ${rel} ${(result.before / 1e6).toFixed(2)}MB → ${(result.after / 1e6).toFixed(2)}MB`,
    );
    report.push({
      file: rel,
      ok: true,
      skipped: Boolean(result.skipped),
      before: result.before,
      after: result.after,
    });
  } catch (e) {
    fail++;
    console.error(`FAIL ${i + 1}/${jobs.length} ${rel}`, e.message ?? e);
    report.push({ file: rel, ok: false, error: String(e) });
  }
}

const outDir = resolve(ROOT, "media");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, "video-compress-report.json");
writeFileSync(
  outPath,
  JSON.stringify(
    {
      compressed_at: new Date().toISOString(),
      ok,
      fail,
      bytes_saved: saved,
      mb_saved: Number((saved / 1e6).toFixed(2)),
      files: report,
    },
    null,
    2,
  ),
);

console.log(
  `Done. ok=${ok} fail=${fail} saved=${(saved / 1e6).toFixed(1)}MB. Report → ${outPath}`,
);
if (fail) process.exit(1);
