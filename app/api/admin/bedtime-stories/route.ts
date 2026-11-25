import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";
import { getYouTubeVideoId } from "@/utils/bedtimeStories";

export const dynamic = "force-dynamic";

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return getYouTubeVideoId(trimmed);
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("bedtime_stories")
    .select("*")
    .order("story_number", { ascending: true });

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
  const moral_lesson = String(body.moral_lesson ?? "").trim() || null;
  const theme = String(body.theme ?? "kindness").trim() || "kindness";
  const blurb = String(body.blurb ?? "").trim() || moral_lesson;
  const youtubeInput = String(body.youtube_id ?? body.youtube_url ?? "").trim();
  const youtube_id = extractYouTubeId(youtubeInput);

  if (!title || !youtube_id) {
    return NextResponse.json(
      { error: "Title and a valid YouTube URL or 11-character video ID are required." },
      { status: 400 },
    );
  }

  // Determine next story_number if not provided
  let story_number = Number(body.story_number);
  if (!Number.isFinite(story_number) || story_number <= 0) {
    const { data: maxRow } = await auth.supabase
      .from("bedtime_stories")
      .select("story_number")
      .order("story_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    story_number = (maxRow?.story_number ?? 18) + 1;
  }

  const padded = String(story_number).padStart(2, "0");
  const story_id = String(body.story_id ?? "").trim() || `story_moral_${padded}`;
  const cover_image =
    String(body.cover_image ?? "").trim() ||
    `https://img.youtube.com/vi/${youtube_id}/hqdefault.jpg`;

  const { data, error } = await auth.supabase
    .from("bedtime_stories")
    .insert({
      story_number,
      story_id,
      title,
      youtube_id,
      moral_lesson,
      theme,
      blurb,
      cover_image,
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

  if (typeof rest.youtube_id === "string") {
    const parsed = extractYouTubeId(rest.youtube_id);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid YouTube URL or ID" }, { status: 400 });
    }
    rest.youtube_id = parsed;
    if (!rest.cover_image) {
      rest.cover_image = `https://img.youtube.com/vi/${parsed}/hqdefault.jpg`;
    }
  }

  const { data, error } = await auth.supabase
    .from("bedtime_stories")
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
    .from("bedtime_stories")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
