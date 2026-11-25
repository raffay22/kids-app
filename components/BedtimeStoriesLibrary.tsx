"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Lock, Moon, Volume2 } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import { FREE_STORY_COUNT, useProAccess } from "@/hooks/useProAccess";
import {
  BEDTIME_STORIES,
  BEDTIME_STORIES_PER_PAGE,
  getBedtimeStoryYouTubeId,
  getYouTubeVideoId,
  type BedtimeStory,
} from "@/utils/bedtimeStories";
import { triggerHaptic } from "@/utils/haptics";
import {
  KIDS_SPEECH_PITCH,
  KIDS_SPEECH_RATE,
  speakEnglish,
  stopKidsSpeech,
} from "@/utils/speech";

type BedtimeStoriesLibraryProps = {
  routeLabel: string;
};

export default function BedtimeStoriesLibrary({ routeLabel }: BedtimeStoriesLibraryProps) {
  const router = useRouter();
  const { isPro } = useProAccess();
  const [lockedTitle, setLockedTitle] = useState<string | null>(null);
  const [allStories, setAllStories] = useState<BedtimeStory[]>(BEDTIME_STORIES);
  const [loadingStories, setLoadingStories] = useState(true);
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(allStories.length / BEDTIME_STORIES_PER_PAGE));

  const stories = useMemo(() => {
    const safe = Math.min(Math.max(1, page), totalPages);
    const start = (safe - 1) * BEDTIME_STORIES_PER_PAGE;
    return allStories.slice(start, start + BEDTIME_STORIES_PER_PAGE);
  }, [allStories, page, totalPages]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  useEffect(() => {
    speakEnglish("Bedtime Stories. Soft night tales with a kind moral.", {
      rate: KIDS_SPEECH_RATE,
      pitch: KIDS_SPEECH_PITCH,
    });
    return () => stopKidsSpeech();
  }, []);

  const hearStoryTitle = (story: BedtimeStory, event: MouseEvent) => {
    event.stopPropagation();
    triggerHaptic(20);
    speakEnglish(
      story.is_ready
        ? story.title
        : `${story.title} is coming soon!`,
      { rate: KIDS_SPEECH_RATE, pitch: KIDS_SPEECH_PITCH },
    );
  };

  const openStory = (story: BedtimeStory, globalIndex: number) => {
    triggerHaptic(30);
    if (!isPro && globalIndex >= FREE_STORY_COUNT) {
      stopKidsSpeech();
      setLockedTitle(story.title);
      return;
    }
    // TTS stays on this library page only. Ready stories open silently —
    // each story route plays the recorded ElevenLabs / film voice alone.
    if (!story.is_ready || (!story.video_url && !story.youtube_url_en)) {
      speakEnglish(`${story.title} is coming soon!`, {
        rate: KIDS_SPEECH_RATE,
        pitch: KIDS_SPEECH_PITCH,
      });
      return;
    }
    stopKidsSpeech();
    router.push(`/games/stories/bedtime/${story.story_id}`);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    triggerHaptic(20);
    setPage(nextPage);
  };

  const goPrevPage = () => goToPage(page - 1);
  const goNextPage = () => goToPage(page + 1);

  return (
    <div className="space-y-5">
      <section className="kid-card border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-5">
        <p className="flex items-center gap-1.5 text-sm font-bold uppercase text-indigo-600">
          <Moon className="h-4 w-4" aria-hidden />
          {routeLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
          Bedtime Stories
        </h1>
        <p className="mt-1 text-base text-slate-600">
          Soft night tales with a kind moral. {BEDTIME_STORIES_PER_PAGE} stories on each page.
        </p>
        <p className="mt-2 text-sm font-semibold text-indigo-600">
          Page {page} of {totalPages}
        </p>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Jump to bedtime page">
          {pageNumbers.map((pageNumber) => (
            <button
              key={`bedtime-page-${pageNumber}`}
              type="button"
              onClick={() => goToPage(pageNumber)}
              aria-current={page === pageNumber ? "page" : undefined}
              className={`min-w-10 rounded-xl border-b-4 px-3 py-2 text-sm font-bold shadow ${
                page === pageNumber
                  ? "border-indigo-400 bg-indigo-500 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </section>

      {loadingStories ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading bedtime stories">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={`bt-skel-${n}`}
              className="kid-card animate-pulse overflow-hidden border-indigo-100 bg-white p-0 shadow-md"
            >
              <div className="aspect-video w-full bg-indigo-100" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="h-3.5 w-1/3 rounded bg-indigo-100" />
                <div className="h-3.5 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story, index) => {
          const globalIndex = (page - 1) * BEDTIME_STORIES_PER_PAGE + index;
          const isLocked = !isPro && globalIndex >= FREE_STORY_COUNT;
          return (
          <motion.div
            key={`${story.story_id}-p${page}`}
            role="button"
            tabIndex={0}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 24 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openStory(story, globalIndex)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openStory(story, globalIndex);
              }
            }}
            className="kid-card cursor-pointer overflow-hidden border-indigo-200 bg-white p-0 text-left shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <div className="relative aspect-video w-full bg-gradient-to-br from-indigo-200 to-sky-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.cover_image}
                alt=""
                className={`h-full w-full object-cover ${story.is_ready && !isLocked ? "" : "opacity-75"}`}
                onError={(event) => {
                  const img = event.currentTarget as HTMLImageElement;
                  const ytId =
                    (story.youtube_url_en ? getYouTubeVideoId(story.youtube_url_en) : null) ||
                    getBedtimeStoryYouTubeId(story.story_id);
                  if (ytId && !img.src.includes("youtube.com") && !img.src.includes("ytimg.com")) {
                    img.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                    return;
                  }
                  img.style.display = "none";
                }}
              />
              {isLocked && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-amber-200 bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-950 shadow-md">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  Pro 🔒
                </span>
              )}
              {!story.is_ready && (
                <span className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-center text-xs font-bold uppercase tracking-wide text-indigo-700 shadow">
                  Coming soon
                </span>
              )}
            </div>
            <div className="space-y-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-800">{story.title}</h2>
                <button
                  type="button"
                  onClick={(event) => hearStoryTitle(story, event)}
                  aria-label={`Hear ${story.title}`}
                  className="shrink-0 rounded-full bg-indigo-50 p-2 text-indigo-700 shadow-sm hover:bg-indigo-100"
                >
                  <Volume2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="text-sm font-semibold capitalize text-indigo-600">{story.theme}</p>
              <p className="text-sm text-slate-500">{story.blurb}</p>
            </div>
          </motion.div>
          );
        })}
      </div>
      )}

      <ProUpgradeModal
        open={Boolean(lockedTitle)}
        onClose={() => setLockedTitle(null)}
        title={`Unlock "${lockedTitle ?? "Bedtime Story"}"`}
        description="Stories 1–6 are permanently free! Upgrade to Growva Junior Pro to unlock Stories 7–18 and every new bedtime story added."
      />

      <nav
        aria-label="Bedtime stories pages"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <MotionPressable
          onClick={goPrevPage}
          ariaLabel="Previous stories page"
          className={`flex items-center justify-center gap-2 rounded-2xl border-b-4 px-4 py-3 text-base font-bold shadow-lg ${
            page <= 1
              ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
              : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          Previous page
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
          onClick={goNextPage}
          ariaLabel="Next stories page"
          className={`flex items-center justify-center gap-2 rounded-2xl border-b-4 px-4 py-3 text-base font-bold shadow-lg ${
            page >= totalPages
              ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
              : "border-indigo-300 bg-indigo-500 text-white"
          }`}
        >
          Next page
          <ChevronRight className="h-5 w-5" aria-hidden />
        </MotionPressable>
      </nav>
    </div>
  );
}
