import type { Metadata } from "next";
import ToddlerStoriesLibrary from "@/components/ToddlerStoriesLibrary";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/stories/toddlers");

export const metadata: Metadata = {
  title: route.label,
};

export default function ToddlerStoriesPage() {
  return <ToddlerStoriesLibrary routeLabel={route.label} />;
}
