import type { Metadata } from "next";
import WorksheetHub from "@/components/WorksheetHub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activity Sheets Hub",
};

export default function WorksheetsPage() {
  return <WorksheetHub />;
}
