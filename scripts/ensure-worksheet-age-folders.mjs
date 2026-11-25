/**
 * Ensure public `worksheets` bucket exists with age/category folder placeholders.
 * Usage: node scripts/ensure-worksheet-age-folders.mjs
 */
import { createClient } from "@supabase/supabase-js";
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const ages = ["age-2-4", "age-4-6", "age-6-9"];
const cats = ["math", "english", "colouring"];
const paths = ages.flatMap((age) =>
  cats.map((cat) => `${age}/${cat}/.keep`),
);

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: buckets } = await supabase.storage.listBuckets();
const have = new Set((buckets ?? []).map((b) => b.id || b.name));
if (!have.has("worksheets")) {
  const { error } = await supabase.storage.createBucket("worksheets", {
    public: true,
    fileSizeLimit: "20MB",
  });
  if (error && !/already exists/i.test(error.message)) {
    console.error("create worksheets bucket:", error.message);
    process.exit(1);
  }
  console.log("CREATE worksheets");
} else {
  console.log("KEEP worksheets");
}

const body = new Blob(["# placeholder\n"], { type: "text/plain" });
for (const path of paths) {
  const { error } = await supabase.storage
    .from("worksheets")
    .upload(path, body, { upsert: true, contentType: "text/plain" });
  if (error) console.error(`FAIL ${path}:`, error.message);
  else console.log(`OK ${path}`);
}

console.log("Done age/category folders.");
