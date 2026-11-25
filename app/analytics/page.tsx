import type { Metadata } from "next";
import ParentAnalytics from "@/components/ParentAnalytics";

export const metadata: Metadata = {
  title: "Progress Tracking",
};

export default function AnalyticsPage() {
  return <ParentAnalytics />;
}
