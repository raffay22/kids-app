-- Step 1: Ensure Table Schema Matches TASKS.md Exactly
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  target_age_group VARCHAR(10) NOT NULL, -- '1-3' or '3-6'
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  theme VARCHAR(50) DEFAULT 'general',
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow read access to active stories'
  ) THEN
    CREATE POLICY "Allow read access to active stories" 
    ON public.stories FOR SELECT 
    USING (is_active = true);
  END IF;
END $$;

-- Step 2: Insert All 70 Stories (50 Original from Ages-1-to-3.json + 20 New Stories)
INSERT INTO public.stories (story_id, title, target_age_group, difficulty_level, theme, content)
SELECT 
  item->>'story_id',
  item->>'title',
  item->>'target_age_group',
  COALESCE(item->>'difficulty_level', 'beginner'),
  COALESCE(item->>'theme', 'general'),
  item AS content
FROM jsonb_array_elements('
[
  {
    "story_id": "story_toddler_01",
    "title": "Sammy the Turtle''s Slow Swim",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Sammy the turtle wants to swim home. Help him glide slowly through the water!",
        "audio_prompt": "Sammy the turtle wants to swim home. Help him glide slowly through the water!",
        "lottie_animation": "/animations/turtle_swimming.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Oh look! A red starfish is sleeping. Tap the RED starfish to wake it up!",
        "audio_prompt": "Tap the RED starfish to wake it up!",
        "puzzle": {
          "type": "color_match",
          "target_color": "red",
          "options": ["blue", "red", "yellow"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_02",
    "title": "The Sleepy Bear''s Nest",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "animals",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Bear is very tired after a long day. Touch and hold the screen to help Bear breathe softly.",
        "audio_prompt": "Touch and hold the screen to help Bear breathe softly.",
        "lottie_animation": "/animations/bear_sleeping.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which blanket is SOFT and BLUE for Bear?",
        "audio_prompt": "Which blanket is SOFT and BLUE for Bear?",
        "puzzle": {
          "type": "color_match",
          "target_color": "blue",
          "options": ["green", "blue", "orange"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_03",
    "title": "Pip the Penguin''s Ice Slide",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "arctic",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Pip the penguin wants to slide down the ice. Slowly drag Pip along the frozen hill!",
        "audio_prompt": "Slowly drag Pip along the frozen hill!",
        "lottie_animation": "/animations/penguin_slide.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Pip found a shiny fish! Tap the BLUE fish to give Pip a snack.",
        "audio_prompt": "Tap the BLUE fish to give Pip a snack.",
        "puzzle": {
          "type": "color_match",
          "target_color": "blue",
          "options": ["red", "blue", "yellow"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_04",
    "title": "Bella Bee''s Honey Flower",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "garden",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Bella Bee is searching for sweet nectar. Hold your finger on the flower to let Bella land.",
        "audio_prompt": "Hold your finger on the flower to let Bella land.",
        "lottie_animation": "/animations/bee_flower.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the YELLOW flower for Bella Bee!",
        "audio_prompt": "Tap the YELLOW flower for Bella Bee!",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": ["blue", "yellow", "pink"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_05",
    "title": "Oliver Owl''s Night Song",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "night",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "The moon is up. Gently swipe across the sky to wake up Oliver Owl.",
        "audio_prompt": "Gently swipe across the sky to wake up Oliver Owl.",
        "lottie_animation": "/animations/owl_night.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape is the bright full MOON?",
        "audio_prompt": "Which shape is the bright full MOON?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "circle",
          "options": ["square", "circle", "triangle"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_51",
    "title": "Leo Lion''s Soft Roar",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Leo lion wants to do a quiet lion stretch. Hold down your touch to stretch with Leo.",
        "audio_prompt": "Hold down your touch to stretch with Leo.",
        "lottie_animation": "/animations/lion_stretch.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Find Leo''s ORANGE crown!",
        "audio_prompt": "Find Leo''s ORANGE crown!",
        "puzzle": {
          "type": "color_match",
          "target_color": "orange",
          "options": ["orange", "green", "purple"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_52",
    "title": "Daisy Duck''s Splash Pond",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "pond",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Quack quack! Gently trace a wave across the water to make a splash.",
        "audio_prompt": "Gently trace a wave across the water to make a splash.",
        "lottie_animation": "/animations/duck_pond.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the YELLOW duckling!",
        "audio_prompt": "Tap the YELLOW duckling!",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": ["blue", "yellow", "black"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_53",
    "title": "Fiona Frog''s Big Hop",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "pond",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Fiona frog wants to leap onto the lily pad. Trace an arch from Fiona to the pad.",
        "audio_prompt": "Trace an arch from Fiona to the pad.",
        "lottie_animation": "/animations/frog_leap.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape is the round lily pad?",
        "audio_prompt": "Which shape is the round lily pad?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "circle",
          "options": ["triangle", "circle", "square"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_54",
    "title": "Benny Bunny''s Carrot Patch",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Benny bunny sees a big carrot buried in soil. Hold the screen to pull it up gently.",
        "audio_prompt": "Hold the screen to pull it up gently.",
        "lottie_animation": "/animations/bunny_carrot.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the ORANGE carrot for Benny!",
        "audio_prompt": "Tap the ORANGE carrot for Benny!",
        "puzzle": {
          "type": "color_match",
          "target_color": "orange",
          "options": ["blue", "orange", "purple"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_55",
    "title": "Kiki Kitty''s Yarn Ball",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "home",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Kiki kitty wants to roll her soft ball of yarn. Trace a spiral to roll the yarn.",
        "audio_prompt": "Trace a spiral to roll the yarn.",
        "lottie_animation": "/animations/cat_yarn.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which yarn ball is PINK?",
        "audio_prompt": "Which yarn ball is PINK?",
        "puzzle": {
          "type": "color_match",
          "target_color": "pink",
          "options": ["pink", "green", "brown"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_56",
    "title": "Milo Monkey''s Banana Swing",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "jungle",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Milo monkey is swinging on a jungle vine. Slowly drag Milo to the next tree branch.",
        "audio_prompt": "Slowly drag Milo to the next tree branch.",
        "lottie_animation": "/animations/monkey_swing.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the YELLOW banana cluster!",
        "audio_prompt": "Tap the YELLOW banana cluster!",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": ["red", "yellow", "blue"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_57",
    "title": "Penny Panda''s Bamboo Snack",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "forest",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Penny panda loves crunching green bamboo shoots. Hold down to help Penny eat.",
        "audio_prompt": "Hold down to help Penny eat.",
        "lottie_animation": "/animations/panda_bamboo.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Find the GREEN bamboo stalk!",
        "audio_prompt": "Find the GREEN bamboo stalk!",
        "puzzle": {
          "type": "color_match",
          "target_color": "green",
          "options": ["purple", "green", "yellow"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_58",
    "title": "Sammie Sheep''s Fluffy Wool",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Baa baa! Gently pat Sammie sheep by holding your touch on the soft wool.",
        "audio_prompt": "Gently pat Sammie sheep by holding your touch on the soft wool.",
        "lottie_animation": "/animations/sheep_wool.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the WHITE cloud in the farm sky!",
        "audio_prompt": "Tap the WHITE cloud in the farm sky!",
        "puzzle": {
          "type": "color_match",
          "target_color": "white",
          "options": ["black", "white", "orange"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_59",
    "title": "Toby Giraffe''s High Leaf",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Toby giraffe reaches his long neck high up into the tree. Trace straight up to help him reach.",
        "audio_prompt": "Trace straight up to help him reach.",
        "lottie_animation": "/animations/giraffe_reach.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which leaf is at the top of the tree? Tap the GREEN leaf!",
        "audio_prompt": "Tap the GREEN leaf!",
        "puzzle": {
          "type": "color_match",
          "target_color": "green",
          "options": ["blue", "green", "red"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_60",
    "title": "Penny Puffin''s Shiny Pebble",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "arctic",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Penny puffin found a smooth rock on the beach. Trace a circle around the pebble.",
        "audio_prompt": "Trace a circle around the pebble.",
        "lottie_animation": "/animations/puffin_pebble.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape is the round smooth pebble?",
        "audio_prompt": "Which shape is the round smooth pebble?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "circle",
          "options": ["square", "circle", "triangle"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_61",
    "title": "Wally Whale''s Water Spout",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Whoosh! Wally whale blows water high into the air. Hold down to help Wally spout.",
        "audio_prompt": "Hold down to help Wally spout.",
        "lottie_animation": "/animations/whale_spout.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the BLUE water droplet!",
        "audio_prompt": "Tap the BLUE water droplet!",
        "puzzle": {
          "type": "color_match",
          "target_color": "blue",
          "options": ["yellow", "blue", "red"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_62",
    "title": "Zoe Zebra''s Stripes",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Zoe zebra has beautiful black and white stripes. Trace down one stripe smoothly.",
        "audio_prompt": "Trace down one stripe smoothly.",
        "lottie_animation": "/animations/zebra_stripes.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the BLACK stripe on Zoe!",
        "audio_prompt": "Tap the BLACK stripe on Zoe!",
        "puzzle": {
          "type": "color_match",
          "target_color": "black",
          "options": ["black", "yellow", "green"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_63",
    "title": "Gideon Goldfish''s Bubble Pop",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Glub glub! Gideon goldfish is blowing soft bubbles. Hold the screen to blow a big bubble.",
        "audio_prompt": "Hold the screen to blow a big bubble.",
        "lottie_animation": "/animations/goldfish_bubble.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the ORANGE goldfish!",
        "audio_prompt": "Tap the ORANGE goldfish!",
        "puzzle": {
          "type": "color_match",
          "target_color": "orange",
          "options": ["purple", "orange", "green"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_64",
    "title": "Hattie Hippo''s Mud Bath",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hattie hippo loves cooling off in the mud pond. Trace a gentle circle in the mud.",
        "audio_prompt": "Trace a gentle circle in the mud.",
        "lottie_animation": "/animations/hippo_mud.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which splash pad is BROWN like mud?",
        "audio_prompt": "Which splash pad is BROWN like mud?",
        "puzzle": {
          "type": "color_match",
          "target_color": "brown",
          "options": ["brown", "blue", "pink"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_65",
    "title": "Iggy Iguana''s Sunny Rock",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "nature",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Iggy iguana warms up on a smooth sunlit rock. Hold your touch to let the sun shine.",
        "audio_prompt": "Hold your touch to let the sun shine.",
        "lottie_animation": "/animations/iguana_sun.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the bright YELLOW sun!",
        "audio_prompt": "Tap the bright YELLOW sun!",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": ["red", "yellow", "blue"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_66",
    "title": "The Friendly Caterpillar''s Leaf",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "nature",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Munch, munch! Trace a line down the big green leaf for the caterpillar.",
        "audio_prompt": "Trace a line down the big green leaf for the caterpillar.",
        "lottie_animation": "/animations/caterpillar_leaf.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which leaf is GREEN?",
        "audio_prompt": "Which leaf is GREEN?",
        "puzzle": {
          "type": "color_match",
          "target_color": "green",
          "options": ["purple", "green", "red"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_67",
    "title": "The Yellow School Bus Drive",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "city",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Beep beep! The yellow school bus is driving to school. Trace a line to guide the bus.",
        "audio_prompt": "Trace a line to guide the bus.",
        "lottie_animation": "/animations/yellow_bus.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the big YELLOW bus!",
        "audio_prompt": "Tap the big YELLOW bus!",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": ["yellow", "red", "purple"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_68",
    "title": "Goodnight Little Star",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "space",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Twinkle twinkle little star. Hold down screen to make the star glow softly.",
        "audio_prompt": "Hold down screen to make the star glow softly.",
        "lottie_animation": "/animations/star_glowing.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape is glowing in the night sky?",
        "audio_prompt": "Which shape is glowing in the night sky?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "star",
          "options": ["square", "star", "circle"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_69",
    "title": "Sammy''s Sunny Meadow Ride",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "meadow",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Glide along the grassy trail. Trace a smooth curve to guide Sammy.",
        "audio_prompt": "Trace a smooth curve to guide Sammy.",
        "lottie_animation": "/animations/meadow_trail.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the GREEN grass patch!",
        "audio_prompt": "Tap the GREEN grass patch!",
        "puzzle": {
          "type": "color_match",
          "target_color": "green",
          "options": ["red", "green", "blue"]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_70",
    "title": "Little Cloud''s Rain Sprinkles",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "sky",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Pitter patter! Hold down your finger to make gentle rain drops fall.",
        "audio_prompt": "Hold down your finger to make gentle rain drops fall.",
        "lottie_animation": "/animations/rain_drops.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which cloud is BLUE?",
        "audio_prompt": "Which cloud is BLUE?",
        "puzzle": {
          "type": "color_match",
          "target_color": "blue",
          "options": ["blue", "yellow", "orange"]
        }
      }
    ]
  }
]
'::jsonb) AS item
ON CONFLICT (story_id) DO UPDATE SET
  title = EXCLUDED.title,
  target_age_group = EXCLUDED.target_age_group,
  difficulty_level = EXCLUDED.difficulty_level,
  theme = EXCLUDED.theme,
  content = EXCLUDED.content;