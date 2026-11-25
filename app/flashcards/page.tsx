import type { Metadata } from "next";
import FlashcardHub from "@/components/FlashcardHub";

export const metadata: Metadata = {
  title: "Nouns & Verbs Flashcards",
};

export default function FlashcardsPage() {
  return <FlashcardHub />;
}
