import type { Metadata } from "next";
import MathLabGame from "@/components/MathLabGame";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/math");

export const metadata: Metadata = {
  title: route.label,
};

export default function MathLabPage() {
  return <MathLabGame />;
}
