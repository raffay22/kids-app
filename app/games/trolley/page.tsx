import type { Metadata } from "next";
import TrolleyGame from "@/components/TrolleyGame";
import ProGameGuard from "@/components/ProGameGuard";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/trolley");

export const metadata: Metadata = {
  title: route.label,
};

export default function TrolleyGamePage() {
  return (
    <ProGameGuard gameTitle="Supermarket Trolley">
      <TrolleyGame />
    </ProGameGuard>
  );
}
