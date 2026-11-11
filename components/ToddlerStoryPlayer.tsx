"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, Star, Trophy } from "lucide-react";
import StoryScene from "@/components/StoryScene";
import MotionPressable from "@/components/MotionPressable";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { createClient } from "@/utils/supabase/client";
import { burstConfetti, playDing } from "@/utils/celebrate";
import { logProgress } from "@/utils/logProgress";
import { useTTS } from "@/hooks/useTTS";
import {
  getAdjacentStoryIds,
  type StoryRecord,
} from "@/utils/iqStories";

const IQ_STORY_TROPHY = "iq-story-champion";
/** Stars awarded to the child profile for each completed IQ story action. */
export const STARS_PER_STORY_ACTION = 5;
const LIBRARY_HREF = "/games/stories/toddlers";

type ToddlerStoryPlayerProps = {
  story: StoryRecord;
  stories: StoryRecord[];
  routeLabel?: string;
};

export default function ToddlerStoryPlayer({
  story,
  stories,
  routeLabel = "Stories Under 3 Years",
}: ToddlerStoryPlayerProps) {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speakPraise } = useTTS();
  const [message, setMessage] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const awardedScenesRef = useRef<Set<number>>(new Set());
  const trophyUnlockedRef = useRef(false);

  const scenes = story.content.scenes ?? [];
  const { prevId, nextId, index } = useMemo(
    () => getAdjacentStoryIds(stories, story.story_id),
    [stories, story.story_id],
  );

  const awardActionStars = useCallback(
    async (sceneNumber: number) => {
      if (!activeChild) return;
      if (awardedScenesRef.current.has(sceneNumber)) return;
      awardedScenesRef.current.add(sceneNumber);

      const nextCount = awardedScenesRef.current.size;
      setCompletedCount(nextCount);
      burstConfetti();
      playDing();
      speakPraise();
      setMessage(`Action complete! +${STARS_PER_STORY_ACTION} stars`);

      try {
        const supabase = createClient();
        const newStars = (activeChild.stars ?? 0) + STARS_PER_STORY_ACTION;

        await supabase
          .from("children")
          .update({ stars: newStars })
          .eq("id", activeChild.id);

        if (nextCount >= scenes.length && user && !trophyUnlockedRef.current) {
          trophyUnlockedRef.current = true;
          const trophies = activeChild.unlocked_trophies ?? [];
          if (!trophies.includes(IQ_STORY_TROPHY)) {
            await supabase
              .from("children")
              .update({ unlocked_trophies: [...trophies, IQ_STORY_TROPHY] })
              .eq("id", activeChild.id);
          }
          const profileTrophies = profile?.unlocked_trophies ?? [];
          if (!profileTrophies.includes(IQ_STORY_TROPHY)) {
            await supabase
              .from("profiles")
              .update({ unlocked_trophies: [...profileTrophies, IQ_STORY_TROPHY] })
              .eq("id", user.id);
          }
        }

        if (user) {
          void logProgress({
            user_id: user.id,
            child_id: activeChild.id,
            feature_route: "/games/stories/toddlers",
            attempt_type: "tap",
            target_word: `${story.story_id}:scene${sceneNumber}`,
            is_correct: true,
          });
        }

        await refreshChildren();
        await refreshProfile();
      } catch {
        // offline — stars sync on next refresh
      }
    },
    [activeChild, scenes.length, user, profile, story.story_id, speakPraise, refreshChildren, refreshProfile],
  );

  const goPrev = () => {
    if (prevId) router.push(`${LIBRARY_HREF}/${prevId}`);
    else router.push(LIBRARY_HREF);
  };

  const goNext = () => {
    if (nextId) router.push(`${LIBRARY_HREF}/${nextId}`);
    else router.push(LIBRARY_HREF);
  };

  return (
    <div className="space-y-5">
      <section className="kid-card border-sky-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-600">{routeLabel}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">{story.title}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>
            Story {index >= 0 ? index + 1 : 1} of {stories.length}
          </span>
          <span aria-hidden>·</span>
          <span>
            Actions {completedCount}/{scenes.length}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
            +{STARS_PER_STORY_ACTION} stars per action
          </span>
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {scenes.map((scene, sceneIndex) => (
          <StoryScene
            key={`${story.story_id}-${scene.scene_number}`}
            story={story}
            scene={scene}
            sceneIndex={sceneIndex}
            totalScenes={scenes.length}
            showContinueAction={false}
            autoPlayNarration
            onSceneComplete={() => void awardActionStars(scene.scene_number)}
          />
        ))}
      </div>

      {message && (
        <p className="flex items-center justify-center gap-2 text-center text-lg font-bold text-amber-700">
          <Trophy className="h-5 w-5" aria-hidden />
          {message}
        </p>
      )}

      <nav
        aria-label="Story navigation"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <MotionPressable
          onClick={goPrev}
          ariaLabel="Previous story"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-700 shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          Previous
        </MotionPressable>
        <MotionPressable
          onClick={() => router.push("/")}
          ariaLabel="Go to homepage"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-300 bg-sky-500 px-4 py-3 text-base font-bold text-white shadow-lg"
        >
          <Home className="h-5 w-5" aria-hidden />
          Home
        </MotionPressable>
        <MotionPressable
          onClick={goNext}
          ariaLabel="Next story"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-300 bg-emerald-500 px-4 py-3 text-base font-bold text-white shadow-lg"
        >
          Next
          <ChevronRight className="h-5 w-5" aria-hidden />
        </MotionPressable>
      </nav>
    </div>
  );
}
