import type { Metadata } from "next";
import BedtimeStoriesLibrary from "@/components/BedtimeStoriesLibrary";
import { getRouteMeta } from "@/utils/navigation";

export const dynamic = "force-dynamic";

const route = getRouteMeta("/games/stories/bedtime");

export const metadata: Metadata = {
  title: route.label,
};

export default function BedtimeStoriesPage() {
  return <BedtimeStoriesLibrary routeLabel={route.label} />;
}
