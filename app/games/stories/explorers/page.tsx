import type { Metadata } from "next";
import StoryEngine from "@/components/StoryEngine";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/stories/explorers");

export const metadata: Metadata = {
  title: route.label,
};

export default function ExplorerStoriesPage() {
  return <StoryEngine ageGroup="3-6" routeLabel={route.label} />;
}
