"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import BrandAdManager from "@/components/admin/BrandAdManager";
import { useAuth } from "@/components/AuthProvider";

export default function AdminBrandAdsPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <section className="glass-card p-6">
        <p className="text-sm text-slate-600">Loading…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="glass-card p-6">
        <h2 className="text-xl font-bold text-slate-800">Brand Ads</h2>
        <p className="mt-2 text-sm text-slate-600">Sign in with an admin account.</p>
        <Link href="/login" className="mt-4 inline-block text-indigo-600 hover:underline">
          Sign in →
        </Link>
      </section>
    );
  }

  if (!profile?.is_admin) {
    return (
      <section className="glass-card p-6">
        <div className="flex items-center gap-3 text-rose-600">
          <ShieldCheck className="h-6 w-6" aria-hidden />
          <h2 className="text-xl font-bold">Access Denied</h2>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to admin
      </Link>
      <section className="glass-card p-4 sm:p-6">
        <BrandAdManager />
      </section>
    </div>
  );
}
