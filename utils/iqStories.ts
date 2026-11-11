/**
 * IQ Story types, fetch helpers, and offline fallback decks.
 */
import { createClient } from "@/utils/supabase/client";

export type StoryPuzzle = {
  type: "shape_tangram" | "pattern_sequence" | "odd_one_out" | "color_match" | "object_match";
  correct_shape?: string;
  correct_answer?: string;
  correct_odd_item?: string;
  target_color?: string;
  options?: string[];
  sequence?: string[];
};

export type StoryTapTarget = {
  /** What the child should tap, e.g. "red starfish" */
  label: string;
  color?: string;
  /** Percent-based hotspot over the video (0–100). */
  hotspot?: { left: number; top: number; width: number; height: number };
};

export type StorySceneData = {
  scene_number: number;
  narrative_text: string;
  audio_prompt: string;
  lottie_animation?: string;
  lottie_animation_url?: string;
  visual_asset_keyword?: string;
  interaction_type?: string;
  /** Looping / VO-timed scene video */
  video_url?: string;
  /** Plays after a correct tap (e.g. starfish wakes) */
  wake_video_url?: string;
  /** ElevenLabs (or other) narration for this scene */
  audio_url?: string;
  tap_target?: StoryTapTarget;
  puzzle?: StoryPuzzle;
};

export type StoryContent = {
  story_id?: string;
  title?: string;
  target_age_group?: string;
  difficulty_level?: string;
  theme?: string;
  character_name?: string;
  scenes: StorySceneData[];
};

export type StoryRecord = {
  id: string;
  story_id: string;
  title: string;
  target_age_group: "1-3" | "3-6";
  difficulty_level: string;
  theme: string;
  content: StoryContent;
  is_active: boolean;
  /** Video-frame cover for library cards (no separate AI still). */
  cover_image?: string;
};

export type StoryAgeGroup = "1-3" | "3-6";

const FALLBACK_TODDLER: StoryRecord[] = [
  {
    id: "fb-t1",
    story_id: "story_toddler_01",
    title: "Sammy the Turtle's Slow Swim",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "ocean",
    is_active: true,
    cover_image: "/stories/story_toddler_01/cover.jpg",
    content: {
      story_id: "story_toddler_01",
      title: "Sammy the Turtle's Slow Swim",
      target_age_group: "1-3",
      theme: "ocean",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Sammy the turtle wants to swim home. Help him glide slowly through the water!",
          audio_prompt:
            "Sammy the turtle wants to swim home. Help him glide slowly through the water!",
          visual_asset_keyword: "turtle",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_01/scene1.mp4",
          audio_url: "/stories/story_toddler_01/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text:
            "Oh look! A red starfish is sleeping. Tap the RED starfish to wake it up!",
          audio_prompt:
            "Oh look! A red starfish is sleeping. Tap the RED starfish to wake it up!",
          visual_asset_keyword: "starfish",
          interaction_type: "tap_wake",
          video_url: "/stories/story_toddler_01/scene2_sleep.mp4",
          wake_video_url: "/stories/story_toddler_01/scene2_wake.mp4",
          audio_url: "/stories/story_toddler_01/scene2.mp3",
          tap_target: {
            label: "red starfish",
            color: "red",
            // Tuned against scene2_sleep screenshot: cover the whole red starfish.
            hotspot: { left: 9, top: 30, width: 26, height: 40 },
          },
          puzzle: {
            type: "color_match",
            target_color: "red",
            options: ["blue", "red", "yellow"],
            correct_answer: "red",
          },
        },
      ],
    },
  },
  {
    id: "fb-t2",
    story_id: "story_toddler_02",
    title: "The Sleepy Bear's Nest",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "animals",
    is_active: true,
    cover_image: "/stories/story_toddler_02/cover.jpg",
    content: {
      story_id: "story_toddler_02",
      title: "The Sleepy Bear's Nest",
      target_age_group: "1-3",
      theme: "animals",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Bear is very tired after a long day. Touch and hold the screen to help Bear breathe softly.",
          audio_prompt:
            "Bear is very tired after a long day. Touch and hold the screen to help Bear breathe softly.",
          visual_asset_keyword: "bear",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_02/scene1_breathe.mp4",
          wake_video_url: "/stories/story_toddler_02/scene1_calm.mp4",
          audio_url: "/stories/story_toddler_02/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Which blanket is SOFT and BLUE for Bear?",
          audio_prompt: "Which blanket is SOFT and BLUE for Bear?",
          visual_asset_keyword: "blanket",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_02/scene2_blankets.mp4",
          wake_video_url: "/stories/story_toddler_02/scene2_blue.mp4",
          audio_url: "/stories/story_toddler_02/scene2.mp3",
          tap_target: {
            label: "blue blanket",
            color: "blue",
            hotspot: { left: 38, top: 42, width: 28, height: 36 },
          },
          puzzle: {
            type: "color_match",
            target_color: "blue",
            options: ["green", "blue", "orange"],
            correct_answer: "blue",
          },
        },
      ],
    },
  },
];

