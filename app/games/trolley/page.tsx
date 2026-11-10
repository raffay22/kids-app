import type { Metadata } from "next";
import TrolleyGame from "@/components/TrolleyGame";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/trolley");

export const metadata: Metadata = {
  title: route.label,
};

export default function TrolleyGamePage() {
  return <TrolleyGame />;
}
