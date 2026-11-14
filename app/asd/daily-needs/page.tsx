import type { Metadata } from "next";
import DailyNeedsPecsGrid from "@/components/asd/DailyNeedsPecsGrid";

export const metadata: Metadata = {
  title: "Daily Needs & Food PECS",
};

export default function DailyNeedsPage() {
  return <DailyNeedsPecsGrid />;
}
