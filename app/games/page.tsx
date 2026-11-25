import type { Metadata } from "next";
import GamesHub from "@/components/GamesHub";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games");

export const metadata: Metadata = {
  title: route.label,
};

export default function GamesPage() {
  return <GamesHub />;
}
