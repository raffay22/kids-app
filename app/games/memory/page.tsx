import type { Metadata } from "next";
import MemoryGame from "@/components/MemoryGame";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/memory");

export const metadata: Metadata = {
  title: route.label,
};

export default function MemoryGamePage() {
  return <MemoryGame />;
}
