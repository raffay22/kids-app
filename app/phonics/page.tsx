import type { Metadata } from "next";
import PhonicsHub from "@/components/PhonicsHub";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/phonics");

export const metadata: Metadata = {
  title: route.label,
};

export default function PhonicsPage() {
  return <PhonicsHub />;
}
