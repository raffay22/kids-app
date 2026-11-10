"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import CouponManager from "@/components/admin/CouponManager";
import PaymentVerification from "@/components/admin/PaymentVerification";
import UserAnalytics from "@/components/admin/UserAnalytics";
import { useAuth } from "@/components/AuthProvider";

type AdminTab = "coupons" | "analytics" | "payments";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "coupons", label: "Coupon Studio" },
  { id: "analytics", label: "User Analytics" },
  { id: "payments", label: "Payment Verification" },
];

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("coupons");

  if (loading) {
    return (
      <section className="glass-card p-6">
        <p className="text-sm text-slate-600">Loading admin dashboard…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="glass-card p-6">
        <h2 className="text-xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Sign in with an admin account to continue.</p>
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
        <p className="mt-2 text-sm text-slate-600">
          This area is restricted to administrators via Supabase RLS policy.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
            <p className="text-sm text-slate-600">Coupon Studio · Analytics · Payment Approvals</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                : "glass-card text-slate-700 hover:bg-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "coupons" && <CouponManager />}
      {tab === "analytics" && <UserAnalytics />}
      {tab === "payments" && <PaymentVerification />}
    </div>
  );
}
