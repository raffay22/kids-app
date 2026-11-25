import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;

  const { error } = await auth.supabase.rpc("approve_payment_request", {
    request_id: id,
    approver_id: auth.user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
