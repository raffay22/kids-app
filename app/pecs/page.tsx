import type { Metadata } from "next";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/pecs");

export const metadata: Metadata = {
  title: route.label,
};

export default function PecsPage() {
  return (
    <section className="glass-card p-6 text-slate-800">
      <h2 className="text-2xl font-bold">{route.label}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Visual tap-to-speak PECS board arrives in Task 9.
      </p>
    </section>
  );
}
