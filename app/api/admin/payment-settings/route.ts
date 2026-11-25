import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";
import { DEFAULT_PAYMENT_SETTINGS } from "@/app/api/payment-settings/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("payment_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    if (error.message.includes("schema cache") || error.code === "PGRST204") {
      return NextResponse.json({
        settings: DEFAULT_PAYMENT_SETTINGS,
        missingTable: true,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS });
  }

  return NextResponse.json({
    settings: {
      bankName: data.bank_name ?? DEFAULT_PAYMENT_SETTINGS.bankName,
      accountTitle: data.account_title ?? DEFAULT_PAYMENT_SETTINGS.accountTitle,
      accountNumber: data.account_number ?? "",
      jazzcashNumber: data.jazzcash_number ?? "",
      easypaisaNumber: data.easypaisa_number ?? "",
      proPriceDisplay:
        data.pro_price_display ?? DEFAULT_PAYMENT_SETTINGS.proPriceDisplay,
    },
  });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const payload = {
    id: "default",
    bank_name: String(body.bankName ?? "").trim(),
    account_title: String(body.accountTitle ?? "").trim(),
    account_number: String(body.accountNumber ?? "").trim(),
    jazzcash_number: String(body.jazzcashNumber ?? "").trim(),
    easypaisa_number: String(body.easypaisaNumber ?? "").trim(),
    pro_price_display:
      String(body.proPriceDisplay ?? "").trim() || "Rs. 1,500 / Month",
    updated_at: new Date().toISOString(),
  };

  if (!payload.bank_name || !payload.account_title || !payload.account_number) {
    return NextResponse.json(
      { error: "Bank Name, Account Title, and Account Number / IBAN are required." },
      { status: 400 },
    );
  }

  const { error } = await auth.supabase
    .from("payment_settings")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    settings: {
      bankName: payload.bank_name,
      accountTitle: payload.account_title,
      accountNumber: payload.account_number,
      jazzcashNumber: payload.jazzcash_number,
      easypaisaNumber: payload.easypaisa_number,
      proPriceDisplay: payload.pro_price_display,
    },
  });
}
