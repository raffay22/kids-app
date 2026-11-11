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
  {
    id: "fb-t3",
    story_id: "story_toddler_03",
    title: "Pip the Penguin's Ice Slide",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "arctic",
    is_active: true,
    cover_image: "/stories/story_toddler_03/cover.jpg",
    content: {
      story_id: "story_toddler_03",
      title: "Pip the Penguin's Ice Slide",
      target_age_group: "1-3",
      theme: "arctic",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Pip the penguin wants to slide down the ice. Slowly drag Pip along the frozen hill!",
          audio_prompt:
            "Pip the penguin wants to slide down the ice. Slowly drag Pip along the frozen hill!",
          visual_asset_keyword: "penguin",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_03/scene1.mp4",
          audio_url: "/stories/story_toddler_03/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Pip found a shiny fish! Tap the BLUE fish to give Pip a snack.",
          audio_prompt: "Pip found a shiny fish! Tap the BLUE fish to give Pip a snack.",
          visual_asset_keyword: "fish",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_03/scene2.mp4",
          wake_video_url: "/stories/story_toddler_03/scene2_blue.mp4",
          audio_url: "/stories/story_toddler_03/scene2.mp3",
          tap_target: {
            label: "blue fish",
            color: "blue",
            hotspot: { left: 42, top: 58, width: 20, height: 24 },
          },
          puzzle: {
            type: "color_match",
            target_color: "blue",
            options: ["red", "blue", "yellow"],
            correct_answer: "blue",
          },
        },
      ],
    },
  },
  {
    id: "fb-t4",
    story_id: "story_toddler_04",
    title: "Bella Bee's Honey Flower",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "garden",
    is_active: true,
    cover_image: "/stories/story_toddler_04/cover.jpg",
    content: {
      story_id: "story_toddler_04",
      title: "Bella Bee's Honey Flower",
      target_age_group: "1-3",
      theme: "garden",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Bella Bee is searching for sweet nectar. Hold your finger on the flower to let Bella land.",
          audio_prompt:
            "Bella Bee is searching for sweet nectar. Hold your finger on the flower to let Bella land.",
          visual_asset_keyword: "bee",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_04/scene1.mp4",
          wake_video_url: "/stories/story_toddler_04/scene1_land.mp4",
          audio_url: "/stories/story_toddler_04/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the YELLOW flower for Bella Bee!",
          audio_prompt: "Tap the YELLOW flower for Bella Bee!",
          visual_asset_keyword: "flower",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_04/scene2.mp4",
          wake_video_url: "/stories/story_toddler_04/scene2_yellow.mp4",
          audio_url: "/stories/story_toddler_04/scene2.mp3",
          tap_target: {
            label: "yellow flower",
            color: "yellow",
            hotspot: { left: 40, top: 50, width: 24, height: 34 },
          },
          puzzle: {
            type: "color_match",
            target_color: "yellow",
            options: ["blue", "yellow", "pink"],
            correct_answer: "yellow",
          },
        },
      ],
    },
  },
  {
    id: "fb-t5",
    story_id: "story_toddler_05",
    title: "Oliver Owl's Night Song",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "night",
    is_active: true,
    cover_image: "/stories/story_toddler_05/cover.jpg",
    content: {
      story_id: "story_toddler_05",
      title: "Oliver Owl's Night Song",
      target_age_group: "1-3",
      theme: "night",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "The moon is up. Gently swipe across the sky to wake up Oliver Owl.",
          audio_prompt:
            "The moon is up. Gently swipe across the sky to wake up Oliver Owl.",
          visual_asset_keyword: "owl",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_05/scene1.mp4",
          wake_video_url: "/stories/story_toddler_05/scene1_wake.mp4",
          audio_url: "/stories/story_toddler_05/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Which shape is the bright full MOON?",
          audio_prompt: "Which shape is the bright full MOON?",
          visual_asset_keyword: "moon",
          interaction_type: "shape_tangram",
          video_url: "/stories/story_toddler_05/scene2.mp4",
          audio_url: "/stories/story_toddler_05/scene2.mp3",
          puzzle: {
            type: "shape_tangram",
            correct_shape: "circle",
            options: ["square", "circle", "triangle"],
          },
        },
      ],
    },
  },
  {
    id: "fb-t6",
    story_id: "story_toddler_06",
    title: "Leo Lion's Soft Roar",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "savannah",
    is_active: true,
    cover_image: "/stories/story_toddler_06/cover.jpg",
    content: {
      story_id: "story_toddler_06",
      title: "Leo Lion's Soft Roar",
      target_age_group: "1-3",
      theme: "savannah",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Leo lion wants to do a quiet lion stretch. Hold down your touch to stretch with Leo.",
          audio_prompt:
            "Leo lion wants to do a quiet lion stretch. Hold down your touch to stretch with Leo.",
          visual_asset_keyword: "lion",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_06/scene1.mp4",
          wake_video_url: "/stories/story_toddler_06/scene1_stretch.mp4",
          audio_url: "/stories/story_toddler_06/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Find Leo's ORANGE crown!",
          audio_prompt: "Find Leo's ORANGE crown!",
          visual_asset_keyword: "crown",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_06/scene2.mp4",
          wake_video_url: "/stories/story_toddler_06/scene2_orange.mp4",
          audio_url: "/stories/story_toddler_06/scene2.mp3",
          tap_target: {
            label: "orange crown",
            color: "orange",
            hotspot: { left: 40, top: 52, width: 22, height: 30 },
          },
          puzzle: {
            type: "color_match",
            target_color: "orange",
            options: ["orange", "green", "purple"],
            correct_answer: "orange",
          },
        },
      ],
    },
  },
  {
    id: "fb-t7",
    story_id: "story_toddler_07",
    title: "Daisy Duck's Splash Pond",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "pond",
    is_active: true,
    cover_image: "/stories/story_toddler_07/cover.jpg",
    content: {
      story_id: "story_toddler_07",
      title: "Daisy Duck's Splash Pond",
      target_age_group: "1-3",
      theme: "pond",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Quack quack! Gently trace a wave across the water to make a splash.",
          audio_prompt:
            "Quack quack! Gently trace a wave across the water to make a splash.",
          visual_asset_keyword: "duck",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_07/scene1.mp4",
          wake_video_url: "/stories/story_toddler_07/scene1_splash.mp4",
          audio_url: "/stories/story_toddler_07/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the YELLOW duckling!",
          audio_prompt: "Tap the YELLOW duckling!",
          visual_asset_keyword: "duckling",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_07/scene2.mp4",
          wake_video_url: "/stories/story_toddler_07/scene2_yellow.mp4",
          audio_url: "/stories/story_toddler_07/scene2.mp3",
          tap_target: {
            label: "yellow duckling",
            color: "yellow",
            hotspot: { left: 42, top: 58, width: 20, height: 28 },
          },
          puzzle: {
            type: "color_match",
            target_color: "yellow",
            options: ["blue", "yellow", "black"],
            correct_answer: "yellow",
          },
        },
      ],
    },
  },
  {
    id: "fb-t8",
    story_id: "story_toddler_08",
    title: "Fiona Frog's Big Hop",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "pond",
    is_active: true,
    cover_image: "/stories/story_toddler_08/cover.jpg",
    content: {
      story_id: "story_toddler_08",
      title: "Fiona Frog's Big Hop",
      target_age_group: "1-3",
      theme: "pond",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Fiona frog wants to leap onto the lily pad. Trace an arch from Fiona to the pad.",
          audio_prompt:
            "Fiona frog wants to leap onto the lily pad. Trace an arch from Fiona to the pad.",
          visual_asset_keyword: "frog",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_08/scene1.mp4",
          wake_video_url: "/stories/story_toddler_08/scene1_hop.mp4",
          audio_url: "/stories/story_toddler_08/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Which shape is the round lily pad?",
          audio_prompt: "Which shape is the round lily pad?",
          visual_asset_keyword: "lily",
          interaction_type: "shape_tangram",
          video_url: "/stories/story_toddler_08/scene2.mp4",
          audio_url: "/stories/story_toddler_08/scene2.mp3",
          puzzle: {
            type: "shape_tangram",
            correct_shape: "circle",
            options: ["triangle", "circle", "square"],
          },
        },
      ],
    },
  },
  {
    id: "fb-t9",
    story_id: "story_toddler_09",
    title: "Benny Bunny's Carrot Patch",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "farm",
    is_active: true,
    cover_image: "/stories/story_toddler_09/cover.jpg",
    content: {
      story_id: "story_toddler_09",
      title: "Benny Bunny's Carrot Patch",
      target_age_group: "1-3",
      theme: "farm",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Benny bunny sees a big carrot buried in soil. Hold the screen to pull it up gently.",
          audio_prompt:
            "Benny bunny sees a big carrot buried in soil. Hold the screen to pull it up gently.",
          visual_asset_keyword: "bunny",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_09/scene1.mp4",
          wake_video_url: "/stories/story_toddler_09/scene1_pull.mp4",
          audio_url: "/stories/story_toddler_09/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the ORANGE carrot for Benny!",
          audio_prompt: "Tap the ORANGE carrot for Benny!",
          visual_asset_keyword: "carrot",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_09/scene2.mp4",
          wake_video_url: "/stories/story_toddler_09/scene2_orange.mp4",
          audio_url: "/stories/story_toddler_09/scene2.mp3",
          tap_target: {
            label: "orange carrot",
            color: "orange",
            hotspot: { left: 40, top: 48, width: 22, height: 34 },
          },
          puzzle: {
            type: "color_match",
            target_color: "orange",
            options: ["blue", "orange", "purple"],
            correct_answer: "orange",
          },
        },
      ],
    },
  },
  {
    id: "fb-t10",
    story_id: "story_toddler_10",
    title: "Kiki Kitty's Yarn Ball",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "home",
    is_active: true,
    cover_image: "/stories/story_toddler_10/cover.jpg",
    content: {
      story_id: "story_toddler_10",
      title: "Kiki Kitty's Yarn Ball",
      target_age_group: "1-3",
      theme: "home",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Kiki kitty wants to roll her soft ball of yarn. Trace a spiral to roll the yarn.",
          audio_prompt:
            "Kiki kitty wants to roll her soft ball of yarn. Trace a spiral to roll the yarn.",
          visual_asset_keyword: "kitty",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_10/scene1.mp4",
          wake_video_url: "/stories/story_toddler_10/scene1_roll.mp4",
          audio_url: "/stories/story_toddler_10/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the PINK yarn for Kiki!",
          audio_prompt: "Tap the PINK yarn for Kiki!",
          visual_asset_keyword: "yarn",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_10/scene2.mp4",
          wake_video_url: "/stories/story_toddler_10/scene2_pink.mp4",
          audio_url: "/stories/story_toddler_10/scene2.mp3",
          tap_target: {
            label: "pink yarn",
            color: "pink",
            hotspot: { left: 18, top: 52, width: 20, height: 32 },
          },
          puzzle: {
            type: "color_match",
            target_color: "pink",
            options: ["pink", "green", "brown"],
            correct_answer: "pink",
          },
        },
      ],
    },
  },
  {
    id: "fb-t11",
    story_id: "story_toddler_11",
    title: "Milo Monkey's Banana Swing",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "jungle",
    is_active: true,
    cover_image: "/stories/story_toddler_11/cover.jpg",
    content: {
      story_id: "story_toddler_11",
      title: "Milo Monkey's Banana Swing",
      target_age_group: "1-3",
      theme: "jungle",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Milo monkey is swinging on a jungle vine. Slowly drag Milo to the next tree branch.",
          audio_prompt:
            "Milo monkey is swinging on a jungle vine. Slowly drag Milo to the next tree branch.",
          visual_asset_keyword: "monkey",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_11/scene1.mp4",
          wake_video_url: "/stories/story_toddler_11/scene1_swing.mp4",
          audio_url: "/stories/story_toddler_11/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the YELLOW banana cluster!",
          audio_prompt: "Tap the YELLOW banana cluster!",
          visual_asset_keyword: "banana",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_11/scene2.mp4",
          wake_video_url: "/stories/story_toddler_11/scene2_yellow.mp4",
          audio_url: "/stories/story_toddler_11/scene2.mp3",
          tap_target: {
            label: "yellow banana",
            color: "yellow",
            hotspot: { left: 8, top: 34, width: 18, height: 30 },
          },
          puzzle: {
            type: "color_match",
            target_color: "yellow",
            options: ["red", "yellow", "blue"],
            correct_answer: "yellow",
          },
        },
      ],
    },
  },
  {
    id: "fb-t12",
    story_id: "story_toddler_12",
    title: "Penny Panda's Bamboo Snack",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "forest",
    is_active: true,
    cover_image: "/stories/story_toddler_12/cover.jpg",
    content: {
      story_id: "story_toddler_12",
      title: "Penny Panda's Bamboo Snack",
      target_age_group: "1-3",
      theme: "forest",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Penny panda loves crunching green bamboo shoots. Hold down to help Penny eat.",
          audio_prompt:
            "Penny panda loves crunching green bamboo shoots. Hold down to help Penny eat.",
          visual_asset_keyword: "panda",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_12/scene1.mp4",
          wake_video_url: "/stories/story_toddler_12/scene1_eat.mp4",
          audio_url: "/stories/story_toddler_12/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Find the GREEN bamboo stalk!",
          audio_prompt: "Find the GREEN bamboo stalk!",
          visual_asset_keyword: "bamboo",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_12/scene2.mp4",
          wake_video_url: "/stories/story_toddler_12/scene2_green.mp4",
          audio_url: "/stories/story_toddler_12/scene2.mp3",
          tap_target: {
            label: "green bamboo",
            color: "green",
            hotspot: { left: 40, top: 32, width: 16, height: 48 },
          },
          puzzle: {
            type: "color_match",
            target_color: "green",
            options: ["purple", "green", "yellow"],
            correct_answer: "green",
          },
        },
      ],
    },
  },
  {
    id: "fb-t13",
    story_id: "story_toddler_13",
    title: "Sammie Sheep's Fluffy Wool",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "farm",
    is_active: true,
    cover_image: "/stories/story_toddler_13/cover.jpg",
    content: {
      story_id: "story_toddler_13",
      title: "Sammie Sheep's Fluffy Wool",
      target_age_group: "1-3",
      theme: "farm",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Baa baa! Gently pat Sammie sheep by holding your touch on the soft wool.",
          audio_prompt:
            "Baa baa! Gently pat Sammie sheep by holding your touch on the soft wool.",
          visual_asset_keyword: "sheep",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_13/scene1.mp4",
          wake_video_url: "/stories/story_toddler_13/scene1_pat.mp4",
          audio_url: "/stories/story_toddler_13/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the WHITE cloud in the farm sky!",
          audio_prompt: "Tap the WHITE cloud in the farm sky!",
          visual_asset_keyword: "cloud",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_13/scene2.mp4",
          wake_video_url: "/stories/story_toddler_13/scene2_white.mp4",
          audio_url: "/stories/story_toddler_13/scene2.mp3",
          tap_target: {
            label: "white cloud",
            color: "white",
            hotspot: { left: 40, top: 8, width: 20, height: 22 },
          },
          puzzle: {
            type: "color_match",
            target_color: "white",
            options: ["black", "white", "orange"],
            correct_answer: "white",
          },
        },
      ],
    },
  },
  {
    id: "fb-t14",
    story_id: "story_toddler_14",
    title: "Toby Giraffe's High Leaf",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "savannah",
    is_active: true,
    cover_image: "/stories/story_toddler_14/cover.jpg",
    content: {
      story_id: "story_toddler_14",
      title: "Toby Giraffe's High Leaf",
      target_age_group: "1-3",
      theme: "savannah",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Toby giraffe reaches his long neck high up into the tree. Trace straight up to help him reach.",
          audio_prompt:
            "Toby giraffe reaches his long neck high up into the tree. Trace straight up to help him reach.",
          visual_asset_keyword: "giraffe",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_14/scene1.mp4",
          wake_video_url: "/stories/story_toddler_14/scene1_reach.mp4",
          audio_url: "/stories/story_toddler_14/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Which leaf is at the top of the tree? Tap the GREEN leaf!",
          audio_prompt: "Which leaf is at the top of the tree? Tap the GREEN leaf!",
          visual_asset_keyword: "leaf",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_14/scene2.mp4",
          wake_video_url: "/stories/story_toddler_14/scene2_green.mp4",
          audio_url: "/stories/story_toddler_14/scene2.mp3",
          tap_target: {
            label: "green leaf",
            color: "green",
            hotspot: { left: 48, top: 18, width: 14, height: 20 },
          },
          puzzle: {
            type: "color_match",
            target_color: "green",
            options: ["blue", "green", "red"],
            correct_answer: "green",
          },
        },
      ],
    },
  },
  {
    id: "fb-t15",
    story_id: "story_toddler_15",
    title: "Penny Puffin's Shiny Pebble",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "arctic",
    is_active: true,
    cover_image: "/stories/story_toddler_15/cover.jpg",
    content: {
      story_id: "story_toddler_15",
      title: "Penny Puffin's Shiny Pebble",
      target_age_group: "1-3",
      theme: "arctic",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Penny puffin found a smooth rock on the beach. Trace a circle around the pebble.",
          audio_prompt:
            "Penny puffin found a smooth rock on the beach. Trace a circle around the pebble.",
          visual_asset_keyword: "puffin",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_15/scene1.mp4",
          wake_video_url: "/stories/story_toddler_15/scene1_circle.mp4",
          audio_url: "/stories/story_toddler_15/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Which shape is the round smooth pebble?",
          audio_prompt: "Which shape is the round smooth pebble?",
          visual_asset_keyword: "pebble",
          interaction_type: "shape_tangram",
          video_url: "/stories/story_toddler_15/scene2.mp4",
          audio_url: "/stories/story_toddler_15/scene2.mp3",
          puzzle: {
            type: "shape_tangram",
            correct_shape: "circle",
            options: ["square", "circle", "triangle"],
          },
        },
      ],
    },
  },
  {
    id: "fb-t16",
    story_id: "story_toddler_16",
    title: "Wally Whale's Water Spout",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "ocean",
    is_active: true,
    cover_image: "/stories/story_toddler_16/cover.jpg",
    content: {
      story_id: "story_toddler_16",
      title: "Wally Whale's Water Spout",
      target_age_group: "1-3",
      theme: "ocean",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Whoosh! Wally whale blows water high into the air. Hold down to help Wally spout.",
          audio_prompt:
            "Whoosh! Wally whale blows water high into the air. Hold down to help Wally spout.",
          visual_asset_keyword: "whale",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_16/scene1.mp4",
          wake_video_url: "/stories/story_toddler_16/scene1_spout.mp4",
          audio_url: "/stories/story_toddler_16/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the BLUE water droplet!",
          audio_prompt: "Tap the BLUE water droplet!",
          visual_asset_keyword: "droplet",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_16/scene2.mp4",
          wake_video_url: "/stories/story_toddler_16/scene2_blue.mp4",
          audio_url: "/stories/story_toddler_16/scene2.mp3",
          tap_target: {
            label: "blue droplet",
            color: "blue",
            hotspot: { left: 42, top: 42, width: 16, height: 28 },
          },
          puzzle: {
            type: "color_match",
            target_color: "blue",
            options: ["yellow", "blue", "red"],
            correct_answer: "blue",
          },
        },
      ],
    },
  },
  {
    id: "fb-t17",
    story_id: "story_toddler_17",
    title: "Zoe Zebra's Stripes",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "savannah",
    is_active: true,
    cover_image: "/stories/story_toddler_17/cover.jpg",
    content: {
      story_id: "story_toddler_17",
      title: "Zoe Zebra's Stripes",
      target_age_group: "1-3",
      theme: "savannah",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Zoe zebra has beautiful black and white stripes. Trace down one stripe smoothly.",
          audio_prompt:
            "Zoe zebra has beautiful black and white stripes. Trace down one stripe smoothly.",
          visual_asset_keyword: "zebra",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_17/scene1.mp4",
          wake_video_url: "/stories/story_toddler_17/scene1_stripe.mp4",
          audio_url: "/stories/story_toddler_17/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the BLACK stripe on Zoe!",
          audio_prompt: "Tap the BLACK stripe on Zoe!",
          visual_asset_keyword: "stripe",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_17/scene2.mp4",
          wake_video_url: "/stories/story_toddler_17/scene2_black.mp4",
          audio_url: "/stories/story_toddler_17/scene2.mp3",
          tap_target: {
            label: "black stripe",
            color: "black",
            hotspot: { left: 18, top: 58, width: 18, height: 20 },
          },
          puzzle: {
            type: "color_match",
            target_color: "black",
            options: ["black", "yellow", "green"],
            correct_answer: "black",
          },
        },
      ],
    },
  },
  {
    id: "fb-t18",
    story_id: "story_toddler_18",
    title: "Gideon Goldfish's Bubble Pop",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "ocean",
    is_active: true,
    cover_image: "/stories/story_toddler_18/cover.jpg",
    content: {
      story_id: "story_toddler_18",
      title: "Gideon Goldfish's Bubble Pop",
      target_age_group: "1-3",
      theme: "ocean",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Glub glub! Gideon goldfish is blowing soft bubbles. Hold the screen to blow a big bubble.",
          audio_prompt:
            "Glub glub! Gideon goldfish is blowing soft bubbles. Hold the screen to blow a big bubble.",
          visual_asset_keyword: "goldfish",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_18/scene1.mp4",
          wake_video_url: "/stories/story_toddler_18/scene1_bubble.mp4",
          audio_url: "/stories/story_toddler_18/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the ORANGE goldfish!",
          audio_prompt: "Tap the ORANGE goldfish!",
          visual_asset_keyword: "goldfish",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_18/scene2.mp4",
          wake_video_url: "/stories/story_toddler_18/scene2_orange.mp4",
          audio_url: "/stories/story_toddler_18/scene2.mp3",
          tap_target: {
            label: "orange goldfish",
            color: "orange",
            hotspot: { left: 38, top: 35, width: 22, height: 32 },
          },
          puzzle: {
            type: "color_match",
            target_color: "orange",
            options: ["purple", "orange", "green"],
            correct_answer: "orange",
          },
        },
      ],
    },
  },
  {
    id: "fb-t19",
    story_id: "story_toddler_19",
    title: "Hattie Hippo's Mud Bath",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "savannah",
    is_active: true,
    cover_image: "/stories/story_toddler_19/cover.jpg",
    content: {
      story_id: "story_toddler_19",
      title: "Hattie Hippo's Mud Bath",
      target_age_group: "1-3",
      theme: "savannah",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Hattie hippo loves cooling off in the mud pond. Trace a gentle circle in the mud.",
          audio_prompt:
            "Hattie hippo loves cooling off in the mud pond. Trace a gentle circle in the mud.",
          visual_asset_keyword: "hippo",
          interaction_type: "slow_trace",
          video_url: "/stories/story_toddler_19/scene1.mp4",
          wake_video_url: "/stories/story_toddler_19/scene1_circle.mp4",
          audio_url: "/stories/story_toddler_19/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Which splash pad is BROWN like mud?",
          audio_prompt: "Which splash pad is BROWN like mud?",
          visual_asset_keyword: "mud",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_19/scene2.mp4",
          wake_video_url: "/stories/story_toddler_19/scene2_brown.mp4",
          audio_url: "/stories/story_toddler_19/scene2.mp3",
          tap_target: {
            label: "brown splash pad",
            color: "brown",
            hotspot: { left: 40, top: 48, width: 20, height: 28 },
          },
          puzzle: {
            type: "color_match",
            target_color: "brown",
            options: ["brown", "blue", "pink"],
            correct_answer: "brown",
          },
        },
      ],
    },
  },
  {
    id: "fb-t20",
    story_id: "story_toddler_20",
    title: "Iggy Iguana's Sunny Rock",
    target_age_group: "1-3",
    difficulty_level: "beginner",
    theme: "nature",
    is_active: true,
    cover_image: "/stories/story_toddler_20/cover.jpg",
    content: {
      story_id: "story_toddler_20",
      title: "Iggy Iguana's Sunny Rock",
      target_age_group: "1-3",
      theme: "nature",
      scenes: [
        {
          scene_number: 1,
          narrative_text:
            "Iggy iguana warms up on a smooth sunlit rock. Hold your touch to let the sun shine.",
          audio_prompt:
            "Iggy iguana warms up on a smooth sunlit rock. Hold your touch to let the sun shine.",
          visual_asset_keyword: "iguana",
          interaction_type: "hold_breath",
          video_url: "/stories/story_toddler_20/scene1.mp4",
          wake_video_url: "/stories/story_toddler_20/scene1_sun.mp4",
          audio_url: "/stories/story_toddler_20/scene1.mp3",
        },
        {
          scene_number: 2,
          narrative_text: "Tap the bright YELLOW sun!",
          audio_prompt: "Tap the bright YELLOW sun!",
          visual_asset_keyword: "sun",
          interaction_type: "color_match",
          video_url: "/stories/story_toddler_20/scene2.mp4",
          wake_video_url: "/stories/story_toddler_20/scene2_yellow.mp4",
          audio_url: "/stories/story_toddler_20/scene2.mp3",
          tap_target: {
            label: "yellow sun",
            color: "yellow",
            hotspot: { left: 40, top: 28, width: 20, height: 36 },
          },
          puzzle: {
            type: "color_match",
            target_color: "yellow",
            options: ["red", "yellow", "blue"],
            correct_answer: "yellow",
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
