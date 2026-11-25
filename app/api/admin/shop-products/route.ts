import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("shop_products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    if (error.message.includes("schema cache") || error.code === "PGRST204") {
      return NextResponse.json({ products: [], missingTable: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const {
    slug,
    title,
    category,
    price_pkr,
    blurb,
    image_url,
    whatsapp_order_message,
    is_active = true,
    sort_order = 0,
  } = body;

  if (!title || !category) {
    return NextResponse.json({ error: "title and category required" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("shop_products")
    .insert({
      slug: slug || null,
      title,
      category,
      price_pkr: Number(price_pkr) || 0,
      blurb: blurb ?? null,
      image_url: image_url ?? null,
      whatsapp_order_message: whatsapp_order_message ?? null,
      is_active,
      sort_order: Number(sort_order) || 0,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ product: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { id, ...rest } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("shop_products")
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ product: data });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await auth.supabase.from("shop_products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
