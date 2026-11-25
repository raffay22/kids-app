import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("payment_submissions")
    .select("*, profiles!user_id(parent_email, child_nickname)")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("schema cache") || error.code === "PGRST204") {
      return NextResponse.json({ submissions: [], missingTable: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
