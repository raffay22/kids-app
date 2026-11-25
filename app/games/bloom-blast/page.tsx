import type { Metadata } from "next";
import BloomBlastGame from "@/components/games/bloom-blast/BloomBlastGame";
import ProGameGuard from "@/components/ProGameGuard";

export const metadata: Metadata = {
  title: "Bloom Blast",
  description:
    "Pick your age group and link matching shapes — Tiny Explorers ages 2–4, Level 1–5.",
};

export default function BloomBlastPage() {
  return (
    <ProGameGuard gameTitle="Bloom Blast">
      <div className="min-h-[70vh] rounded-[2rem] bg-gradient-to-b from-lime-100 via-emerald-50 to-sky-100 p-3 sm:p-5">
        <BloomBlastGame />
      </div>
    </ProGameGuard>
  );
}
