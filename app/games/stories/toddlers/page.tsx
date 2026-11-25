import type { Metadata } from "next";
import ToddlerStoriesLibrary from "@/components/ToddlerStoriesLibrary";
import { getRouteMeta } from "@/utils/navigation";

export const dynamic = "force-dynamic";

const route = getRouteMeta("/games/stories/toddlers");

export const metadata: Metadata = {
  title: route.label,
};

export default function ToddlerStoriesPage() {
  return <ToddlerStoriesLibrary routeLabel={route.label} />;
}
