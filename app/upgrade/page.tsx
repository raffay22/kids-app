import type { Metadata } from "next";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/upgrade");

export const metadata: Metadata = {
  title: route.label,
};

export default function UpgradePage() {
  return (
    <section className="glass-card p-6 text-slate-800">
      <h2 className="text-2xl font-bold">{route.label}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Pro Pass checkout and school coupons arrive in Task 12.
      </p>
    </section>
  );
}
