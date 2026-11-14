import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import { GROWVA_BRAND } from "@/utils/siteLinks";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-xl backdrop-blur-xl"
      >
        <Home className="h-4 w-4" aria-hidden />
        Home
      </Link>

      <section className="rounded-3xl border-4 border-white bg-white/95 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-wide text-violet-600">
          About
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-800">
          Kids Learning App
        </h1>
        <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
          A calm, speech-friendly learning space for young children — including
          kids with speech delays and ASD. Phonics, stories, games, PECS
          communication, and sensory tools are designed for short, joyful
          practice with parents and therapists.
        </p>
        <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
          Powered by <strong className="text-slate-800">{GROWVA_BRAND}</strong>,
          we focus on reduced-motion options, clear visuals, and parent-first
          privacy controls so every child can learn at a gentle pace.
        </p>
      </section>
    </div>
  );
}
