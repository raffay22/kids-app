"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Moon } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import {
  BEDTIME_STORIES_PER_PAGE,
  getBedtimePageCount,
  getBedtimeStoriesPage,
  type BedtimeStory,
} from "@/utils/bedtimeStories";
import { triggerHaptic } from "@/utils/haptics";
import {
  KIDS_SPEECH_PITCH,
  KIDS_SPEECH_RATE,
  speakEnglish,
} from "@/utils/speech";

type BedtimeStoriesLibraryProps = {
  routeLabel: string;
};

export default function BedtimeStoriesLibrary({ routeLabel }: BedtimeStoriesLibraryProps) {
  const router = useRouter();
  const totalPages = getBedtimePageCount();
  const [page, setPage] = useState(1);

  const stories = useMemo(() => getBedtimeStoriesPage(page), [page]);
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  const openStory = (story: BedtimeStory) => {
    triggerHaptic(30);
    if (!story.is_ready || !story.video_url) {
      speakEnglish(`${story.title} is coming soon!`, {
        rate: KIDS_SPEECH_RATE,
        pitch: KIDS_SPEECH_PITCH,
      });
      return;
    }
    router.push(`/games/stories/bedtime/${story.story_id}`);
    // Title speech happens on the player page; leaving pages stops unfinished speech.
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story, index) => (
          <motion.button
            key={`${story.story_id}-p${page}`}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 24 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openStory(story)}
            className="kid-card overflow-hidden border-indigo-200 bg-white p-0 text-left shadow-lg"
          >
            <div className="relative aspect-video w-full bg-gradient-to-br from-indigo-200 to-sky-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.cover_image}
                alt=""
                className={`h-full w-full object-cover ${story.is_ready ? "" : "opacity-60"}`}
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {!story.is_ready && (
                <span className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-center text-xs font-bold uppercase tracking-wide text-indigo-700 shadow">
                  Coming soon
                </span>
              )}
            </div>
            <div className="space-y-1 p-4">
              <h2 className="text-lg font-bold text-slate-800">{story.title}</h2>
              <p className="text-sm font-semibold capitalize text-indigo-600">{story.theme}</p>
              <p className="text-sm text-slate-500">{story.blurb}</p>
            </div>
          </motion.button>
        ))}
      </div>

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
