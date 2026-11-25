import type { Metadata } from "next";
import MemoryGame from "@/components/MemoryGame";
import ProGameGuard from "@/components/ProGameGuard";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/memory");

export const metadata: Metadata = {
  title: route.label,
};

export default function MemoryGamePage() {
  return (
    <ProGameGuard gameTitle="3D Tactile Memory">
      <MemoryGame />
    </ProGameGuard>
  );
}
