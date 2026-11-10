"use client";

import { useState } from "react";
import { LayoutGrid, Star } from "lucide-react";
import CategoryTabs from "@/components/CategoryTabs";
import QuizEngine from "@/components/QuizEngine";
import type { FlashcardCategory } from "@/utils/flashcards";

export default function FlashcardHub() {
  const [category, setCategory] = useState<FlashcardCategory>("nouns");

  return (
    <div className="space-y-6">
      <section className="kid-card border-amber-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-5 sm:p-7">
        <p className="flex items-center gap-1.5 text-base font-semibold text-indigo-500">
          <LayoutGrid className="h-4 w-4" aria-hidden />
          Flashcard Hub
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
          Tap to learn — speak when ready!
        </h2>
        <p className="mt-1.5 text-base text-slate-600">
          Two-tap confirm for every answer. Earn{" "}
          <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-amber-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden />
            10 stars
          </span>{" "}
          per correct card.
        </p>
        <div className="mt-4">
          <CategoryTabs active={category} onChange={setCategory} />
        </div>
      </section>

      <QuizEngine category={category} />
    </div>
  );
}
