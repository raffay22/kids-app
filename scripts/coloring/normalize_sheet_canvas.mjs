/**
 * Pad/scale every colouring sheet to the board canvas: 900×1200 portrait.
 * Landscape uploads stop looking like a thin strip in the middle.
 *
 * Usage: node scripts/coloring/normalize_sheet_canvas.mjs
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  renameSync,
  unlinkSync,
  mkdirSync,
  statSync,
} from "node:fs";
import { resolve, join, extname } from "node:path";

const ROOT = resolve(process.cwd());
const DIR = resolve(ROOT, "public", "coloring", "sheets");
const TMP = resolve(ROOT, "public", "coloring", "_normalize_tmp");
const W = 900;
const H = 1200;

function probe(file) {
  const r = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0",
      file,
    ],
    { encoding: "utf8" },
  );
  if (r.status !== 0) return null;
  const [w, h] = (r.stdout || "").trim().split(",").map(Number);
  if (!w || !h) return null;
  return { w, h };
}

if (!existsSync(DIR)) {
  console.error("Missing", DIR);
  process.exit(1);
}
mkdirSync(TMP, { recursive: true });

const files = readdirSync(DIR).filter((f) =>
  /\.(png|jpe?g|webp)$/i.test(f),
);

let fixed = 0;
let skipped = 0;

for (const file of files) {
  const src = join(DIR, file);
  const size = probe(src);
  if (!size) {
    console.error("FAIL probe", file);
    continue;
  }
  if (size.w === W && size.h === H) {
    console.log(`SKIP ${file} (already ${W}x${H})`);
    skipped++;
    continue;
  }

  const ext = extname(file).toLowerCase();
  const outName = ext === ".png" ? file : file.replace(/\.[^.]+$/, ".jpg");
  const tmp = join(TMP, outName);
  if (existsSync(tmp)) unlinkSync(tmp);

  // Scale to fit inside 900×1200, then pad with white so every sheet matches.
  const vf = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:white`;
  const args =
    outName.endsWith(".png")
      ? ["-y", "-i", src, "-vf", vf, "-compression_level", "9", tmp]
      : ["-y", "-i", src, "-vf", vf, "-q:v", "3", tmp];

  const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.status !== 0 || !existsSync(tmp)) {
    console.error("FAIL", file, (r.stderr || "").slice(-200));
    continue;
  }

  const finalPath = join(DIR, outName);
  if (src !== finalPath && existsSync(src)) unlinkSync(src);
  renameSync(tmp, finalPath);
  const after = probe(finalPath);
  console.log(
    `OK ${file} ${size.w}x${size.h} → ${after?.w}x${after?.h}  ${Math.round(statSync(finalPath).size / 1024)}KB`,
  );
  fixed++;
}

console.log(`Done. fixed=${fixed} skipped=${skipped}`);
