import type { Metadata } from "next";
import BedtimeStoryPlayer from "@/components/BedtimeStoryPlayer";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/stories/bedtime");

type PageProps = {
  params: Promise<{ storyId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { storyId } = await params;
  return {
    title: `${storyId} · ${route.label}`,
  };
}

export default async function BedtimeStoryPage({ params }: PageProps) {
  const { storyId } = await params;
  return <BedtimeStoryPlayer storyId={storyId} routeLabel={route.label} />;
}
