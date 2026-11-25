import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: data });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const {
    code,
    discount_percent,
    plan_type,
    expires_at,
    usage_limit,
    is_active = true,
  } = body;

  if (!code || !discount_percent) {
    return NextResponse.json({ error: "Code and discount required" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("coupons")
    .insert({
      code: String(code).toUpperCase(),
      discount_percent,
      plan_type: plan_type ?? "both",
      expires_at: expires_at || null,
      usage_limit: usage_limit ?? null,
      is_active,
      created_by: auth.user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Coupon id required" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("coupons")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data });
}
