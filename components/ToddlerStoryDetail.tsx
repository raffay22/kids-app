"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ToddlerStoryPlayer from "@/components/ToddlerStoryPlayer";
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

  return (
    <ToddlerStoryPlayer story={story} stories={stories} routeLabel={routeLabel} />
  );
}
