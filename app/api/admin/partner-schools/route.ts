import { NextResponse } from "next/server";
import {
  makeSchoolCode,
  randomSchoolToken,
  type SchoolDiscountType,
} from "@/lib/partnerSchools";
import { requireAdmin } from "@/utils/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("partner_schools")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schools: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const school_name = String(body.school_name ?? "").trim();
  const city = String(body.city ?? "").trim() || null;
  const discount_type = String(body.discount_type ?? "FREE_100") as SchoolDiscountType;
  const discount_percentage = Number(body.discount_percentage ?? 100);
  const custom_price_pkr = Number(body.custom_price_pkr ?? 0);

  if (!school_name) {
    return NextResponse.json({ error: "School name required" }, { status: 400 });
  }

  const school_code =
    String(body.school_code ?? "").trim() || makeSchoolCode(school_name, city);
  const school_token = String(body.school_token ?? "").trim() || randomSchoolToken();

  const { data, error } = await auth.supabase
    .from("partner_schools")
    .insert({
      school_name,
      city,
      school_code,
      school_token,
      discount_type,
      discount_percentage,
      custom_price_pkr,
      is_active: true,
      joined_students_count: 0,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ school: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { id, action, ...updates } = body as {
    id?: string;
    action?: "revoke" | "reactivate" | "rotate";
    school_name?: string;
    city?: string | null;
    discount_type?: SchoolDiscountType;
    discount_percentage?: number;
    custom_price_pkr?: number;
    is_active?: boolean;
  };

  if (!id) {
    return NextResponse.json({ error: "School id required" }, { status: 400 });
  }

  if (action === "revoke") {
    const newToken = randomSchoolToken();
    const { data, error } = await auth.supabase
      .from("partner_schools")
      .update({
        is_active: false,
        school_token: newToken,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ school: data, revoked: true });
  }

  if (action === "rotate") {
    const newToken = randomSchoolToken();
    const { data, error } = await auth.supabase
      .from("partner_schools")
      .update({
        school_token: newToken,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ school: data, rotated: true });
  }

  if (action === "reactivate") {
    updates.is_active = true;
  }

  const { data, error } = await auth.supabase
    .from("partner_schools")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ school: data });
}
