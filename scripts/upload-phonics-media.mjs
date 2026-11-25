/**
 * Upload phonics media to Supabase `phonics` bucket.
 *
 *   node scripts/upload-phonics-media.mjs --all
 *   node scripts/upload-phonics-media.mjs --card a1_apple
 *
 * Prefer `upload-all-phonics-media.mjs` for the full A–Z batch.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const args = process.argv.slice(2);
if (args.includes("--all")) {
  const r = spawnSync(process.execPath, ["scripts/upload-all-phonics-media.mjs"], {
    cwd: resolve(process.cwd()),
    stdio: "inherit",
  });
  process.exit(r.status ?? 1);
}

if (args[0] === "--card" && args[1]) {
  console.error(
    "Single-card upload: use upload-all or extend this script. Requested:",
    args[1],
  );
  process.exit(1);
}

console.error("Usage: node scripts/upload-phonics-media.mjs --all");
process.exit(1);
