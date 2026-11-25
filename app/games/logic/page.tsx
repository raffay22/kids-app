import type { Metadata } from "next";
import LogicGame from "@/components/LogicGame";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/logic");

export const metadata: Metadata = {
  title: route.label,
};

export default function LogicGamePage() {
  return <LogicGame />;
}
