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
        <p className="text-base font-semibold text-sky-500">🦉 Ages 3–6 · Daily Routines</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">Build the Sentence</h2>
        <p className="mt-1.5 text-base text-slate-600">
          Learn a new word, then drag-and-tap pills to assemble the perfect sentence!
        </p>
      </section>
      <DuolingoSentenceBuilder />
    </div>
  );
}
