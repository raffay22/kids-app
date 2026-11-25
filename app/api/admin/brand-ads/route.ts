import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("brand_ads")
    .select("*")
    .order("placement", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ads: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const brand_name = String(body.brand_name ?? "").trim();
  const media_url = String(body.media_url ?? "").trim();
  const placement = String(body.placement ?? "").trim();
  const media_type = body.media_type === "video" ? "video" : "image";

  if (!brand_name || !media_url || !placement) {
    return NextResponse.json(
      { error: "brand_name, media_url, and placement are required" },
      { status: 400 },
    );
  }

  const row = {
    brand_name,
    headline: String(body.headline ?? "").trim() || null,
    media_type,
    media_url,
    media_path: String(body.media_path ?? "").trim() || null,
    click_url: String(body.click_url ?? "").trim() || null,
    whatsapp_phone: String(body.whatsapp_phone ?? "").replace(/\D/g, "") || null,
    whatsapp_message: String(body.whatsapp_message ?? "").trim() || null,
    placement,
    target_page_route: String(body.target_page_route ?? "").trim() || null,
    banner_position: ["TOP_HEADER", "INLINE", "FOOTER_INLINE"].includes(body.banner_position)
      ? body.banner_position
      : "INLINE",
    monthly_rent_pkr: Number(body.monthly_rent_pkr ?? 0) || 0,
    brand_contact_email: String(body.brand_contact_email ?? "").trim() || null,
    is_active: body.is_active !== false,
    sort_order: Number(body.sort_order ?? 0) || 0,
  };

  const { data, error } = await auth.supabase
    .from("brand_ads")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ad: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const allowed = [
    "brand_name",
    "headline",
    "media_type",
    "media_url",
    "media_path",
    "click_url",
    "whatsapp_phone",
    "whatsapp_message",
    "placement",
    "target_page_route",
    "banner_position",
    "monthly_rent_pkr",
    "brand_contact_email",
    "is_active",
    "sort_order",
    "starts_at",
    "ends_at",
  ] as const;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) {
      if (key === "whatsapp_phone") {
        updates[key] = String(body[key] ?? "").replace(/\D/g, "") || null;
      } else if (key === "is_active") {
        updates[key] = Boolean(body[key]);
      } else if (key === "monthly_rent_pkr" || key === "sort_order") {
        updates[key] = Number(body[key] ?? 0) || 0;
      } else if (key === "media_type") {
        updates[key] = body[key] === "video" ? "video" : "image";
      } else {
        const v = body[key];
        updates[key] = typeof v === "string" ? v.trim() || null : v;
      }
    }
  }

  const { data, error } = await auth.supabase
    .from("brand_ads")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ad: data });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { data: existing } = await auth.supabase
    .from("brand_ads")
    .select("media_path")
    .eq("id", id)
    .maybeSingle();

  if (existing?.media_path) {
    await auth.supabase.storage.from("brand-ads").remove([existing.media_path]);
  }

  const { error } = await auth.supabase.from("brand_ads").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
