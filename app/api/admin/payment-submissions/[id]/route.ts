import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action === "reject" ? "reject" : "approve";

  const { data: sub, error: fetchErr } = await auth.supabase
    .from("payment_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !sub) {
    return NextResponse.json(
      { error: fetchErr?.message ?? "Payment submission not found" },
      { status: 404 },
    );
  }

  if (action === "reject") {
    const { error: rejErr } = await auth.supabase
      .from("payment_submissions")
      .update({
        status: "rejected",
        approved_by: auth.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (rejErr) {
      return NextResponse.json({ error: rejErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  // Approve submission & activate Pro on the user's profile
  const now = new Date().toISOString();
  const { error: updateSubErr } = await auth.supabase
    .from("payment_submissions")
    .update({
      status: "approved",
      approved_by: auth.user.id,
      approved_at: now,
    })
    .eq("id", id);

  if (updateSubErr) {
    return NextResponse.json({ error: updateSubErr.message }, { status: 500 });
  }

  // Flip user profile to Pro (both is_pro and subscription_status = 'pro')
  let { error: profErr } = await auth.supabase
    .from("profiles")
    .update({
      is_pro: true,
      subscription_status: "pro",
      updated_at: now,
    })
    .eq("id", sub.user_id);

  // Fallback if is_pro column wasn't migrated yet
  if (profErr && profErr.message.includes("is_pro")) {
    const retry = await auth.supabase
      .from("profiles")
      .update({
        subscription_status: "pro",
        updated_at: now,
      })
      .eq("id", sub.user_id);
    profErr = retry.error;
  }

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "approved", userId: sub.user_id });
}
