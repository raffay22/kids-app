import type { Metadata } from "next";
import EmergencyPecsGrid from "@/components/asd/EmergencyPecsGrid";

export const metadata: Metadata = {
  title: "Emergency PECS",
};

export default function EmergencyPecsPage() {
  return <EmergencyPecsGrid />;
}
