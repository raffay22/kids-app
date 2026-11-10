import type { Metadata } from "next";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/calm");

export const metadata: Metadata = {
  title: route.label,
};

export default function CalmPage() {
  return (
    <section className="glass-card p-6 text-slate-800">
      <h2 className="text-2xl font-bold">{route.label}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Paced breathing and touch tracing land in Task 9.
      </p>
    </section>
  );
}