const FALLBACK_EXPLORER: StoryRecord[] = [
  {
    id: "fb-e1",
    story_id: "story_kids_fb1",
    title: "Rocket Launch & Star Collection",
    target_age_group: "3-6",
    difficulty_level: "easy",
    theme: "space",
    is_active: true,
    content: {
      character_name: "Leo",
      scenes: [
        {
          scene_number: 1,
          narrative_text: "Leo needs star power for the rocket! Tap the glowing sun to charge up!",
          audio_prompt: "Tap the glowing sun to charge the rocket!",
          visual_asset_keyword: "sun",
          lottie_animation: "/lottie/sun.json",
        },
        {
          scene_number: 2,
          narrative_text: "Which shape fits the rocket wing? Pick the TRIANGLE!",
          audio_prompt: "Which shape is a triangle?",
          visual_asset_keyword: "ball",
          puzzle: {
            type: "shape_tangram",
            correct_shape: "triangle",
            options: ["square", "triangle", "circle"],
          },
        },
      ],
    },
  },
  {
    id: "fb-e2",
    story_id: "story_kids_fb2",
    title: "The Friendly Elephant Splash",
    target_age_group: "3-6",
    difficulty_level: "easy",
    theme: "jungle",
    is_active: true,
    content: {
      character_name: "Ellie",
      scenes: [
        {
          scene_number: 1,
          narrative_text: "Ellie the elephant loves splashing! Tap the water to make a splash!",
          audio_prompt: "Tap the water to splash!",
          visual_asset_keyword: "water",
          lottie_animation: "/lottie/water.json",
        },
        {
          scene_number: 2,
          narrative_text: "Red apple, blue ball, red hat… what comes next?",
          audio_prompt: "Red apple, blue ball, red hat. What comes next?",
          visual_asset_keyword: "apple",
          puzzle: {
            type: "pattern_sequence",
            sequence: ["red_apple", "blue_ball", "red_hat"],
            correct_answer: "blue_ball",
            options: ["red_apple", "blue_ball", "green_tree"],
          },
        },
      ],
    },
  },
];

export function getSceneLottieUrl(scene: StorySceneData): string | undefined {
  return scene.lottie_animation_url ?? scene.lottie_animation;
}

export function getSceneVisualWord(scene: StorySceneData): string {
  return scene.visual_asset_keyword ?? "star";
}

export function normalizeStory(raw: Record<string, unknown>): StoryRecord {
  let content = raw.content as StoryContent | string;
  if (typeof content === "string") {
    try {
      content = JSON.parse(content) as StoryContent;
    } catch {
      content = { scenes: [] };
    }
  }
  if (!content.scenes) {
    content = { ...content, scenes: [] };
  }

  const storyId = String(raw.story_id);
  const coverFromRow =
    typeof raw.cover_image === "string" && raw.cover_image
      ? raw.cover_image
      : typeof (content as StoryContent & { cover_image?: string }).cover_image === "string"
        ? (content as StoryContent & { cover_image?: string }).cover_image
        : undefined;

  return {
    id: String(raw.id ?? raw.story_id),
    story_id: storyId,
    title: String(raw.title),
    target_age_group: (raw.target_age_group as StoryAgeGroup) ?? "3-6",
    difficulty_level: String(raw.difficulty_level ?? "beginner"),
    theme: String(raw.theme ?? "general"),
    content,
    is_active: raw.is_active !== false,
    cover_image: coverFromRow ?? `/stories/${storyId}/cover.jpg`,
  };
}

export function getStoryCoverUrl(story: StoryRecord): string | null {
  if (story.cover_image) return story.cover_image;
  const firstVideo = story.content.scenes.find((s) => s.video_url)?.video_url;
  if (!firstVideo) return null;
  return `/stories/${story.story_id}/cover.jpg`;
}

export function findStoryById(
  stories: StoryRecord[],
  storyId: string,
): StoryRecord | undefined {
  return stories.find((s) => s.story_id === storyId);
}

export function getAdjacentStoryIds(
  stories: StoryRecord[],
  storyId: string,
): { prevId: string | null; nextId: string | null; index: number } {
  const index = stories.findIndex((s) => s.story_id === storyId);
  if (index < 0) return { prevId: null, nextId: null, index: -1 };
  return {
    index,
    prevId: index > 0 ? stories[index - 1].story_id : null,
    nextId: index < stories.length - 1 ? stories[index + 1].story_id : null,
  };
}

export function getFallbackStories(ageGroup: StoryAgeGroup): StoryRecord[] {
  return ageGroup === "1-3" ? FALLBACK_TODDLER : FALLBACK_EXPLORER;
}

function storyHasLocalMedia(story: StoryRecord): boolean {
  return story.content.scenes.some((scene) => Boolean(scene.video_url || scene.audio_url));
}

/** Merge remote + local decks; local media-produced stories always win. */
export function mergeStoryDecks(
  remote: StoryRecord[],
  local: StoryRecord[],
): StoryRecord[] {
  const byId = new Map<string, StoryRecord>();
  for (const story of remote) byId.set(story.story_id, story);
  for (const story of local) {
    if (storyHasLocalMedia(story) || !byId.has(story.story_id)) {
      byId.set(story.story_id, story);
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.story_id.localeCompare(b.story_id));
}

export async function fetchStories(ageGroup: StoryAgeGroup): Promise<StoryRecord[]> {
  const local = getFallbackStories(ageGroup);
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("is_active", true)
      .eq("target_age_group", ageGroup)
      .order("story_id", { ascending: true });

    if (error || !data?.length) return local;
    const remote = data.map((row) => normalizeStory(row as Record<string, unknown>));
    return mergeStoryDecks(remote, local);
  } catch {
    return local;
  }
}
