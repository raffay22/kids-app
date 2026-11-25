import type { Metadata } from "next";
import FeelingsExpresser from "@/components/asd/FeelingsExpresser";

export const metadata: Metadata = {
  title: "How I Feel",
};

export default function FeelingsPage() {
  return <FeelingsExpresser />;
}
