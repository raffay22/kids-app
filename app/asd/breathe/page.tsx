import type { Metadata } from "next";
import BreathingMascot from "@/components/asd/BreathingMascot";

export const metadata: Metadata = {
  title: "Calm Breathing",
};

export default function BreathePage() {
  return <BreathingMascot />;
}
