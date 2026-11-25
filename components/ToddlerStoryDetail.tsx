"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import ToddlerStoryPlayer from "@/components/ToddlerStoryPlayer";
import { FREE_STORY_COUNT, useProAccess } from "@/hooks/useProAccess";
import {
  fetchStories,
  findStoryById,
  type StoryRecord,
} from "@/utils/iqStories";

type ToddlerStoryDetailProps = {
  storyId: string;
  routeLabel: string;
};

export default function ToddlerStoryDetail({
  storyId,
  routeLabel,
}: ToddlerStoryDetailProps) {
  const { isPro } = useProAccess();
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

  if (loading) {
    return (
      <div className="glass-card p-6 text-center text-slate-600">Loading story…</div>
    );
  }

  const story = findStoryById(stories, storyId);
  const storyIndex = stories.findIndex((s) => s.story_id === storyId);
  if (!story) {
    return (
      <div className="kid-card space-y-3 border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-lg font-bold text-amber-800">Story not found</p>
        <Link
          href="/games/stories/toddlers"
          className="inline-block font-bold text-sky-700 underline"
        >
          Back to stories
        </Link>
      </div>
    );
  }

  if (!isPro && storyIndex >= FREE_STORY_COUNT) {
    return (
      <div className="kid-card mx-auto max-w-md space-y-4 border-amber-200 bg-white p-6 text-center shadow-xl">
        <Lock className="mx-auto h-10 w-10 text-amber-500" aria-hidden />
        <h1 className="text-2xl font-extrabold text-slate-800">{story.title}</h1>
        <p className="text-sm font-medium text-slate-600">
          Stories 1–6 are free! Upgrade to Growva Junior Pro to unlock Stories 7+ and the full toddler library.
        </p>
        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href="/upgrade"
            className="inline-flex w-full items-center justify-center rounded-2xl border-b-4 border-amber-600 bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-base font-extrabold text-white shadow-lg"
          >
            Unlock Pro Membership
          </Link>
          <Link
            href="/games/stories/toddlers"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700"
          >
            Back to Toddler Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ToddlerStoryPlayer story={story} stories={stories} routeLabel={routeLabel} />
  );
}
