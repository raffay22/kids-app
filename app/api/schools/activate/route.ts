import { NextResponse } from "next/server";
import { resolveSchoolMonthlyPrice } from "@/lib/partnerSchools";
import { createClient } from "@/utils/supabase/server";

/**
 * Apply school_token to the signed-in parent after signup/login.
 * FREE_100 → Basic Pro (pro) at PKR 0; else store school price for checkout.
 */
export async function POST(request: Request) {
  let body: { school_token?: string } = {};
  try {
    body = (await request.json()) as { school_token?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = body.school_token?.trim();
  if (!token) {
    return NextResponse.json({ error: "school_token required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    // Prefer RPC when migration is applied
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "activate_school_partner",
      { p_token: token, p_user_id: user.id },
    );

    if (!rpcError && rpcData) {
      return NextResponse.json(rpcData);
    }

    // Fallback (when RPC not yet migrated): direct updates
    const { data: school, error: schoolError } = await supabase
      .from("partner_schools")
      .select("*")
      .eq("school_token", token)
      .eq("is_active", true)
      .maybeSingle();

    if (schoolError || !school) {
      return NextResponse.json(
        { error: rpcError?.message || schoolError?.message || "Invalid school invite" },
        { status: 404 },
      );
    }

    const monthly = resolveSchoolMonthlyPrice(school);
    const grantFree = monthly <= 0;
    const schoolCode = school.school_code || school.school_token;

    const profilePatch: Record<string, unknown> = {
      school_id: school.id,
      school_code: schoolCode,
      school_monthly_price_pkr: monthly,
      updated_at: new Date().toISOString(),
    };
    if (grantFree) {
      profilePatch.subscription_status = "pro";
      profilePatch.subscription_expires_at = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString();
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    await supabase
      .from("children")
      .update({ school_id: school.id, school_code: schoolCode })
      .eq("parent_user_id", user.id);

    await supabase
      .from("partner_schools")
      .update({
        joined_students_count: (school.joined_students_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", school.id);

    return NextResponse.json({
      ok: true,
      school_id: school.id,
      school_name: school.school_name,
      school_code: schoolCode,
      discount_type: school.discount_type,
      monthly_price_pkr: monthly,
      granted_basic_pro: grantFree,
      fallback: true,
      rpc_error: rpcError?.message,
    });
  } catch {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
}
