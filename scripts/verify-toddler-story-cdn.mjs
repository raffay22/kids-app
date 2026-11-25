/**
 * HEAD-check every toddler media path from iqStories against story-animations CDN.
 *
 *   node scripts/verify-toddler-story-cdn.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());

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

const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
if (!base) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const src = readFileSync(resolve(ROOT, "utils", "iqStories.ts"), "utf8");
const paths = [
  ...new Set(
    [...src.matchAll(/\/stories\/story_toddler_\d{2}\/[A-Za-z0-9_.-]+/g)].map(
      (m) => m[0],
    ),
  ),
].sort();

console.log(`Checking ${paths.length} toddler CDN objects…`);

const fails = [];
let ok = 0;
for (const localPath of paths) {
  const objectPath = localPath.replace(/^\/stories\//, "");
  const url = `${base}/storage/v1/object/public/story-animations/${objectPath}`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) {
      ok += 1;
    } else {
      fails.push(`${res.status} ${objectPath}`);
    }
  } catch (e) {
    fails.push(`ERR ${objectPath} ${e.message ?? e}`);
  }
}

console.log(`ok=${ok} fail=${fails.length}`);
if (fails.length) {
  console.log("--- fails ---");
  for (const line of fails) console.log(line);
  process.exit(1);
}
console.log("All toddler story CDN objects reachable.");
