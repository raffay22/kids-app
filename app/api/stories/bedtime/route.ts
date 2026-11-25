import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { BEDTIME_STORIES, type BedtimeStory } from "@/utils/bedtimeStories";

export const dynamic = "force-dynamic";

type DbBedtimeRow = {
  id: string;
  story_number: number;
  story_id: string;
  title: string;
  youtube_id: string;
  moral_lesson: string | null;
  theme: string | null;
  blurb: string | null;
  cover_image: string | null;
  is_active: boolean;
};

function mapDbBedtimeStory(row: DbBedtimeRow): BedtimeStory {
  const ytId = row.youtube_id.trim();
  const cover =
    row.cover_image?.trim() ||
    (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "");
  return {
    story_id: row.story_id,
    title: row.title,
    theme: row.theme || "kindness",
    moral: row.moral_lesson ?? undefined,
    cover_image: cover,
    video_url: null,
    youtube_url_en: ytId ? `https://www.youtube.com/watch?v=${ytId}` : null,
    is_ready: Boolean(ytId),
    blurb: row.blurb || row.moral_lesson || "A cozy bedtime moral story.",
  };
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({
      source: "static",
      stories: BEDTIME_STORIES,
    });
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("bedtime_stories")
      .select("*")
      .eq("is_active", true)
      .order("story_number", { ascending: true });

    if (error || !data?.length) {
      return NextResponse.json({
        source: "static",
        stories: BEDTIME_STORIES,
      });
    }

    return NextResponse.json({
      source: "db",
      stories: (data as DbBedtimeRow[]).map(mapDbBedtimeStory),
    });
  } catch {
    return NextResponse.json({
      source: "static",
      stories: BEDTIME_STORIES,
    });
  }
}
