-- Task 6: IQ Stories table + seed stories + RLS
-- Run after 005_sentences_table.sql

CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  target_age_group VARCHAR(10) NOT NULL CHECK (target_age_group IN ('1-3', '3-6')),
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  theme VARCHAR(50) DEFAULT 'general',
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_age_group ON public.stories(target_age_group, is_active);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stories_public_read ON public.stories;
CREATE POLICY stories_public_read ON public.stories
  FOR SELECT USING (is_active = true);

-- Seed starter stories (expand via Supabase dashboard or bulk import)
INSERT INTO public.stories (story_id, title, target_age_group, difficulty_level, theme, content)
VALUES
  (
    'story_toddler_01',
    'Sammy the Turtle''s Slow Swim',
    '1-3',
    'beginner',
    'ocean',
    '{
      "scenes": [
        {
          "scene_number": 1,
          "narrative_text": "Sammy the turtle wants to swim home. Tap the water to help him glide!",
          "audio_prompt": "Sammy wants to swim home. Tap the water!",
          "visual_asset_keyword": "water",
          "lottie_animation": "/lottie/water.json"
        },
        {
          "scene_number": 2,
          "narrative_text": "A red starfish is sleeping. Tap RED to wake it up!",
          "audio_prompt": "Tap the RED starfish!",
          "visual_asset_keyword": "fish",
          "puzzle": {
            "type": "color_match",
            "target_color": "red",
            "options": ["red", "blue", "green"],
            "correct_answer": "red"
          }
        }
      ]
    }'::jsonb
  ),
  (
    'story_kids_01',
    'Rocket Launch & Star Collection',
    '3-6',
    'easy',
    'space',
    '{
      "character_name": "Leo",
      "scenes": [
        {
          "scene_number": 1,
          "narrative_text": "Leo needs star power! Tap the sun to charge the rocket!",
          "audio_prompt": "Tap the sun to charge the rocket!",
          "visual_asset_keyword": "sun",
          "lottie_animation": "/lottie/sun.json"
        },
        {
          "scene_number": 2,
          "narrative_text": "Which shape fits the wing? Pick the TRIANGLE!",
          "audio_prompt": "Pick the triangle shape!",
          "visual_asset_keyword": "ball",
          "puzzle": {
            "type": "shape_tangram",
            "correct_shape": "triangle",
            "options": ["square", "triangle", "circle"]
          }
        }
      ]
    }'::jsonb
  ),
  (
    'story_kids_02',
    'Friendly Jungle Elephant Splash',
    '3-6',
    'easy',
    'jungle',
    '{
      "character_name": "Ellie",
      "scenes": [
        {
          "scene_number": 1,
          "narrative_text": "Ellie splashes in the river! Tap the water!",
          "audio_prompt": "Tap the water to splash!",
          "visual_asset_keyword": "water",
          "lottie_animation": "/lottie/water.json"
        },
        {
          "scene_number": 2,
          "narrative_text": "Which one does NOT belong in the jungle?",
          "audio_prompt": "Which object does not belong?",
          "visual_asset_keyword": "elephant",
          "puzzle": {
            "type": "odd_one_out",
            "correct_odd_item": "pizza",
            "options": ["tree", "elephant", "pizza"]
          }
        }
      ]
    }'::jsonb
  )
ON CONFLICT (story_id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  theme = EXCLUDED.theme,
  difficulty_level = EXCLUDED.difficulty_level;

COMMENT ON TABLE public.stories IS 'Interactive IQ stories for /games/stories/* routes. content JSONB holds scenes array.';
