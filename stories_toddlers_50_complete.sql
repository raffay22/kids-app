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
    CREATE POLICY "Allow read access to active stories" ON public.stories FOR SELECT USING (is_active = true); 
  END IF; 
END $$;

-- Step 2: Insert All 50 Continuous Toddler Stories (story_toddler_01 to story_toddler_50)
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
    "title": "Sammy the Turtle's Slow Swim",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Sammy the turtle wants to swim home. Help him glide slowly through the water!",
        "audio_prompt": "Sammy the turtle wants to swim home. Help him glide slowly through the water!",
        "3D_animation": "/animations/turtle_swimming.json",
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
          "options": [
            "blue",
            "red",
            "yellow"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_02",
    "title": "The Sleepy Bear's Nest",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "animals",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Bear is very tired after a long day. Touch and hold the screen to help Bear breathe softly.",
        "audio_prompt": "Touch and hold the screen to help Bear breathe softly.",
        "3D_animation": "/animations/bear_sleeping.json",
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
          "options": [
            "green",
            "blue",
            "orange"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_03",
    "title": "Pip the Penguin's Ice Slide",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "arctic",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Pip the penguin wants to slide down the ice. Slowly drag Pip along the frozen hill!",
        "audio_prompt": "Slowly drag Pip along the frozen hill!",
        "3D_animation": "/animations/penguin_slide.json",
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
          "options": [
            "red",
            "blue",
            "yellow"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_04",
    "title": "Bella Bee's Honey Flower",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "garden",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Bella Bee is searching for sweet nectar. Hold your finger on the flower to let Bella land.",
        "audio_prompt": "Hold your finger on the flower to let Bella land.",
        "3D_animation": "/animations/bee_flower.json",
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
          "options": [
            "blue",
            "yellow",
            "pink"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_05",
    "title": "Oliver Owl's Night Song",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "night",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "The moon is up. Gently swipe across the sky to wake up Oliver Owl.",
        "audio_prompt": "Gently swipe across the sky to wake up Oliver Owl.",
        "3D_animation": "/animations/owl_night.json",
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
          "options": [
            "square",
            "circle",
            "triangle"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_06",
    "title": "Leo Lion's Soft Roar",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Leo lion wants to do a quiet lion stretch. Hold down your touch to stretch with Leo.",
        "audio_prompt": "Hold down your touch to stretch with Leo.",
        "3D_animation": "/animations/lion_stretch.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Find Leo's ORANGE crown!",
        "audio_prompt": "Find Leo's ORANGE crown!",
        "puzzle": {
          "type": "color_match",
          "target_color": "orange",
          "options": [
            "orange",
            "green",
            "purple"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_07",
    "title": "Daisy Duck's Splash Pond",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "pond",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Quack quack! Gently trace a wave across the water to make a splash.",
        "audio_prompt": "Gently trace a wave across the water to make a splash.",
        "3D_animation": "/animations/duck_pond.json",
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
          "options": [
            "blue",
            "yellow",
            "black"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_08",
    "title": "Fiona Frog's Big Hop",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "pond",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Fiona frog wants to leap onto the lily pad. Trace an arch from Fiona to the pad.",
        "audio_prompt": "Trace an arch from Fiona to the pad.",
        "3D_animation": "/animations/frog_leap.json",
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
          "options": [
            "triangle",
            "circle",
            "square"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_09",
    "title": "Benny Bunny's Carrot Patch",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Benny bunny sees a big carrot buried in soil. Hold the screen to pull it up gently.",
        "audio_prompt": "Hold the screen to pull it up gently.",
        "3D_animation": "/animations/bunny_carrot.json",
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
          "options": [
            "blue",
            "orange",
            "purple"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_10",
    "title": "Kiki Kitty's Yarn Ball",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "home",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Kiki kitty wants to roll her soft ball of yarn. Trace a spiral to roll the yarn.",
        "audio_prompt": "Trace a spiral to roll the yarn.",
        "3D_animation": "/animations/cat_yarn.json",
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
          "options": [
            "pink",
            "green",
            "brown"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_11",
    "title": "Milo Monkey's Banana Swing",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "jungle",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Milo monkey is swinging on a jungle vine. Slowly drag Milo to the next tree branch.",
        "audio_prompt": "Slowly drag Milo to the next tree branch.",
        "3D_animation": "/animations/monkey_swing.json",
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
          "options": [
            "red",
            "yellow",
            "blue"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_12",
    "title": "Penny Panda's Bamboo Snack",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "forest",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Penny panda loves crunching green bamboo shoots. Hold down to help Penny eat.",
        "audio_prompt": "Hold down to help Penny eat.",
        "3D_animation": "/animations/panda_bamboo.json",
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
          "options": [
            "purple",
            "green",
            "yellow"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_13",
    "title": "Sammie Sheep's Fluffy Wool",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Baa baa! Gently pat Sammie sheep by holding your touch on the soft wool.",
        "audio_prompt": "Gently pat Sammie sheep by holding your touch on the soft wool.",
        "3D_animation": "/animations/sheep_wool.json",
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
          "options": [
            "black",
            "white",
            "orange"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_14",
    "title": "Toby Giraffe's High Leaf",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Toby giraffe reaches his long neck high up into the tree. Trace straight up to help him reach.",
        "audio_prompt": "Trace straight up to help him reach.",
        "3D_animation": "/animations/giraffe_reach.json",
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
          "options": [
            "blue",
            "green",
            "red"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_15",
    "title": "Penny Puffin's Shiny Pebble",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "arctic",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Penny puffin found a smooth rock on the beach. Trace a circle around the pebble.",
        "audio_prompt": "Trace a circle around the pebble.",
        "3D_animation": "/animations/puffin_pebble.json",
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
          "options": [
            "square",
            "circle",
            "triangle"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_16",
    "title": "Wally Whale's Water Spout",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Whoosh! Wally whale blows water high into the air. Hold down to help Wally spout.",
        "audio_prompt": "Hold down to help Wally spout.",
        "3D_animation": "/animations/whale_spout.json",
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
          "options": [
            "yellow",
            "blue",
            "red"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_17",
    "title": "Zoe Zebra's Stripes",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Zoe zebra has beautiful black and white stripes. Trace down one stripe smoothly.",
        "audio_prompt": "Trace down one stripe smoothly.",
        "3D_animation": "/animations/zebra_stripes.json",
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
          "options": [
            "black",
            "yellow",
            "green"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_18",
    "title": "Gideon Goldfish's Bubble Pop",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Glub glub! Gideon goldfish is blowing soft bubbles. Hold the screen to blow a big bubble.",
        "audio_prompt": "Hold the screen to blow a big bubble.",
        "3D_animation": "/animations/goldfish_bubble.json",
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
          "options": [
            "purple",
            "orange",
            "green"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_19",
    "title": "Hattie Hippo's Mud Bath",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hattie hippo loves cooling off in the mud pond. Trace a gentle circle in the mud.",
        "audio_prompt": "Trace a gentle circle in the mud.",
        "3D_animation": "/animations/hippo_mud.json",
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
          "options": [
            "brown",
            "blue",
            "pink"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_20",
    "title": "Iggy Iguana's Sunny Rock",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "nature",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Iggy iguana warms up on a smooth sunlit rock. Hold your touch to let the sun shine.",
        "audio_prompt": "Hold your touch to let the sun shine.",
        "3D_animation": "/animations/iguana_sun.json",
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
          "options": [
            "red",
            "yellow",
            "blue"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_21",
    "title": "The Friendly Caterpillar's Leaf",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "nature",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Munch, munch! Trace a line down the big green leaf for the caterpillar.",
        "audio_prompt": "Trace a line down the big green leaf for the caterpillar.",
        "3D_animation": "/animations/caterpillar_leaf.json",
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
          "options": [
            "purple",
            "green",
            "red"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_22",
    "title": "The Yellow School Bus Drive",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "city",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Beep beep! The yellow school bus is driving to school. Trace a line to guide the bus.",
        "audio_prompt": "Trace a line to guide the bus.",
        "3D_animation": "/animations/yellow_bus.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the big YELLOW bus!",
        "audio_prompt": "Tap the YELLOW bus!",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": [
            "yellow",
            "red",
            "purple"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_23",
    "title": "Goodnight Little Star",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "space",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Twinkle twinkle little star. Hold down screen to make the star glow softly.",
        "audio_prompt": "Hold down screen to make the star glow softly.",
        "3D_animation": "/animations/star_glowing.json",
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
          "options": [
            "square",
            "star",
            "circle"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_24",
    "title": "Sammy's Sunny Meadow Ride",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "meadow",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Glide along the grassy trail. Trace a smooth curve to guide Sammy.",
        "audio_prompt": "Trace a smooth curve to guide Sammy.",
        "3D_animation": "/animations/meadow_trail.json",
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
          "options": [
            "red",
            "green",
            "blue"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_25",
    "title": "Little Cloud's Rain Sprinkles",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "sky",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Pitter patter! Hold down your finger to make gentle rain drops fall.",
        "audio_prompt": "Hold down your finger to make gentle rain drops fall.",
        "3D_animation": "/animations/rain_drops.json",
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
          "options": [
            "blue",
            "yellow",
            "orange"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_26",
    "title": "Ollie Octopus's Eight Arms",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Ollie octopus loves to wiggle his soft arms. Trace a big spiral to wiggle with Ollie.",
        "audio_prompt": "Trace a big spiral to wiggle with Ollie.",
        "3D_animation": "/animations/octopus_wiggle.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the PURPLE octopus!",
        "audio_prompt": "Tap the PURPLE octopus!",
        "puzzle": {
          "type": "color_match",
          "target_color": "purple",
          "options": [
            "orange",
            "purple",
            "green"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_27",
    "title": "Freddie Fox's Cozy Den",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "forest",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Freddie fox curls up in his warm grassy den. Touch and hold the screen to help Freddie sleep.",
        "audio_prompt": "Touch and hold the screen to help Freddie sleep.",
        "3D_animation": "/animations/fox_sleeping.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Find Freddie's fluffy RED tail!",
        "audio_prompt": "Find Freddie's fluffy RED tail!",
        "puzzle": {
          "type": "color_match",
          "target_color": "red",
          "options": [
            "blue",
            "red",
            "yellow"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_28",
    "title": "Dottie Dolphin's High Jump",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Dottie dolphin leaps over the ocean wave. Trace an arch over the blue wave.",
        "audio_prompt": "Trace an arch over the blue wave.",
        "3D_animation": "/animations/dolphin_leap.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the BLUE ocean wave!",
        "audio_prompt": "Tap the BLUE ocean wave!",
        "puzzle": {
          "type": "color_match",
          "target_color": "blue",
          "options": [
            "pink",
            "blue",
            "green"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_29",
    "title": "Barnaby Bear's Honey Pot",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "forest",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Barnaby bear found a sweet honey pot! Hold your touch to let Barnaby taste the honey.",
        "audio_prompt": "Hold your touch to let Barnaby taste the honey.",
        "3D_animation": "/animations/bear_honey.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which pot has sweet YELLOW honey?",
        "audio_prompt": "Which pot has sweet YELLOW honey?",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": [
            "yellow",
            "black",
            "purple"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_30",
    "title": "Tilly Tiger's Soft Paws",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "jungle",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Tilly tiger tiptoes softly through the jungle grass. Trace a straight line across the grass.",
        "audio_prompt": "Trace a straight line across the grass.",
        "3D_animation": "/animations/tiger_walk.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap Tilly's bright ORANGE stripes!",
        "audio_prompt": "Tap Tilly's bright ORANGE stripes!",
        "puzzle": {
          "type": "color_match",
          "target_color": "orange",
          "options": [
            "blue",
            "orange",
            "white"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_31",
    "title": "Percy Peacock's Colorful Feathers",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "garden",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Percy peacock spreads his pretty tail feathers. Hold the screen to see them bloom.",
        "audio_prompt": "Hold the screen to see them bloom.",
        "3D_animation": "/animations/peacock_bloom.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Find the shiny GREEN feather!",
        "audio_prompt": "Find the shiny GREEN feather!",
        "puzzle": {
          "type": "color_match",
          "target_color": "green",
          "options": [
            "green",
            "red",
            "brown"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_32",
    "title": "Timmy Squirrel's Nut Hunt",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "forest",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Timmy squirrel found a tiny acorn! Trace a path up the oak tree for Timmy.",
        "audio_prompt": "Trace a path up the oak tree for Timmy.",
        "3D_animation": "/animations/squirrel_climb.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which acorn is BROWN?",
        "audio_prompt": "Which acorn is BROWN?",
        "puzzle": {
          "type": "color_match",
          "target_color": "brown",
          "options": [
            "pink",
            "brown",
            "blue"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_33",
    "title": "Penny Pony's Gentle Trot",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Clip clop! Penny pony trots along the farm trail. Gently trace a wave to guide Penny.",
        "audio_prompt": "Gently trace a wave to guide Penny.",
        "3D_animation": "/animations/pony_trot.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the friendly BROWN pony!",
        "audio_prompt": "Tap the friendly BROWN pony!",
        "puzzle": {
          "type": "color_match",
          "target_color": "brown",
          "options": [
            "yellow",
            "brown",
            "black"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_34",
    "title": "Carly Cow's Sweet Milk",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Moo! Carly cow rests under the big farm barn. Hold down touch to give Carly a pat.",
        "audio_prompt": "Hold down touch to give Carly a pat.",
        "3D_animation": "/animations/cow_barn.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the WHITE milk bucket!",
        "audio_prompt": "Tap the WHITE milk bucket!",
        "puzzle": {
          "type": "color_match",
          "target_color": "white",
          "options": [
            "white",
            "green",
            "purple"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_35",
    "title": "Danny Dog's Lost Bone",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "home",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Woof woof! Danny dog is digging for his toy bone. Trace a zig-zag in the backyard sand.",
        "audio_prompt": "Trace a zig-zag in the backyard sand.",
        "3D_animation": "/animations/dog_dig.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which bone is WHITE?",
        "audio_prompt": "Which bone is WHITE?",
        "puzzle": {
          "type": "color_match",
          "target_color": "white",
          "options": [
            "orange",
            "white",
            "blue"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_36",
    "title": "Bella Butterfly's Garden Dance",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "garden",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Bella butterfly flutter-flies over pink roses. Trace a circle loop around the flower.",
        "audio_prompt": "Trace a circle loop around the flower.",
        "3D_animation": "/animations/butterfly_dance.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the soft PINK butterfly wings!",
        "audio_prompt": "Tap the soft PINK butterfly wings!",
        "puzzle": {
          "type": "color_match",
          "target_color": "pink",
          "options": [
            "pink",
            "black",
            "yellow"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_37",
    "title": "Robby Robot's Beep Beep",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "space",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Beep boop! Robby robot charges his shiny battery. Hold screen to power up Robby.",
        "audio_prompt": "Hold screen to power up Robby.",
        "3D_animation": "/animations/robot_charge.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape is Robby's square head?",
        "audio_prompt": "Which shape is Robby's square head?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "square",
          "options": [
            "square",
            "circle",
            "triangle"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_38",
    "title": "Sammy Snail's Slow Path",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "garden",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Sammy snail crawls super slowly across the garden path. Trace a tiny spiral for Sammy.",
        "audio_prompt": "Trace a tiny spiral for Sammy.",
        "3D_animation": "/animations/snail_crawl.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape is Sammy's round shell?",
        "audio_prompt": "Which shape is Sammy's round shell?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "circle",
          "options": [
            "triangle",
            "circle",
            "square"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_39",
    "title": "Tommy Firetruck's Rescue",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "city",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Nee-naw! Tommy firetruck drives down the road. Trace a line to help Tommy reach the park.",
        "audio_prompt": "Trace a line to help Tommy reach the park.",
        "3D_animation": "/animations/firetruck_drive.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the bright RED firetruck!",
        "audio_prompt": "Tap the bright RED firetruck!",
        "puzzle": {
          "type": "color_match",
          "target_color": "red",
          "options": [
            "blue",
            "red",
            "green"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_40",
    "title": "Penny Pig's Muddy Splash",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Oink oink! Penny pig loves splashing in muddy puddles. Hold your touch to make a big splash.",
        "audio_prompt": "Hold your touch to make a big splash.",
        "3D_animation": "/animations/pig_mud.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the sweet PINK piglet!",
        "audio_prompt": "Tap the sweet PINK piglet!",
        "puzzle": {
          "type": "color_match",
          "target_color": "pink",
          "options": [
            "pink",
            "black",
            "yellow"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_41",
    "title": "Eli Elephant's Water Shower",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "savannah",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Eli elephant sprays fresh water with his long trunk. Hold down screen to spray water.",
        "audio_prompt": "Hold down screen to spray water.",
        "3D_animation": "/animations/elephant_spray.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the BLUE water splash!",
        "audio_prompt": "Tap the BLUE water splash!",
        "puzzle": {
          "type": "color_match",
          "target_color": "blue",
          "options": [
            "orange",
            "blue",
            "red"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_42",
    "title": "Ricky Rooster's Sunrise",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Cock-a-doodle-doo! Ricky rooster sings as the sun comes up. Trace up to raise the sun.",
        "audio_prompt": "Trace up to raise the sun.",
        "3D_animation": "/animations/rooster_sunrise.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the warm YELLOW sun!",
        "audio_prompt": "Tap the warm YELLOW sun!",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": [
            "yellow",
            "purple",
            "black"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_43",
    "title": "Suki Sloth's Tree Nap",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "jungle",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Suki sloth swings slowly on a cozy branch. Touch and hold to help Suki nap.",
        "audio_prompt": "Touch and hold to help Suki nap.",
        "3D_animation": "/animations/sloth_nap.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which tree branch is GREEN?",
        "audio_prompt": "Which tree branch is GREEN?",
        "puzzle": {
          "type": "color_match",
          "target_color": "green",
          "options": [
            "red",
            "green",
            "blue"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_44",
    "title": "Charly Chick's Peep Peep",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "farm",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Peep peep! Charly chick hops out of his egg shell. Trace a line to help Charly hop.",
        "audio_prompt": "Trace a line to help Charly hop.",
        "3D_animation": "/animations/chick_hop.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the fluffy YELLOW chick!",
        "audio_prompt": "Tap the fluffy YELLOW chick!",
        "puzzle": {
          "type": "color_match",
          "target_color": "yellow",
          "options": [
            "blue",
            "yellow",
            "pink"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_45",
    "title": "Toby Train's Choo Choo Track",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "city",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Choo choo! Toby train rolls along the smooth track. Trace the straight track for Toby.",
        "audio_prompt": "Trace the straight track for Toby.",
        "3D_animation": "/animations/train_track.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the RED train engine!",
        "audio_prompt": "Tap the RED train engine!",
        "puzzle": {
          "type": "color_match",
          "target_color": "red",
          "options": [
            "green",
            "red",
            "yellow"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_46",
    "title": "Harry Hedgehog's Rolled Ball",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "forest",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Harry hedgehog rolls into a tiny cute ball. Hold your finger to cuddle Harry.",
        "audio_prompt": "Hold your finger to cuddle Harry.",
        "3D_animation": "/animations/hedgehog_roll.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape is Harry when he rolls up?",
        "audio_prompt": "Which shape is Harry when he rolls up?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "circle",
          "options": [
            "square",
            "circle",
            "triangle"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_47",
    "title": "Fiona Flamingo's One-Leg Balance",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "pond",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Fiona flamingo balances gracefully on one leg. Touch and hold to balance with Fiona.",
        "audio_prompt": "Touch and hold to balance with Fiona.",
        "3D_animation": "/animations/flamingo_balance.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the PINK flamingo!",
        "audio_prompt": "Tap the PINK flamingo!",
        "puzzle": {
          "type": "color_match",
          "target_color": "pink",
          "options": [
            "pink",
            "blue",
            "green"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_48",
    "title": "Benny Beetle's Shiny Shell",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "nature",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Benny ladybug crawls over a green leaf. Trace a gentle arch to guide Benny.",
        "audio_prompt": "Trace a gentle arch to guide Benny.",
        "3D_animation": "/animations/ladybug_crawl.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Tap the RED ladybug shell!",
        "audio_prompt": "Tap the RED ladybug shell!",
        "puzzle": {
          "type": "color_match",
          "target_color": "red",
          "options": [
            "black",
            "red",
            "yellow"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_49",
    "title": "Kiki Koala's Leaf Feast",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "forest",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Kiki koala hugs her favorite eucalyptus tree. Hold screen to help Kiki munch.",
        "audio_prompt": "Hold screen to help Kiki munch.",
        "3D_animation": "/animations/koala_hug.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which leaf is GREEN for Kiki?",
        "audio_prompt": "Which leaf is GREEN for Kiki?",
        "puzzle": {
          "type": "color_match",
          "target_color": "green",
          "options": [
            "orange",
            "green",
            "purple"
          ]
        }
      }
    ]
  },
  {
    "story_id": "story_toddler_50",
    "title": "Little Rocket's Moon Launch",
    "target_age_group": "1-3",
    "difficulty_level": "beginner",
    "theme": "space",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "3... 2... 1... Blastoff! Trace straight up into the sky to launch the rocket.",
        "audio_prompt": "Trace straight up into the sky to launch the rocket.",
        "3D_animation": "/animations/rocket_launch.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape is glowing on the rocket booster?",
        "audio_prompt": "Which shape is glowing on the rocket booster?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "star",
          "options": [
            "square",
            "star",
            "circle"
          ]
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
