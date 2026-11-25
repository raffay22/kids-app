import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { StoryRecord } from "@/utils/iqStories";

export const dynamic = "force-dynamic";

type DbToddlerRow = {
  id: string;
  story_id: string;
  title: string;
  theme: string | null;
  video_url: string;
  thumbnail_url: string | null;
  narrative_text: string | null;
  is_active: boolean;
  sort_order: number | null;
};

function mapDbToddlerStory(row: DbToddlerRow): StoryRecord {
  const narrative = row.narrative_text?.trim() || `Enjoy ${row.title}!`;
  return {
    id: row.id,
    story_id: row.story_id,
    title: row.title,
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: row.theme || "adventure",
    is_active: row.is_active !== false,
    cover_image: row.thumbnail_url || undefined,
    content: {
      story_id: row.story_id,
      title: row.title,
      target_age_group: "1-3",
      theme: row.theme || "adventure",
      scenes: [
        {
          scene_number: 1,
          narrative_text: narrative,
          audio_prompt: narrative,
          video_url: row.video_url,
        },
      ],
    },
  };
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ source: "static", stories: [] });
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("toddler_stories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data?.length) {
      return NextResponse.json({ source: "static", stories: [] });
    }

    return NextResponse.json({
      source: "db",
      stories: (data as DbToddlerRow[]).map(mapDbToddlerStory),
    });
  } catch {
    return NextResponse.json({ source: "static", stories: [] });
  }
}
