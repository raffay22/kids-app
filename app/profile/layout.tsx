import type { Metadata } from "next";
import { Suspense } from "react";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/profile");

export const metadata: Metadata = {
  title: route.label,
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <section className="glass-card p-6">
          <p className="text-sm text-slate-600">Loading profile…</p>
        </section>
      }
    >
      {children}
    </Suspense>
  );
}
