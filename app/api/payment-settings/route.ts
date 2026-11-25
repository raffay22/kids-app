import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export type PaymentSettingsPayload = {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  jazzcashNumber: string;
  easypaisaNumber: string;
  proPriceDisplay: string;
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettingsPayload = {
  bankName: "Meezan Bank",
  accountTitle: "Growva Business",
  accountNumber: "",
  jazzcashNumber: "",
  easypaisaNumber: "",
  proPriceDisplay: "Rs. 1,500 / Month",
};

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS, source: "default" });
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS, source: "default" });
    }

    return NextResponse.json({
      source: "db",
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
  } catch {
    return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS, source: "default" });
  }
}
