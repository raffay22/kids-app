import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  mapDbWorksheet,
  STATIC_PRINTABLE_WORKSHEETS,
} from "@/utils/printableWorksheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({
      source: "static",
      worksheets: STATIC_PRINTABLE_WORKSHEETS,
    });
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("printable_worksheets")
      .select("*")
      .eq("is_active", true)
      .order("age_group", { ascending: true });

    if (error || !data?.length) {
      return NextResponse.json({
        source: "static",
        worksheets: STATIC_PRINTABLE_WORKSHEETS,
      });
    }

    return NextResponse.json({
      source: "db",
      worksheets: data.map(mapDbWorksheet),
    });
  } catch (err) {
    return NextResponse.json({
      source: "static",
      worksheets: STATIC_PRINTABLE_WORKSHEETS,
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}
