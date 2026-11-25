/**
 * Grab one still JPG from each phonics MP4 for Picture Puzzle (not video tiles).
 * Output: public/puzzle-stills/<id>.jpg
 *
 * Usage: node scripts/extract-puzzle-stills.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PHONICS = path.join(ROOT, "public", "phonics");
const OUT = path.join(ROOT, "public", "puzzle-stills");

function findFfmpeg() {
  const which = spawnSync(
    process.platform === "win32" ? "where" : "which",
    ["ffmpeg"],
    { encoding: "utf8" },
  );
  const line = (which.stdout || "").split(/\r?\n/).find(Boolean);
  if (line && fs.existsSync(line.trim())) return line.trim();
  const winget = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft",
    "WinGet",
    "Links",
    "ffmpeg.exe",
  );
  if (fs.existsSync(winget)) return winget;
  return "ffmpeg";
}

function walkMp4s(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkMp4s(full, acc);
    else if (name.toLowerCase().endsWith(".mp4")) acc.push(full);
  }
  return acc;
}

fs.mkdirSync(OUT, { recursive: true });
const ffmpeg = findFfmpeg();
const videos = walkMp4s(PHONICS);
console.log(`ffmpeg: ${ffmpeg}`);
console.log(`videos: ${videos.length}`);
console.log(`out: ${OUT}`);

let ok = 0;
let skip = 0;
let fail = 0;

for (const video of videos) {
  const id = path.basename(video, path.extname(video));
  const dest = path.join(OUT, `${id}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
    skip += 1;
    continue;
  }

  // Mid-ish frame: seek 0.35s (phonics loops are short)
  const r = spawnSync(
    ffmpeg,
    [
      "-y",
      "-ss",
      "0.35",
      "-i",
      video,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      "-vf",
      "scale=640:-1",
      dest,
    ],
    { encoding: "utf8" },
  );

  if (r.status === 0 && fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    ok += 1;
    console.log(`ok ${id}`);
  } else {
    fail += 1;
    console.warn(`fail ${id}`, (r.stderr || "").slice(-180));
  }
}

console.log(JSON.stringify({ ok, skip, fail, total: videos.length }, null, 2));
