"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, Home, Lock, Moon } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import { FREE_STORY_COUNT, useProAccess } from "@/hooks/useProAccess";
import {
  BEDTIME_STORIES,
  getBedtimeStoryYouTubeId,
  getYouTubeVideoId,
  type BedtimeStory,
} from "@/utils/bedtimeStories";
import BedtimeYouTubePlayer from "@/components/BedtimeYouTubePlayer";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { stopKidsSpeech } from "@/utils/speech";
import { recordStoryCompleted } from "@/utils/trophies";

type BedtimeStoryPlayerProps = {
  storyId: string;
  routeLabel: string;
};

export default function BedtimeStoryPlayer({ storyId, routeLabel }: BedtimeStoryPlayerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { isPro } = useProAccess();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [allStories, setAllStories] = useState<BedtimeStory[]>(BEDTIME_STORIES);
  const [loadingStories, setLoadingStories] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stories/bedtime", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.stories) && data.stories.length > 0) {
          setAllStories(data.stories as BedtimeStory[]);
        }
      } catch {
        // keep static fallback
      } finally {
        if (!cancelled) setLoadingStories(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const storyIndex = useMemo(
    () => allStories.findIndex((s) => s.story_id === storyId),
    [allStories, storyId],
  );
  const story = storyIndex >= 0 ? allStories[storyIndex] : null;
  const isLockedStory = !isPro && storyIndex >= FREE_STORY_COUNT;
  const youtubeVideoId = useMemo(() => {
    if (!story) return null;
    if (story.youtube_url_en) {
      const fromUrl = getYouTubeVideoId(story.youtube_url_en);
      if (fromUrl) return fromUrl;
    }
    return getBedtimeStoryYouTubeId(story.story_id);
  }, [story]);
  const nextStoryId = useMemo(() => {
    if (!story) return null;
    const currentIndex = allStories.findIndex(
      (s) => s.story_id === story.story_id,
    );
    if (currentIndex >= 0 && currentIndex + 1 < allStories.length) {
      return allStories[currentIndex + 1].story_id;
    }
    return null;
  }, [allStories, story]);

  // Never use browser TTS on individual bedtime story pages — recorded film voice only.
  useEffect(() => {
    stopKidsSpeech();
    return () => stopKidsSpeech();
  }, [storyId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !story?.video_url) return;
    const apply = () => {
      // Bedtime keeps its own film pace (YouTube later). Do not apply parent slow control here.
      try {
        video.playbackRate = 1;
        video.defaultPlaybackRate = 1;
      } catch {
        // ignore
      }
      video.muted = false;
    };
    apply();
    // Cancel any leftover library TTS as soon as the recorded story can play.
    stopKidsSpeech();
    video.addEventListener("loadedmetadata", apply);
    video.addEventListener("play", stopKidsSpeech);
    return () => {
      video.removeEventListener("loadedmetadata", apply);
      video.removeEventListener("play", stopKidsSpeech);
    };
  }, [story?.video_url, ready]);

  if (!story && loadingStories) {
    return (
      <div className="kid-card animate-pulse space-y-4 border-indigo-200 bg-white p-6">
        <div className="h-6 w-1/2 rounded bg-indigo-100" />
        <div className="aspect-video w-full rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="kid-card space-y-4 border-rose-200 bg-white p-6 text-center">
        <p className="text-lg font-bold text-slate-800">Story not found</p>
        <MotionPressable
          onClick={() => router.push("/games/stories/bedtime")}
          ariaLabel="Back to bedtime stories"
          className="mx-auto flex items-center justify-center gap-2 rounded-2xl border-b-4 border-indigo-300 bg-indigo-500 px-4 py-3 text-base font-bold text-white shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          Bedtime stories
        </MotionPressable>
      </div>
    );
  }

  if (isLockedStory && story) {
    return (
      <div className="kid-card mx-auto max-w-md space-y-4 border-amber-200 bg-white p-6 text-center shadow-xl">
        <Lock className="mx-auto h-10 w-10 text-amber-500" aria-hidden />
        <h1 className="text-2xl font-extrabold text-slate-800">{story.title}</h1>
        <p className="text-sm font-medium text-slate-600">
          Stories 1–6 are free! Upgrade to Growva Junior Pro to watch Stories 7+ and unlock the full bedtime library.
        </p>
        <div className="flex flex-col gap-2.5 pt-2">
          <MotionPressable
            onClick={() => router.push("/upgrade")}
            ariaLabel="Unlock Pro"
            className="w-full rounded-2xl border-b-4 border-amber-600 bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-base font-extrabold text-white shadow-lg"
          >
            Unlock Pro Membership
          </MotionPressable>
          <MotionPressable
            onClick={() => router.push("/games/stories/bedtime")}
            ariaLabel="Back to bedtime stories"
            className="w-full rounded-2xl border-b-4 border-slate-200 bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700"
          >
            Back to Bedtime Stories
          </MotionPressable>
        </div>
      </div>
    );
  }

  if (!story.is_ready || (!story.video_url && !youtubeVideoId)) {
    return (
      <div className="kid-card space-y-4 border-indigo-200 bg-white p-6 text-center">
        <Moon className="mx-auto h-10 w-10 text-indigo-500" aria-hidden />
        <h1 className="text-2xl font-bold text-slate-800">{story.title}</h1>
        <p className="text-base text-slate-600">This bedtime story is coming soon.</p>
        <MotionPressable
          onClick={() => router.push("/games/stories/bedtime")}
          ariaLabel="Back to bedtime stories"
          className="mx-auto flex items-center justify-center gap-2 rounded-2xl border-b-4 border-indigo-300 bg-indigo-500 px-4 py-3 text-base font-bold text-white shadow-lg"
        >
          <BookOpen className="h-5 w-5" aria-hidden />
          All bedtime stories
        </MotionPressable>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="kid-card border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-5">
        <p className="flex items-center gap-1.5 text-sm font-bold uppercase text-indigo-600">
          <Moon className="h-4 w-4" aria-hidden />
          {routeLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">{story.title}</h1>
        {story.moral ? (
          <p className="mt-2 text-base font-medium text-slate-600">
            Moral: {story.moral}
          </p>
        ) : null}
      </section>

      {/* Stories 1 to 18: Strict Child-Locked YouTube Player with End-Screen Suppression & 0.75x Speed */}
      {youtubeVideoId ? (
        <BedtimeYouTubePlayer
          videoId={youtubeVideoId}
          story={story}
          nextStoryId={nextStoryId}
          onStoryComplete={() => {
            void recordStoryCompleted(`bedtime:${story.story_id}`, {
              userId: user?.id,
              childId: activeChild?.id,
              existingTrophies: activeChild?.unlocked_trophies,
            });
          }}
        />
      ) : (
        /* Fallback video player */
        <div className="kid-card overflow-hidden border-indigo-200 bg-slate-900 p-0 shadow-xl">
          <video
            ref={videoRef}
            src={story.video_url ?? undefined}
            className="aspect-video w-full bg-black object-contain"
            controls
            playsInline
            preload="auto"
            poster={story.cover_image}
            onLoadedData={() => setReady(true)}
            onEnded={() => {
              void recordStoryCompleted(`bedtime:${story.story_id}`, {
                userId: user?.id,
                childId: activeChild?.id,
                existingTrophies: activeChild?.unlocked_trophies,
              });
            }}
          />
          {!ready && (
            <p className="bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-indigo-100">
              Loading bedtime film…
            </p>
          )}
        </div>
      )}

      <nav
        aria-label="Bedtime story navigation"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <MotionPressable
          onClick={() => router.push("/games/stories/bedtime")}
          ariaLabel="Back to bedtime stories"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-700 shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          All bedtime stories
        </MotionPressable>
        <MotionPressable
          onClick={() => router.push("/")}
          ariaLabel="Go to homepage"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-indigo-300 bg-indigo-500 px-4 py-3 text-base font-bold text-white shadow-lg"
        >
          <Home className="h-5 w-5" aria-hidden />
          Home
        </MotionPressable>
      </nav>
    </div>
  );
}
