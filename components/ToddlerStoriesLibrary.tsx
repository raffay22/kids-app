"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Home } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import {
  fetchStories,
  getStoryCoverUrl,
  type StoryRecord,
} from "@/utils/iqStories";
import { triggerHaptic } from "@/utils/haptics";
import { speakEnglish } from "@/utils/speech";

type ToddlerStoriesLibraryProps = {
  routeLabel: string;
};

export default function ToddlerStoriesLibrary({ routeLabel }: ToddlerStoriesLibraryProps) {
  const router = useRouter();
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

  const openStory = (story: StoryRecord) => {
    triggerHaptic(30);
    speakEnglish(`Let's open ${story.title}!`, { rate: 0.95, pitch: 1.08 });
    router.push(`/games/stories/toddlers/${story.story_id}`);
  };

  if (loading) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">Loading stories…</div>
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
          return (
            <motion.button
              key={story.story_id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 24 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openStory(story)}
              className="kid-card overflow-hidden border-sky-200 bg-white p-0 text-left shadow-lg"
            >
              <div className="aspect-video w-full bg-gradient-to-br from-sky-200 to-cyan-300">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
              </div>
              <div className="space-y-1 p-4">
                <h2 className="text-lg font-bold text-slate-800">{story.title}</h2>
                <p className="text-sm font-semibold capitalize text-sky-600">{story.theme}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

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
