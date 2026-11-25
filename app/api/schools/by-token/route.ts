import { NextResponse } from "next/server";
import { resolveSchoolMonthlyPrice } from "@/lib/partnerSchools";
import { createClient } from "@/utils/supabase/server";

/** Public lookup for signup invite preview (active schools only). */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("school_token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "school_token required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partner_schools")
      .select(
        "id, school_name, city, school_code, school_token, discount_type, discount_percentage, custom_price_pkr, is_active, joined_students_count",
      )
      .eq("school_token", token)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Invalid or expired school invite" }, { status: 404 });
    }

    const monthly_price_pkr = resolveSchoolMonthlyPrice(data);
    return NextResponse.json({
      school: {
        ...data,
        monthly_price_pkr,
        granted_basic_pro: monthly_price_pkr <= 0,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }
}
