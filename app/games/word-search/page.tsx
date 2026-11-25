import type { Metadata } from "next";
import WordSearchGame from "@/components/WordSearchGame";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/word-search");

export const metadata: Metadata = {
  title: route.label,
};

export default function WordSearchPage() {
  return <WordSearchGame />;
}
