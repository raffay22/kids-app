"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, Home, Moon } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import { getBedtimeStory } from "@/utils/bedtimeStories";
import {
  applyKidsMediaPlaybackRate,
  KIDS_SPEECH_PITCH,
  KIDS_SPEECH_RATE,
  speakEnglish,
} from "@/utils/speech";

type BedtimeStoryPlayerProps = {
  storyId: string;
  routeLabel: string;
};

export default function BedtimeStoryPlayer({ storyId, routeLabel }: BedtimeStoryPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const story = useMemo(() => getBedtimeStory(storyId), [storyId]);

  useEffect(() => {
    if (!story?.is_ready || !story.video_url) return;
    speakEnglish(story.title, { rate: KIDS_SPEECH_RATE, pitch: KIDS_SPEECH_PITCH });
  }, [story]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !story?.video_url) return;
    const apply = () => applyKidsMediaPlaybackRate(video);
    apply();
    video.addEventListener("loadedmetadata", apply);
    video.addEventListener("play", apply);
    return () => {
      video.removeEventListener("loadedmetadata", apply);
      video.removeEventListener("play", apply);
    };
  }, [story?.video_url, ready]);

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

  if (!story.is_ready || !story.video_url) {
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

      <div className="kid-card overflow-hidden border-indigo-200 bg-slate-900 p-0 shadow-xl">
        <video
          ref={videoRef}
          src={story.video_url}
          className="aspect-video w-full bg-black object-contain"
          controls
          playsInline
          preload="auto"
          poster={story.cover_image}
          onLoadedData={() => setReady(true)}
        />
        {!ready && (
          <p className="bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-indigo-100">
            Loading bedtime film…
          </p>
        )}
      </div>

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
          Stories list
        </MotionPressable>
        <MotionPressable
          onClick={() => router.push("/")}
          ariaLabel="Go to homepage"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-300 bg-sky-500 px-4 py-3 text-base font-bold text-white shadow-lg"
        >
          <Home className="h-5 w-5" aria-hidden />
          Home
        </MotionPressable>
      </nav>
    </div>
  );
}
