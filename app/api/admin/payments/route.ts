import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("payment_requests")
    .select("*, profiles(parent_email, child_nickname)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payments = await Promise.all(
    (data ?? []).map(async (payment) => {
      if (!payment.receipt_path) return payment;

      const { data: signed } = await auth.supabase.storage
        .from("payment-slips")
        .createSignedUrl(payment.receipt_path, 3600);

      return { ...payment, receipt_url: signed?.signedUrl ?? null };
    }),
  );

  return NextResponse.json({ payments });
}
