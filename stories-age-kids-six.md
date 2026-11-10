-- Step 1: Ensure Table Schema Matches TASKS.md Exactly
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  target_age_group VARCHAR(10) NOT NULL, -- '1-3' or '3-6'
  difficulty_level VARCHAR(20) DEFAULT 'advanced',
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

-- Step 2: Insert 100 Smart IQ Stories for Ages 3 to 6
INSERT INTO public.stories (story_id, title, target_age_group, difficulty_level, theme, content)
SELECT 
  item->>'story_id',
  item->>'title',
  item->>'target_age_group',
  COALESCE(item->>'difficulty_level', 'advanced'),
  COALESCE(item->>'theme', 'general'),
  item AS content
FROM jsonb_array_elements('
[
  {
    "story_id": "story_kids_01",
    "title": "Astronaut Leo''s Constellation Bridge",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "space",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Rocket engine needs star power! Hold down smoothly to charge the glowing thruster.",
        "audio_prompt": "Hold down smoothly to charge the glowing thruster.",
        "lottie_animation": "/animations/rocket_launch.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Leo needs a TRIANGLE tile to repair the space wing. Which shape fits the gap?",
        "audio_prompt": "Which shape fits the triangular wing gap?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "triangle",
          "options": ["square", "triangle", "hexagon"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_02",
    "title": "Detective Fox & The Missing Pattern",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "mystery",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Detective Fox found a secret code on the vault: Red Star, Blue Moon, Red Star... What comes next?",
        "audio_prompt": "Red Star, Blue Moon, Red Star... What comes next in the secret pattern?",
        "lottie_animation": "/animations/detective_magnifier.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Complete the pattern to unlock the vault door!",
        "audio_prompt": "Complete the pattern to unlock the vault door!",
        "puzzle": {
          "type": "pattern_sequence",
          "sequence": ["red_star", "blue_moon", "red_star"],
          "correct_answer": "blue_moon",
          "options": ["red_star", "blue_moon", "yellow_sun"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_03",
    "title": "Professor Owl''s Gravity Engine",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "science",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Help Professor Owl construct a magnetic gear train. Trace along the magnetic rail.",
        "audio_prompt": "Trace along the magnetic rail.",
        "lottie_animation": "/animations/owl_lab.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which object does NOT belong in a science laboratory toolkit?",
        "audio_prompt": "Which object does NOT belong in a science lab?",
        "puzzle": {
          "type": "odd_one_out",
          "correct_odd_item": "banana",
          "options": ["microscope", "beaker", "banana"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_04",
    "title": "Captain Maya''s Deep Sea Submarine",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Dive deep into the ocean trench. Hold touch to keep submarine lights steady.",
        "audio_prompt": "Hold touch to keep submarine lights steady.",
        "lottie_animation": "/animations/submarine_dive.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Find the sea creature with EIGHT tentacles!",
        "audio_prompt": "Find the sea creature with eight tentacles!",
        "puzzle": {
          "type": "object_match",
          "correct_item": "octopus",
          "options": ["starfish", "octopus", "dolphin"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_05",
    "title": "Maya''s Solar System Rover",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "space",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Guide the Mars Rover across crater dunes. Trace a line smoothly along the ridge.",
        "audio_prompt": "Trace a line smoothly along the ridge.",
        "lottie_animation": "/animations/mars_rover.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which planet is famous for its large shiny RINGS?",
        "audio_prompt": "Which planet has giant rings?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "saturn",
          "options": ["mars", "saturn", "moon"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_06",
    "title": "Chef Marco''s Rainbow Recipe",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "cooking",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Chef Marco is making soup. Hold down to stir the pot continuously.",
        "audio_prompt": "Hold down to stir the pot continuously.",
        "lottie_animation": "/animations/cooking_pot.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which ingredient does NOT belong in a fruit salad?",
        "audio_prompt": "Which ingredient does NOT belong in a fruit salad?",
        "puzzle": {
          "type": "odd_one_out",
          "correct_odd_item": "broccoli",
          "options": ["apple", "banana", "broccoli"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_07",
    "title": "Zoe''s Volcano Crystal Hunt",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "geology",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace along the rocky ledge to reach the glowing purple crystal.",
        "audio_prompt": "Trace along the rocky ledge to reach the crystal.",
        "lottie_animation": "/animations/volcano_crystal.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Complete the crystal sequence: Gem, Diamond, Gem... What is next?",
        "audio_prompt": "Gem, Diamond, Gem... What comes next?",
        "puzzle": {
          "type": "pattern_sequence",
          "sequence": ["gem", "diamond", "gem"],
          "correct_answer": "diamond",
          "options": ["gem", "diamond", "coin"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_08",
    "title": "The Time Traveler''s Clock Work",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "history",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold touch to turn the golden clock gear and power up the machine.",
        "audio_prompt": "Hold touch to turn the golden clock gear.",
        "lottie_animation": "/animations/clock_gears.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape fits into the central gear shaft?",
        "audio_prompt": "Which shape fits the central gear shaft?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "hexagon",
          "options": ["circle", "hexagon", "triangle"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_09",
    "title": "Engineer Eli''s Suspension Bridge",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "building",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace the steel cable line from tower to tower to build the bridge.",
        "audio_prompt": "Trace the steel cable line across towers.",
        "lottie_animation": "/animations/bridge_construction.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which vehicle uses tracks instead of wheels to move heavy dirt?",
        "audio_prompt": "Which machine uses tracks to move dirt?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "bulldozer",
          "options": ["racecar", "bulldozer", "bicycle"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_10",
    "title": "Sammy''s Rainforest Weather Station",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "nature",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold the screen to measure raindrops in the weather collector.",
        "audio_prompt": "Hold the screen to measure raindrops.",
        "lottie_animation": "/animations/weather_station.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which tool measures air temperature?",
        "audio_prompt": "Which tool measures temperature?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "thermometer",
          "options": ["compass", "thermometer", "ruler"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_11",
    "title": "The Solar Powered Windmill",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "energy",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace a circle to spin the giant wind turbine blades.",
        "audio_prompt": "Trace a circle to spin the wind turbine blades.",
        "lottie_animation": "/animations/wind_turbine.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "What provides natural light and heat to solar panels?",
        "audio_prompt": "What provides light to solar panels?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "sun",
          "options": ["moon", "sun", "flashlight"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_12",
    "title": "Captain Cora''s Coral Reef Cleaning",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace along the coral bed to scoop up plastic debris.",
        "audio_prompt": "Trace along the coral bed to clean debris.",
        "lottie_animation": "/animations/coral_clean.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which item does NOT belong in the clean ocean environment?",
        "audio_prompt": "Which item does NOT belong in the ocean?",
        "puzzle": {
          "type": "odd_one_out",
          "correct_odd_item": "plastic_bottle",
          "options": ["clownfish", "coral", "plastic_bottle"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_13",
    "title": "The Archaeologist''s Fossil Dig",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "history",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold touch to gently brush dirt away from a T-Rex fossil.",
        "audio_prompt": "Hold touch to gently brush dirt away from the fossil.",
        "lottie_animation": "/animations/fossil_brush.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which tool do scientists use to magnify small fossils?",
        "audio_prompt": "Which tool magnifies tiny objects?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "magnifying_glass",
          "options": ["hammer", "magnifying_glass", "shovel"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_14",
    "title": "Luna''s Moonlight Telescope",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "space",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Slowly trace the lens cylinder to focus the giant telescope.",
        "audio_prompt": "Trace to focus the telescope lens.",
        "lottie_animation": "/animations/telescope_focus.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Identify the constellation shaped like a BIG DIPPER ladle!",
        "audio_prompt": "Find the constellation shaped like a ladle.",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "dipper",
          "options": ["star_cluster", "dipper", "orbit_ring"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_15",
    "title": "Robo-Dog''s Circuit Board",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "technology",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Connect the glowing copper wire path to power Robo-Dog.",
        "audio_prompt": "Connect the glowing copper wire path.",
        "lottie_animation": "/animations/robot_circuit.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Complete the light sequence: Red, Green, Red... What is next?",
        "audio_prompt": "Red, Green, Red... What light comes next?",
        "puzzle": {
          "type": "pattern_sequence",
          "sequence": ["red_led", "green_led", "red_led"],
          "correct_answer": "green_led",
          "options": ["red_led", "green_led", "blue_led"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_16",
    "title": "The Deep Jungle Canopy Cable",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "jungle",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Glide along the zip line over the tall rainforest canopy.",
        "audio_prompt": "Glide along the zip line smoothly.",
        "lottie_animation": "/animations/zipline_canopy.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which animal is a primate that swings from branches?",
        "audio_prompt": "Which animal swings from branches?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "gibbon",
          "options": ["crocodile", "gibbon", "jaguar"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_17",
    "title": "Subsea Oil Cleanup Drone",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold touch to power the eco-drone laser cleaning arm.",
        "audio_prompt": "Hold touch to power the eco-drone arm.",
        "lottie_animation": "/animations/ocean_drone.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which tool uses sonar soundwaves to map dark water?",
        "audio_prompt": "Which tool maps ocean depths using soundwaves?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "sonar_radar",
          "options": ["compass", "sonar_radar", "flashlight"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_18",
    "title": "The Mountain Rescue Chopper",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "rescue",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Spin the helicopter rotor blades by making smooth circular motions.",
        "audio_prompt": "Spin the helicopter rotor blades smoothly.",
        "lottie_animation": "/animations/rescue_chopper.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which emergency item belongs in a medical first aid kit?",
        "audio_prompt": "Which item belongs in a first aid kit?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "bandage",
          "options": ["bandage", "hammer", "paint_can"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_19",
    "title": "The Arctic Weather Station Beacon",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "arctic",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold down to warm up the frost-covered antenna beacon.",
        "audio_prompt": "Hold down to warm up the antenna beacon.",
        "lottie_animation": "/animations/arctic_beacon.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which animal has thick white fur built for freezing blizzards?",
        "audio_prompt": "Which animal has thick white fur for cold snow?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "polar_bear",
          "options": ["camel", "polar_bear", "parrot"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_20",
    "title": "Nico''s Hydroelectric Dam",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "engineering",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace the flowing river pathway through the dam turbine gate.",
        "audio_prompt": "Trace the flowing river pathway through the gate.",
        "lottie_animation": "/animations/hydro_dam.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "What force causes water to flow downward towards the riverbed? GRAVITY!",
        "audio_prompt": "What force pulls water downward?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "gravity_symbol",
          "options": ["magnet", "gravity_symbol", "wind_icon"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_21",
    "title": "The Secret Garden Puzzle Maze",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "garden",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace the twisting garden path to find the hidden golden key.",
        "audio_prompt": "Trace the garden path to find the hidden key.",
        "lottie_animation": "/animations/garden_maze.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which flower blooms only at night with glowing petals?",
        "audio_prompt": "Which flower blooms at night with glowing petals?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "moonflower",
          "options": ["sunflower", "moonflower", "rose"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_22",
    "title": "The Pirate''s Treasure Map Trail",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "adventure",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace the dotted treasure trail across the island map.",
        "audio_prompt": "Trace the treasure trail across the island.",
        "lottie_animation": "/animations/treasure_map.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Complete the treasure symbol pattern: Skull, Crossbones, Skull... What next?",
        "audio_prompt": "Skull, Crossbones, Skull... What comes next?",
        "puzzle": {
          "type": "pattern_sequence",
          "sequence": ["skull", "crossbones", "skull"],
          "correct_answer": "crossbones",
          "options": ["skull", "crossbones", "parrot"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_23",
    "title": "Dr. Penguin''s Iceberg Lab",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "arctic",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold to drill through the thick Arctic ice for samples.",
        "audio_prompt": "Hold to drill through the Arctic ice.",
        "lottie_animation": "/animations/ice_drilling.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which creature uses echolocation to navigate icy waters?",
        "audio_prompt": "Which creature uses echolocation in icy waters?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "beluga_whale",
          "options": ["beluga_whale", "seal", "walrus"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_24",
    "title": "The Desert Dune Buggy Race",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "desert",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace the winding dune track to guide the buggy to the oasis.",
        "audio_prompt": "Trace the winding dune track.",
        "lottie_animation": "/animations/desert_race.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which desert plant stores water in its thick stem?",
        "audio_prompt": "Which plant stores water in its thick stem?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "cactus",
          "options": ["cactus", "palm_tree", "fern"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_25",
    "title": "The Quantum Light Maze",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "science",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Bounce the laser beam off mirrors to reach the quantum sensor.",
        "audio_prompt": "Bounce the laser beam to reach the sensor.",
        "lottie_animation": "/animations/quantum_maze.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which tool splits white light into a rainbow spectrum?",
        "audio_prompt": "Which tool splits white light into a rainbow?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "prism",
          "options": ["prism", "lens", "mirror"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_26",
    "title": "The Little Astronaut''s Rocket Parts",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "space",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold to connect the booster rocket segments together.",
        "audio_prompt": "Hold to connect the booster segments.",
        "lottie_animation": "/animations/rocket_assemble.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape makes the best nose cone for a rocket?",
        "audio_prompt": "Which shape is best for a rocket nose cone?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "triangle",
          "options": ["triangle", "circle", "square"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_27",
    "title": "The Deep Forest Survival Kit",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "nature",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace along the river bend to find clean drinking water.",
        "audio_prompt": "Trace along the river bend.",
        "lottie_animation": "/animations/forest_river.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which item does NOT belong in a wilderness survival kit?",
        "audio_prompt": "Which item does NOT belong in a survival kit?",
        "puzzle": {
          "type": "odd_one_out",
          "correct_odd_item": "video_game",
          "options": ["compass", "video_game", "flashlight"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_28",
    "title": "The Underwater Volcano Exploration",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "ocean",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold to power the submersible''s thermal sensors near the volcano.",
        "audio_prompt": "Hold to power the submersible sensors.",
        "lottie_animation": "/animations/underwater_volcano.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which creature glows in the dark near deep sea vents?",
        "audio_prompt": "Which creature glows near deep sea vents?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "anglerfish",
          "options": ["anglerfish", "shark", "turtle"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_29",
    "title": "The Butterfly Migration Tracker",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "nature",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace the migration route of monarch butterflies across the map.",
        "audio_prompt": "Trace the butterfly migration route.",
        "lottie_animation": "/animations/butterfly_tracker.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Complete the wing pattern sequence: Orange, Black, Orange... What next?",
        "audio_prompt": "Orange, Black, Orange... What comes next?",
        "puzzle": {
          "type": "pattern_sequence",
          "sequence": ["orange", "black", "orange"],
          "correct_answer": "black",
          "options": ["orange", "black", "yellow"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_30",
    "title": "The Construction Crane Puzzle",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "building",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Hold to lift the heavy steel beam to the top floor.",
        "audio_prompt": "Hold to lift the steel beam upward.",
        "lottie_animation": "/animations/crane_lift.json",
        "interaction_type": "hold_breath",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which shape gives a skyscraper the most stability?",
        "audio_prompt": "Which shape is most stable for a skyscraper?",
        "puzzle": {
          "type": "shape_tangram",
          "correct_shape": "square",
          "options": ["square", "circle", "triangle"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_31",
    "title": "The Museum Art Heist Mystery",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "mystery",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace the security camera blind spots to reach the painting.",
        "audio_prompt": "Trace the security camera blind spots.",
        "lottie_animation": "/animations/art_heist.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which art style uses tiny dots to create images?",
        "audio_prompt": "Which art style uses tiny dots?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "pointillism",
          "options": ["pointillism", "cubism", "abstract"]
        }
      }
    ]
  },
  {
    "story_id": "story_kids_32",
    "title": "The Sonar Navigation System",
    "target_age_group": "3-6",
    "difficulty_level": "advanced",
    "theme": "technology",
    "scenes": [
      {
        "scene_number": 1,
        "narrative_text": "Trace the sonar ping waves to map the underwater canyon.",
        "audio_prompt": "Trace the sonar ping waves.",
        "lottie_animation": "/animations/sonar_system.json",
        "interaction_type": "slow_trace",
        "calm_speed_limit": true
      },
      {
        "scene_number": 2,
        "narrative_text": "Which animal uses natural sonar to find its way?",
        "audio_prompt": "Which animal uses natural sonar?",
        "puzzle": {
          "type": "object_match",
          "correct_item": "bat",
          "options": ["bat", "eagle", "lion"]
        }
      }
    ]
  },
  {
    "story_id": "story_k