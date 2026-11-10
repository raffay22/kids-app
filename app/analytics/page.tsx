import type { Metadata } from "next";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/analytics");

export const metadata: Metadata = {
  title: route.label,
};

export default function AnalyticsPage() {
  return (
    <section className="glass-card p-6 text-slate-800">
      <h2 className="text-2xl font-bold">{route.label}</h2>
      <p className="mt-2 text-sm text-slate-600">
        30-day progress trends and dual-email export arrive in Task 11.
      </p>
    </section>
  );
}
