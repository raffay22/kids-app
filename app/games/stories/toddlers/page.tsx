import type { Metadata } from "next";
import StoryEngine from "@/components/StoryEngine";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/stories/toddlers");

export const metadata: Metadata = {
  title: route.label,
};

export default function ToddlerStoriesPage() {
  return <StoryEngine ageGroup="1-3" routeLabel={route.label} />;
}
