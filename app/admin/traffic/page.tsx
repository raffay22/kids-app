"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import RouteAnalyticsDashboard from "@/components/admin/RouteAnalyticsDashboard";

export default function AdminTrafficPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <section className="glass-card p-6">
        <p className="text-sm text-slate-600">Loading route analytics…</p>
      </section>
    );
  }

  if (!user || !profile?.is_admin) {
    return (
      <section className="glass-card p-6">
        <div className="flex items-center gap-3 text-rose-600">
          <ShieldCheck className="h-6 w-6" aria-hidden />
          <h2 className="text-xl font-bold">Admin Access Required</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with an admin account to view sponsor traffic analytics.
        </p>
        <Link href="/login" className="mt-4 inline-block text-indigo-600 hover:underline">
          Sign in →
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Admin Dashboard
      </Link>
      <section className="glass-card p-4 sm:p-6">
        <RouteAnalyticsDashboard />
      </section>
    </div>
  );
}
