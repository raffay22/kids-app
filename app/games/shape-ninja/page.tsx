import type { Metadata } from "next";
import ShapeNinjaGame from "@/components/games/shape-ninja/ShapeNinjaGame";
import ProGameGuard from "@/components/ProGameGuard";

export const metadata: Metadata = {
  title: "Shape Ninja ⚔️",
  description:
    "Slash crystal shapes in Shape Ninja — Level 1 primary shapes for ages 2–4.",
};

export default function ShapeNinjaPage() {
  return (
    <ProGameGuard gameTitle="Shape Ninja">
      <div className="min-h-[70vh] rounded-[2rem] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 p-3 sm:p-5">
        <ShapeNinjaGame initialLevelId={1} />
      </div>
    </ProGameGuard>
  );
}
