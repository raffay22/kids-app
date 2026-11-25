"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Home, Lock } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import { FREE_STORY_COUNT, useProAccess } from "@/hooks/useProAccess";
import {
  fetchStories,
  getStoryCoverUrl,
  type StoryRecord,
} from "@/utils/iqStories";
import { triggerHaptic } from "@/utils/haptics";

type ToddlerStoriesLibraryProps = {
  routeLabel: string;
};

export default function ToddlerStoriesLibrary({ routeLabel }: ToddlerStoriesLibraryProps) {
  const router = useRouter();
  const { isPro } = useProAccess();
  const [lockedTitle, setLockedTitle] = useState<string | null>(null);
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchStories("1-3");
      setStories(list);
      setLoading(false);
    };
    void load();
  }, []);

  const openStory = (story: StoryRecord, index: number) => {
    triggerHaptic(30);
    if (!isPro && index >= FREE_STORY_COUNT) {
      setLockedTitle(story.title);
      return;
    }
    router.push(`/games/stories/toddlers/${story.story_id}`);
  };

  if (loading) {
    return (
      <div className="space-y-5" aria-label="Loading toddler stories">
        <section className="kid-card animate-pulse border-sky-100 bg-sky-50/70 p-5">
          <div className="h-4 w-32 rounded bg-sky-200" />
          <div className="mt-2 h-7 w-48 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-100" />
        </section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={`tod-skel-${n}`}
              className="kid-card animate-pulse overflow-hidden border-sky-100 bg-white p-0 shadow-md"
            >
              <div className="aspect-video w-full bg-sky-100" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="h-3.5 w-1/3 rounded bg-sky-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="kid-card border-sky-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 p-5">
        <p className="flex items-center gap-1.5 text-sm font-bold uppercase text-sky-600">
          <BookOpen className="h-4 w-4" aria-hidden />
          {routeLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
          Pick a story
        </h1>
        <p className="mt-1 text-base text-slate-600">
          Tap a cover to jump into that adventure.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story, index) => {
          const cover = getStoryCoverUrl(story);
          const isLocked = !isPro && index >= FREE_STORY_COUNT;
          return (
            <motion.button
              key={story.story_id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 24 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openStory(story, index)}
              className="kid-card relative overflow-hidden border-sky-200 bg-white p-0 text-left shadow-lg"
            >
              <div className="relative aspect-video w-full bg-gradient-to-br from-sky-200 to-cyan-300">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt=""
                    className={`h-full w-full object-cover ${isLocked ? "opacity-75" : ""}`}
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                {isLocked && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-amber-200 bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-950 shadow-md">
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    Pro 🔒
                  </span>
                )}
              </div>
              <div className="space-y-1 p-4">
                <h2 className="text-lg font-bold text-slate-800">{story.title}</h2>
                <p className="text-sm font-semibold capitalize text-sky-600">{story.theme}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <ProUpgradeModal
        open={Boolean(lockedTitle)}
        onClose={() => setLockedTitle(null)}
        title={`Unlock "${lockedTitle ?? "Toddler Story"}"`}
        description="Stories 1–6 are permanently free! Upgrade to Growva Junior Pro to unlock Stories 7+ and every new toddler story added."
      />

      <MotionPressable
        onClick={() => router.push("/")}
        ariaLabel="Go to homepage"
        className="mx-auto flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-300 bg-sky-500 px-5 py-3 text-base font-bold text-white shadow-lg"
      >
        <Home className="h-5 w-5" aria-hidden />
        Home
      </MotionPressable>
    </div>
  );
}
