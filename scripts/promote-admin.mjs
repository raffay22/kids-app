/**
 * Promote maria.umeed1987@gmail.com (or --email) to admin in Supabase.
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 *   node scripts/promote-admin.mjs
 *   node scripts/promote-admin.mjs --email someone@example.com
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const emailArg = process.argv.find((a) => a.startsWith("--email="));
const email =
  (emailArg ? emailArg.slice("--email=".length) : null) ||
  process.env.ADMIN_EMAIL ||
  "maria.umeed1987@gmail.com";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const target = email.trim().toLowerCase();

const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listError) {
  console.error("listUsers failed:", listError.message);
  process.exit(1);
}

const user = usersData.users.find((u) => (u.email || "").toLowerCase() === target);
if (!user) {
  console.error(`No auth user found for ${target}. Sign up with that email first, then re-run.`);
  process.exit(2);
}

const { error: upsertError } = await supabase.from("profiles").upsert(
  {
    id: user.id,
    parent_email: user.email,
    is_admin: true,
  },
  { onConflict: "id" },
);

if (upsertError) {
  // Fallback: update only
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_admin: true, parent_email: user.email })
    .eq("id", user.id);
  if (updateError) {
    console.error("Failed to set is_admin:", updateError.message);
    process.exit(1);
  }
}

console.log(`OK — ${target} is now admin (user id ${user.id}).`);
