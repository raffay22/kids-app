import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

/**
 * Extra passphrase gate after is_admin.
 * Set ADMIN_DASHBOARD_PIN in env; empty pin disables the extra gate (admin-only still required).
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const expected = (process.env.ADMIN_DASHBOARD_PIN ?? "").trim();
  if (!expected) {
    return NextResponse.json({ ok: true, pinRequired: false });
  }

  const body = await request.json().catch(() => ({}));
  const pin = String(body?.pin ?? "").trim();
  if (pin !== expected) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, pinRequired: true });
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const expected = (process.env.ADMIN_DASHBOARD_PIN ?? "").trim();
  return NextResponse.json({ pinRequired: Boolean(expected) });
}
