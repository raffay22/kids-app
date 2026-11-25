import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("printable_worksheets")
    .select("*")
    .order("age_group", { ascending: true })
    .order("category", { ascending: true });

  if (error) {
    if (error.message.includes("schema cache") || error.code === "PGRST204") {
      return NextResponse.json({ worksheets: [], missingTable: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ worksheets: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const {
    title,
    age_group,
    category,
    description,
    file_name,
    storage_path,
    pdf_url,
    total_pages = 50,
    file_size,
    price_pkr = 150,
    drip_unlock_at,
    is_active = true,
  } = body;

  if (!title || !age_group || !category || !file_name || !storage_path) {
    return NextResponse.json(
      { error: "title, age_group, category, file_name, storage_path required" },
      { status: 400 },
    );
  }

  const insertPayload: Record<string, unknown> = {
    title,
    age_group,
    category,
    description: description ?? null,
    file_name,
    storage_path,
    total_pages,
    file_size: file_size ?? null,
    price_pkr,
    drip_unlock_at: drip_unlock_at || null,
    is_active,
  };
  if (pdf_url) {
    insertPayload.pdf_url = pdf_url;
  }

  let { data, error } = await auth.supabase
    .from("printable_worksheets")
    .insert(insertPayload)
    .select("*")
    .single();

  // Fallback if pdf_url column has not been migrated yet
  if (error && error.message.includes("pdf_url")) {
    delete insertPayload.pdf_url;
    const retry = await auth.supabase
      .from("printable_worksheets")
      .insert(insertPayload)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ worksheet: data }, { status: 201 });
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
    .from("printable_worksheets")
    .update(rest)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ worksheet: data });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("printable_worksheets")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
