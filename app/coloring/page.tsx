import type { Metadata } from "next";
import ColouringBoard from "@/components/ColouringBoard";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/coloring");

export const metadata: Metadata = {
  title: route?.label ?? "Colouring Board",
};

export default function ColoringPage() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <ColouringBoard />
    </section>
  );
}
