"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, Star, Trophy } from "lucide-react";
import StoryScene from "@/components/StoryScene";
import SlowSpeedControl from "@/components/SlowSpeedControl";
import MotionPressable from "@/components/MotionPressable";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { createClient } from "@/utils/supabase/client";
import { burstConfetti, playDing } from "@/utils/celebrate";
import { handleGuestAward } from "@/utils/awardProgress";
import { logProgress } from "@/utils/logProgress";
import { stopKidsSpeech } from "@/utils/speech";
import { recordStoryCompleted } from "@/utils/trophies";
import {
  getAdjacentStoryIds,
  type StoryRecord,
} from "@/utils/iqStories";

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
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const awardedScenesRef = useRef<Set<number>>(new Set());
  const trophyUnlockedRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);

  const scenes = story.content.scenes ?? [];
  const { nextId, index } = useMemo(
    () => getAdjacentStoryIds(stories, story.story_id),
    [stories, story.story_id],
  );

  useEffect(() => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setCurrentSceneIdx(0);
    awardedScenesRef.current = new Set();
    setCompletedCount(0);
    return () => {
      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
    };
  }, [story.story_id]);

  // Toddler story pages: recorded scene voice only — never browser TTS.
  useEffect(() => {
    stopKidsSpeech();
    return () => stopKidsSpeech();
  }, [story.story_id]);

  const awardActionStars = useCallback(
    async (sceneNumber: number) => {
      if (!activeChild) return;
      if (awardedScenesRef.current.has(sceneNumber)) return;
      awardedScenesRef.current.add(sceneNumber);

      const nextCount = awardedScenesRef.current.size;
      setCompletedCount(nextCount);
      burstConfetti();
      playDing();
      setMessage(`Action complete! +${STARS_PER_STORY_ACTION} stars`);

      if (nextCount >= scenes.length && !trophyUnlockedRef.current) {
        trophyUnlockedRef.current = true;
        void recordStoryCompleted(`toddler:${story.story_id}`, {
          userId: user?.id,
          childId: activeChild?.id,
          existingTrophies: activeChild?.unlocked_trophies,
        });
      }

      if (
        handleGuestAward({
          userId: user?.id,
          childId: activeChild?.id,
          deltaStars: STARS_PER_STORY_ACTION,
        })
      ) {
        return;
      }

      try {
        const supabase = createClient();
        const newStars = (activeChild.stars ?? 0) + STARS_PER_STORY_ACTION;

        await supabase
          .from("children")
          .update({ stars: newStars })
          .eq("id", activeChild.id);

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
    [activeChild, scenes.length, user, profile, story.story_id, refreshChildren, refreshProfile],
  );

  const goPrev = () => {
    router.push(LIBRARY_HREF);
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

      <SlowSpeedControl label="Story voice speed" />

      {/* Step Indicators for Scenes */}
      {scenes.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {scenes.map((s, idx) => (
            <button
              key={`scene-tab-${s.scene_number}`}
              type="button"
              onClick={() => {
                if (advanceTimerRef.current) {
                  window.clearTimeout(advanceTimerRef.current);
                  advanceTimerRef.current = null;
                }
                setCurrentSceneIdx(idx);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition shadow-sm ${
                idx === currentSceneIdx
                  ? "bg-sky-500 text-white shadow-md scale-105"
                  : idx < currentSceneIdx || awardedScenesRef.current.has(s.scene_number)
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              Scene {idx + 1} {awardedScenesRef.current.has(s.scene_number) ? "✓" : ""}
            </button>
          ))}
        </div>
      )}

      {/* Play one scene at a time so voices never clash */}
      {scenes[currentSceneIdx] && (
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center">
          <div className="w-full max-w-2xl flex-1">
            <StoryScene
              key={`${story.story_id}-${scenes[currentSceneIdx].scene_number}`}
              story={story}
              scene={scenes[currentSceneIdx]}
              sceneIndex={currentSceneIdx}
              totalScenes={scenes.length}
              showContinueAction={false}
              autoPlayNarration={false}
              onSceneComplete={() => {
                void awardActionStars(scenes[currentSceneIdx].scene_number);
                // Auto advance to next scene when current is finished
                if (currentSceneIdx < scenes.length - 1) {
                  if (advanceTimerRef.current) {
                    window.clearTimeout(advanceTimerRef.current);
                  }
                  advanceTimerRef.current = window.setTimeout(() => {
                    setCurrentSceneIdx((prev) => prev + 1);
                    advanceTimerRef.current = null;
                  }, 1500);
                }
              }}
            />
          </div>

          {currentSceneIdx < scenes.length - 1 && (
            <button
              type="button"
              onClick={() => {
                if (advanceTimerRef.current) {
                  window.clearTimeout(advanceTimerRef.current);
                  advanceTimerRef.current = null;
                }
                setCurrentSceneIdx((prev) => Math.min(scenes.length - 1, prev + 1));
              }}
              aria-label={`Next Part: Scene ${currentSceneIdx + 2}`}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 self-end rounded-2xl border-b-4 border-sky-600 bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-sky-600 hover:to-indigo-600 active:scale-95 sm:self-center sm:flex-col sm:px-3.5 sm:py-5"
            >
              <span>Next Part</span>
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          )}
        </div>
      )}

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
          ariaLabel="Back to stories"
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
