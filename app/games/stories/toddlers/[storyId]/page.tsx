import type { Metadata } from "next";
import ToddlerStoryDetail from "@/components/ToddlerStoryDetail";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/stories/toddlers");

type PageProps = {
  params: Promise<{ storyId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { storyId } = await params;
  return {
    title: `${storyId} · ${route.label}`,
  };
}

export default async function ToddlerStoryPage({ params }: PageProps) {
  const { storyId } = await params;
  return <ToddlerStoryDetail storyId={storyId} routeLabel={route.label} />;
}
