import type { Metadata } from "next";
import IWantSentenceBuilder from "@/components/asd/IWantSentenceBuilder";

export const metadata: Metadata = {
  title: "I Want Sentence Builder",
};

export default function IWantPage() {
  return <IWantSentenceBuilder />;
}
