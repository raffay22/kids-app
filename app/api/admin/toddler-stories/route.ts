import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

function slugifyStoryId(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
  return `story_toddler_${base || "cms"}_${Date.now().toString(36)}`;
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("toddler_stories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("schema cache") || error.code === "PGRST204") {
      return NextResponse.json({ stories: [], missingTable: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stories: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const video_url = String(body.video_url ?? "").trim();
  const thumbnail_url = String(body.thumbnail_url ?? "").trim() || null;
  const theme = String(body.theme ?? "adventure").trim() || "adventure";
  const narrative_text = String(body.narrative_text ?? "").trim() || null;
  const story_id = String(body.story_id ?? "").trim() || slugifyStoryId(title);

  if (!title || !video_url) {
    return NextResponse.json(
      { error: "Title and Supabase Storage video_url are required." },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("toddler_stories")
    .insert({
      story_id,
      title,
      theme,
      video_url,
      thumbnail_url,
      narrative_text,
      sort_order: Number(body.sort_order) || 0,
      is_active: body.is_active !== false,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ story: data }, { status: 201 });
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
    .from("toddler_stories")
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ story: data });
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
    .from("toddler_stories")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
