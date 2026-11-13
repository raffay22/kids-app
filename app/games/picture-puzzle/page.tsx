import type { Metadata } from "next";
import PicturePuzzleGame from "@/components/PicturePuzzleGame";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/picture-puzzle");

export const metadata: Metadata = {
  title: route.label,
};

export default function PicturePuzzlePage() {
  return <PicturePuzzleGame />;
}
