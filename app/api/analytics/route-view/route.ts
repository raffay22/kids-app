import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function sanitizeGranularRoute(raw: string): string | null {
  const path = raw.trim().split("?")[0].split("#")[0];
  if (!path || !path.startsWith("/")) return null;
  if (
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/brand-stats")
  ) {
    return null;
  }
  if (path.startsWith("/games/stories/bedtime/")) return "/games/stories/bedtime";
  if (path.startsWith("/games/stories/toddlers/")) return "/games/stories/toddlers";
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") : "/";
  return trimmed.slice(0, 120);
}

/**
 * Strictly anonymous route view recorder.
 * Never stores user IDs, personal details, cookies, or IP addresses.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const routePath = sanitizeGranularRoute(String(body.route_path ?? ""));

  if (!routePath) {
    return NextResponse.json({ ok: false, skipped: true });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ ok: false, reason: "supabase_not_configured" });
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase
      .from("route_views")
      .insert({ route_path: routePath });

    if (error) {
      return NextResponse.json({ ok: false });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
