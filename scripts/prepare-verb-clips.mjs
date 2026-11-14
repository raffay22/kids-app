/**
 * Copy/trim reusable story & phonics clips into public/flashcards/verbs/
 * as ~3s muted MP4s + JPG posters.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "flashcards", "verbs");
fs.mkdirSync(OUT, { recursive: true });

/** Existing project clips that already show a clear action. */
const REUSE = [
  {
    verb: "sleep",
    src: "public/stories/story_toddler_01/scene2_sleep.mp4",
  },
  {
    verb: "wake",
    src: "public/stories/story_toddler_01/scene2_wake.mp4",
  },
  {
    verb: "breathe",
    src: "public/stories/story_toddler_02/scene1_breathe.mp4",
  },
  {
    verb: "stretch",
    src: "public/stories/story_toddler_06/scene1_stretch.mp4",
  },
  {
    verb: "splash",
    src: "public/stories/story_toddler_07/scene1_splash.mp4",
  },
  {
    verb: "hop",
    src: "public/stories/story_toddler_08/scene1_hop.mp4",
  },
  {
    verb: "pull",
    src: "public/stories/story_toddler_09/scene1_pull.mp4",
  },
  {
    verb: "roll",
    src: "public/stories/story_toddler_10/scene1_roll.mp4",
  },
  {
    verb: "swing",
    src: "public/stories/story_toddler_11/scene1_swing.mp4",
  },
  {
    verb: "eat",
    src: "public/stories/story_toddler_12/scene1_eat.mp4",
  },
  {
    verb: "pat",
    src: "public/stories/story_toddler_13/scene1_pat.mp4",
  },
  {
    verb: "reach",
    src: "public/stories/story_toddler_14/scene1_reach.mp4",
  },
  {
    verb: "fly",
    src: "public/phonics/A/a2_aeroplane.mp4",
  },
  {
    verb: "swim",
    src: "public/phonics/D/d4_dolphin.mp4",
  },
];

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(cmd, args.join(" "), r.stderr || r.stdout);
    return false;
  }
  return true;
}

let ok = 0;
for (const item of REUSE) {
  const src = path.join(ROOT, item.src);
  if (!fs.existsSync(src)) {
    console.warn("missing", item.src);
    continue;
  }
  const mp4 = path.join(OUT, `${item.verb}.mp4`);
  const jpg = path.join(OUT, `${item.verb}.jpg`);

  // ~3s muted H.264 clip
  const cut = run("ffmpeg", [
    "-y",
    "-i",
    src,
    "-t",
    "3",
    "-an",
    "-vf",
    "scale=720:-2",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    mp4,
  ]);
  if (!cut) continue;

  run("ffmpeg", ["-y", "-i", mp4, "-frames:v", "1", "-q:v", "3", jpg]);
  ok += 1;
  console.log("OK", item.verb);
}

console.log(JSON.stringify({ prepared: ok, out: OUT }, null, 2));
