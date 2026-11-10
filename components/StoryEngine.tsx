"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Trophy } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import StoryScene from "@/components/StoryScene";
import { createClient } from "@/utils/supabase/client";
import { burstConfetti, playDing } from "@/utils/celebrate";
import { logProgress } from "@/utils/logProgress";
import { useTTS } from "@/hooks/useTTS";
import {
  fetchStories,
  type StoryAgeGroup,
  type StoryRecord,
} from "@/utils/iqStories";

const IQ_STORY_TROPHY = "iq-story-champion";
const STARS_AWARD = 10;

type StoryEngineProps = {
  ageGroup: StoryAgeGroup;
  routeLabel: string;
};

export default function StoryEngine({ ageGroup, routeLabel }: StoryEngineProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speakPraise } = useTTS();

  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchStories(ageGroup);
      setStories(list);
      setStoryIndex(0);
      setSceneIndex(0);
      setLoading(false);
    };
    void load();
  }, [ageGroup]);

  const currentStory = stories[storyIndex] ?? null;
  const scenes = currentStory?.content.scenes ?? [];
  const currentScene = scenes[sceneIndex] ?? null;

  const awardCompletion = useCallback(async () => {
    if (!user || !activeChild || !currentStory) return;

    try {
      const supabase = createClient();
      const trophies = activeChild.unlocked_trophies ?? [];
      const updatedTrophies = trophies.includes(IQ_STORY_TROPHY)
        ? trophies
        : [...trophies, IQ_STORY_TROPHY];

      await supabase
        .from("children")
        .update({
          stars: (activeChild.stars ?? 0) + STARS_AWARD,
          unlocked_trophies: updatedTrophies,
        })
        .eq("id", activeChild.id);

      const profileTrophies = profile?.unlocked_trophies ?? [];
      if (!profileTrophies.includes(IQ_STORY_TROPHY)) {
        await supabase
          .from("profiles")
          .update({ unlocked_trophies: [...profileTrophies, IQ_STORY_TROPHY] })
          .eq("id", user.id);
      }

      await refreshChildren();
      await refreshProfile();
    } catch {
      // offline ok
    }
  }, [user, activeChild, currentStory, profile, refreshChildren, refreshProfile]);

  const advanceStory = useCallback(() => {
    if (stories.length === 0) return;

    burstConfetti();
    playDing();
    speakPraise();
    setMessage("Story complete! Starting the next adventure…");

    if (user && activeChild && currentStory) {
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/games/stories",
        attempt_type: "tap",
        target_word: currentStory.story_id,
        is_correct: true,
      });
      void awardCompletion();
    }

    setTimeout(() => {
      setStoryIndex((prev) => (prev + 1) % stories.length);
      setSceneIndex(0);
      setMessage(null);
    }, 1400);
  }, [stories.length, user, activeChild, currentStory, speakPraise, awardCompletion]);

  const handleSceneComplete = useCallback(() => {
    if (!currentStory) return;

    const isLastScene = sceneIndex >= scenes.length - 1;
    if (isLastScene) {
      advanceStory();
    } else {
      setSceneIndex((prev) => prev + 1);
    }
  }, [currentStory, sceneIndex, scenes.length, advanceStory]);

  if (loading) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">Loading stories…</div>
    );
  }

  if (!currentStory || !currentScene) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">No stories available yet.</div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="kid-card border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-5">
        <p className="flex items-center gap-1.5 text-sm font-bold uppercase text-sky-600">
          <BookOpen className="h-4 w-4" aria-hidden />
          {routeLabel}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">{currentStory.title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Story {storyIndex + 1} of {stories.length} · {currentStory.difficulty_level}
        </p>
      </section>

      <StoryScene
        story={currentStory}
        scene={currentScene}
        sceneIndex={sceneIndex}
        totalScenes={scenes.length}
        onSceneComplete={handleSceneComplete}
      />

      {message && (
        <p className="flex items-center justify-center gap-2 text-center text-lg font-bold text-amber-700">
          <Trophy className="h-5 w-5" aria-hidden />
          {message}
        </p>
      )}
    </div>
  );
}
