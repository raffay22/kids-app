/**
 * Build YouTube-ready bedtime films into public/complete-stories/.
 * Does NOT delete or modify public/stories/story_moral_* sources.
 *
 * Prefer existing story.mp4 when it already has an audio track.
 * Otherwise mux each scene*.mp4 with matching scene*.mp3, then concat.
 *
 *   node scripts/build-bedtime-complete-stories.mjs
 *   node scripts/build-bedtime-complete-stories.mjs --one story_moral_13
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const STORIES = join(ROOT, "public", "stories");
const OUT = join(ROOT, "public", "complete-stories");
const ONE = process.argv.includes("--one")
  ? process.argv[process.argv.indexOf("--one") + 1]
  : null;

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  });
  if (r.status !== 0) {
    throw new Error(
      `${cmd} ${args.join(" ")}\n${r.stderr || r.stdout || "failed"}`.slice(
        0,
        800,
      ),
    );
  }
  return r;
}

function hasAudioStream(file) {
  const r = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "a",
      "-show_entries",
      "stream=codec_type",
      "-of",
      "csv=p=0",
      file,
    ],
    { encoding: "utf8" },
  );
  return Boolean((r.stdout || "").trim());
}

function listMoralIds() {
  return readdirSync(STORIES, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^story_moral_\d+$/.test(d.name))
    .map((d) => d.name)
    .sort();
}

function muxScene(dir, sceneStem, workDir) {
  const video = join(dir, `${sceneStem}.mp4`);
  const audio = join(dir, `${sceneStem}.mp3`);
  const out = join(workDir, `${sceneStem}_muxed.mp4`);
  if (!existsSync(video)) throw new Error(`Missing ${video}`);
  if (!existsSync(audio)) throw new Error(`Missing ${audio}`);
  // Loop/shorten video to audio length so narration is never cut off.
  run("ffmpeg", [
    "-y",
    "-i",
    video,
    "-i",
    audio,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    "-movflags",
    "+faststart",
    out,
  ]);
  return out;
}

function buildFromScenes(storyId, dir, outFile) {
  const workDir = join(OUT, `.work_${storyId}`);
  mkdirSync(workDir, { recursive: true });
  try {
    const sceneVideos = readdirSync(dir)
      .filter((f) => /^scene\d+\.mp4$/i.test(f))
      .sort((a, b) => {
        const na = Number(a.match(/\d+/)?.[0] || 0);
        const nb = Number(b.match(/\d+/)?.[0] || 0);
        return na - nb;
      });
    if (!sceneVideos.length) throw new Error(`No sceneN.mp4 in ${dir}`);

    const muxed = [];
    for (const file of sceneVideos) {
      const stem = file.replace(/\.mp4$/i, "");
      console.log(`  mux ${stem}`);
      muxed.push(muxScene(dir, stem, workDir));
    }

    const listFile = join(workDir, "concat.txt");
    writeFileSync(
      listFile,
      muxed.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n"),
      "utf8",
    );
    run("ffmpeg", [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      outFile,
    ]);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

mkdirSync(OUT, { recursive: true });
const ids = ONE ? [ONE] : listMoralIds();
console.log(`Building ${ids.length} complete bedtime film(s) → ${OUT}`);
console.log("Source folders under public/stories are kept untouched.");

let ok = 0;
let fail = 0;
for (const id of ids) {
  const dir = join(STORIES, id);
  const outFile = join(OUT, `${id}.mp4`);
  const existing = join(dir, "story.mp4");
  try {
    if (!existsSync(dir)) throw new Error(`Missing ${dir}`);
    if (existsSync(existing) && hasAudioStream(existing)) {
      copyFileSync(existing, outFile);
      console.log(`COPY  ${id} (story.mp4 already has voice)`);
    } else {
      console.log(`BUILD ${id} (mux scenes + voice)`);
      buildFromScenes(id, dir, outFile);
    }
    if (!hasAudioStream(outFile)) {
      throw new Error("Output has no audio track");
    }
    ok += 1;
  } catch (e) {
    fail += 1;
    console.error(`FAIL  ${id}:`, e.message ?? e);
  }
}

console.log(`\nDone. ok=${ok} fail=${fail}`);
console.log("Upload these files to YouTube, then paste watch URLs into bedtimeStories.ts youtube_url_en.");
console.log("Do NOT delete public/stories/story_moral_* until YouTube embeds are wired.");
if (fail) process.exit(1);
