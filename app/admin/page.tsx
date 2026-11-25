"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import BrandAdManager from "@/components/admin/BrandAdManager";
import CouponManager from "@/components/admin/CouponManager";
import LiveAnalyticsDashboard from "@/components/admin/LiveAnalyticsDashboard";
import PartnerSchoolManager from "@/components/admin/PartnerSchoolManager";
import PaymentVerification from "@/components/admin/PaymentVerification";
import ShopProductManager from "@/components/admin/ShopProductManager";
import StoryCmsManager from "@/components/admin/StoryCmsManager";
import StreakBannerStudio from "@/components/admin/StreakBannerStudio";
import UserAnalytics from "@/components/admin/UserAnalytics";
import WorksheetPdfManager from "@/components/admin/WorksheetPdfManager";
import { useAuth } from "@/components/AuthProvider";

type AdminTab =
  | "traffic"
  | "schools"
  | "coupons"
  | "analytics"
  | "payments"
  | "ads"
  | "shop"
  | "worksheets"
  | "stories"
  | "streaks";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "traffic", label: "Live Traffic" },
  { id: "schools", label: "Partner Schools" },
  { id: "ads", label: "Brand Ads" },
  { id: "coupons", label: "Coupon Studio" },
  { id: "analytics", label: "User Analytics" },
  { id: "payments", label: "Payment Verification" },
  { id: "shop", label: "Shop Products" },
  { id: "worksheets", label: "Worksheet PDFs" },
  { id: "stories", label: "Stories CMS" },
  { id: "streaks", label: "Streak Banners" },
];

const PIN_SESSION_KEY = "admin_dashboard_pin_ok";

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("traffic");
  const [pinRequired, setPinRequired] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinChecking, setPinChecking] = useState(false);

  useEffect(() => {
    if (!loading && user && !profile?.is_admin) {
      router.replace("/");
    }
  }, [loading, user, profile?.is_admin, router]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/verify-pin");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const required = Boolean(data.pinRequired);
        setPinRequired(required);
        if (!required) {
          setPinUnlocked(true);
          return;
        }
        try {
          if (sessionStorage.getItem(PIN_SESSION_KEY) === "1") {
            setPinUnlocked(true);
          }
        } catch {
          // ignore
        }
      } catch {
        if (cancelled) return;
        setPinUnlocked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.is_admin]);

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChecking(true);
    setPinError(null);
    const res = await fetch("/api/admin/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinInput }),
    });
    const data = await res.json().catch(() => ({}));
    setPinChecking(false);
    if (!res.ok) {
      setPinError(data.error ?? "Invalid PIN");
      return;
    }
    try {
      sessionStorage.setItem(PIN_SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setPinUnlocked(true);
  };

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
        <p className="mt-2 text-sm text-slate-600">Redirecting home…</p>
      </section>
    );
  }

  if (pinRequired && !pinUnlocked) {
    return (
      <section className="mx-auto max-w-md glass-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Lock className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Admin PIN</h2>
            <p className="text-sm text-slate-600">Enter the dashboard passphrase to continue.</p>
          </div>
        </div>
        <form onSubmit={submitPin} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Secret PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            required
          />
          {pinError ? <p className="text-sm text-rose-600">{pinError}</p> : null}
          <button
            type="submit"
            disabled={pinChecking}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pinChecking ? "Checking…" : "Unlock dashboard"}
          </button>
        </form>
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
            <p className="text-sm text-slate-600">
              Traffic · Schools · Ads · Shop · Worksheets · Streaks · Coupons · Payments
            </p>
          </div>
        </div>
        <p className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
          <span>Quick links:</span>
          <Link href="/admin/traffic" className="font-semibold text-rose-700 hover:underline">
            /admin/traffic
          </Link>
          <span>·</span>
          <Link href="/admin/ads" className="font-semibold text-amber-700 hover:underline">
            /admin/ads
          </Link>
          <span>·</span>
          <Link href="/admin/payment-settings" className="font-semibold text-emerald-700 hover:underline">
            /admin/payment-settings
          </Link>
          <span>·</span>
          <Link href="/admin/payments" className="font-semibold text-indigo-700 hover:underline">
            /admin/payments
          </Link>
          <span>·</span>
          <Link href="/admin/worksheets" className="font-semibold text-sky-700 hover:underline">
            /admin/worksheets
          </Link>
          <span>·</span>
          <Link href="/admin/stories" className="font-semibold text-purple-700 hover:underline">
            /admin/stories
          </Link>
        </p>
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

      {tab === "traffic" && (
        <section className="glass-card p-4 sm:p-6">
          <LiveAnalyticsDashboard />
        </section>
      )}
      {tab === "schools" && (
        <section className="glass-card p-4 sm:p-6">
          <PartnerSchoolManager />
        </section>
      )}
      {tab === "ads" && (
        <section className="glass-card p-4 sm:p-6">
          <BrandAdManager />
        </section>
      )}
      {tab === "coupons" && <CouponManager />}
      {tab === "analytics" && <UserAnalytics />}
      {tab === "payments" && <PaymentVerification />}
      {tab === "shop" && (
        <section className="glass-card p-4 sm:p-6">
          <ShopProductManager />
        </section>
      )}
      {tab === "worksheets" && (
        <section className="glass-card p-4 sm:p-6">
          <WorksheetPdfManager />
        </section>
      )}
      {tab === "stories" && (
        <section className="glass-card p-4 sm:p-6">
          <StoryCmsManager />
        </section>
      )}
      {tab === "streaks" && (
        <section className="glass-card p-4 sm:p-6">
          <StreakBannerStudio />
        </section>
      )}
    </div>
  );
}
