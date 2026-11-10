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

export type StorySceneData = {
  scene_number: number;
  narrative_text: string;
  audio_prompt: string;
  lottie_animation?: string;
  lottie_animation_url?: string;
  visual_asset_keyword?: string;
  interaction_type?: string;
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
};

export type StoryAgeGroup = "1-3" | "3-6";

const FALLBACK_TODDLER: StoryRecord[] = [
  {
    id: "fb-t1",
    story_id: "story_toddler_fb1",
    title: "Sammy the Turtle's Slow Swim",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "ocean",
    is_active: true,
    content: {
      scenes: [
        {
          scene_number: 1,
          narrative_text: "Sammy the turtle wants to swim home. Tap the blue water to help him glide!",
          audio_prompt: "Sammy the turtle wants to swim home. Tap the blue water!",
          visual_asset_keyword: "water",
          lottie_animation: "/lottie/water.json",
        },
        {
          scene_number: 2,
          narrative_text: "A red starfish is sleeping. Tap the RED starfish to wake it up!",
          audio_prompt: "Tap the RED starfish!",
          visual_asset_keyword: "fish",
          puzzle: {
            type: "color_match",
            target_color: "red",
            options: ["red", "blue", "green"],
            correct_answer: "red",
          },
        },
      ],
    },
  },
  {
    id: "fb-t2",
    story_id: "story_toddler_fb2",
    title: "Luna's Moonlight Nap",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "bedtime",
    is_active: true,
    content: {
      scenes: [
        {
          scene_number: 1,
          narrative_text: "Luna the bunny yawns at the moon. Tap the moon to say goodnight!",
          audio_prompt: "Tap the moon to say goodnight!",
          visual_asset_keyword: "moon",
          lottie_animation: "/lottie/moon.json",
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

  return {
    id: String(raw.id ?? raw.story_id),
    story_id: String(raw.story_id),
    title: String(raw.title),
    target_age_group: (raw.target_age_group as StoryAgeGroup) ?? "3-6",
    difficulty_level: String(raw.difficulty_level ?? "beginner"),
    theme: String(raw.theme ?? "general"),
    content,
    is_active: raw.is_active !== false,
  };
}

export function getFallbackStories(ageGroup: StoryAgeGroup): StoryRecord[] {
  return ageGroup === "1-3" ? FALLBACK_TODDLER : FALLBACK_EXPLORER;
}

export async function fetchStories(ageGroup: StoryAgeGroup): Promise<StoryRecord[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("is_active", true)
      .eq("target_age_group", ageGroup)
      .order("story_id", { ascending: true });

    if (error || !data?.length) return getFallbackStories(ageGroup);
    return data.map((row) => normalizeStory(row as Record<string, unknown>));
  } catch {
    return getFallbackStories(ageGroup);
  }
}
