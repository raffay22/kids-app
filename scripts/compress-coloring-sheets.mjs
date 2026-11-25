/**
 * Compress colouring sheet images in public/coloring/sheets.
 * Rewrites large JPEGs/PNGs to smaller JPEG (quality 82, max width 1280).
 *
 * Usage: node scripts/compress-coloring-sheets.mjs
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  renameSync,
  unlinkSync,
  statSync,
  mkdirSync,
} from "node:fs";
import { resolve, join, extname, basename } from "node:path";

const ROOT = resolve(process.cwd());
const DIR = resolve(ROOT, "public", "coloring", "sheets");
const TMP = resolve(ROOT, "public", "coloring", "_compress_tmp");
const MAX_W = 1280;
const QUALITY = 82;

function whichFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  return r.status === 0;
}

if (!existsSync(DIR)) {
  console.error("Missing", DIR);
  process.exit(1);
}
if (!whichFfmpeg()) {
  console.error("ffmpeg not found on PATH");
  process.exit(1);
}

mkdirSync(TMP, { recursive: true });

const files = readdirSync(DIR).filter((f) =>
  /\.(png|jpe?g|webp)$/i.test(f),
);

let changed = 0;
let skipped = 0;

for (const file of files) {
  const src = join(DIR, file);
  const before = statSync(src).size;
  const ext = extname(file).toLowerCase();
  // Keep small premium PNGs as PNG (line-art). Only re-encode large uploads as JPG.
  const keepPng = ext === ".png" && before < 200 * 1024;
  const outName = keepPng ? file : `${basename(file, extname(file))}.jpg`;
  const tmp = join(TMP, outName);

  const ffArgs = keepPng
    ? ["-y", "-i", src, "-vf", `scale='min(${MAX_W}\\,iw)':-2`, "-compression_level", "9", tmp]
    : ["-y", "-i", src, "-vf", `scale='min(${MAX_W}\\,iw)':-2`, "-q:v", "4", tmp];

  const r = spawnSync("ffmpeg", ffArgs, { encoding: "utf8" });

  if (r.status !== 0 || !existsSync(tmp)) {
    console.error("FAIL", file, r.stderr?.slice(-200));
    continue;
  }

  const after = statSync(tmp).size;
  const finalPath = join(DIR, outName);
  // Only replace if meaningfully smaller OR converting to jpg for huge uploads
  if (after < before * 0.95 || (outName !== file && before > 400 * 1024)) {
    if (src !== finalPath && existsSync(src)) unlinkSync(src);
    renameSync(tmp, finalPath);
    console.log(
      `OK ${file} → ${outName}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`,
    );
    changed++;
  } else {
    unlinkSync(tmp);
    console.log(`SKIP ${file} (already small ${(before / 1024).toFixed(0)}KB)`);
    skipped++;
  }
}

console.log(`Done. compressed=${changed} skipped=${skipped}`);
