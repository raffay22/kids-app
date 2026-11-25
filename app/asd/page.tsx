import type { Metadata } from "next";
import AsdSensoryHub from "@/components/AsdSensoryHub";

export const metadata: Metadata = {
  title: "ASD PECS & Sensory Hub",
};

export default function AsdHubPage() {
  return <AsdSensoryHub />;
}
