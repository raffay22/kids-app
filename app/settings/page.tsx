import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/settings");

export const metadata: Metadata = {
  title: route.label,
};

export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-xl"
      >
        <Home className="h-4 w-4" aria-hidden />
        Back to Home
      </Link>

      <div className="rounded-3xl border-4 border-white/90 bg-white/80 p-6 text-slate-800 shadow-2xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold">{route.label}</h2>
        <p className="mt-2 text-sm text-slate-600">
          Parent area. Low-motion toggles and extra privacy controls arrive in a
          later task. Hold the lock icon on the home header for 3 seconds anytime
          you need to return here.
        </p>
        <ul className="mt-4 space-y-2 text-sm font-medium text-indigo-700">
          <li>
            <Link href="/profile" className="hover:underline">
              Profile &amp; trophies
            </Link>
          </li>
          <li>
            <Link href="/analytics" className="hover:underline">
              Practice log
            </Link>
          </li>
          <li>
            <Link href="/upgrade" className="hover:underline">
              Pro Pass
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
