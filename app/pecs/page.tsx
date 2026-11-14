import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/pecs");

export const metadata: Metadata = {
  title: route.label,
};

/** Safety PECS lives at /asd/emergency — keep /pecs as a free alias. */
export default function PecsPage() {
  redirect("/asd/emergency");
}
