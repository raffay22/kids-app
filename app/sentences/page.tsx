import type { Metadata } from "next";
import DuolingoSentenceBuilder from "@/components/DuolingoSentenceBuilder";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/sentences");

export const metadata: Metadata = {
  title: route.label,
};

export default function SentencesPage() {
  return (
    <div className="space-y-4">
      <section className="kid-card border-sky-200 bg-gradient-to-r from-sky-50 via-white to-amber-50 p-5 sm:p-7">
        <p className="text-base font-semibold text-sky-500">
          Daily Sentences · leveled
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
          Read, then write
        </h2>
        <p className="mt-1.5 text-base text-slate-600">
          Read the sentence with a matching 3D picture, tap Next, then build it
          from memory with the word bank.
        </p>
      </section>
      <DuolingoSentenceBuilder />
    </div>
  );
}
