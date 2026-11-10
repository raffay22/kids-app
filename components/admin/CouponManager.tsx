"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import type { Coupon } from "@/types/database";

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    discount_percent: 50,
    plan_type: "both" as Coupon["plan_type"],
    expires_at: "",
    usage_limit: "",
    is_active: true,
  });

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load coupons");
      setLoading(false);
      return;
    }
    setCoupons(data.coupons ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create coupon");
      return;
    }

    setForm({
      code: "",
      discount_percent: 50,
      plan_type: "both",
      expires_at: "",
      usage_limit: "",
      is_active: true,
    });
    await loadCoupons();
  };

  const toggleActive = async (coupon: Coupon) => {
    const res = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active }),
    });

    if (res.ok) await loadCoupons();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="glass-card space-y-4 p-4">
        <h3 className="flex items-center gap-2 font-bold text-slate-800">
          <Plus className="h-5 w-5 text-indigo-500" aria-hidden />
          Create Promo Code
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Code e.g. SCHOOL50"
            required
            className="rounded-xl border-2 border-white/80 bg-white/70 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            max={100}
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
            placeholder="Discount %"
            required
            className="rounded-xl border-2 border-white/80 bg-white/70 px-3 py-2 text-sm"
          />
          <select
            value={form.plan_type}
            onChange={(e) =>
              setForm({ ...form, plan_type: e.target.value as Coupon["plan_type"] })
            }
            className="rounded-xl border-2 border-white/80 bg-white/70 px-3 py-2 text-sm"
          >
            <option value="both">Monthly & Yearly</option>
            <option value="monthly">Monthly Only</option>
            <option value="yearly">Yearly Only</option>
          </select>
          <input
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            className="rounded-xl border-2 border-white/80 bg-white/70 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            value={form.usage_limit}
            onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
            placeholder="Usage limit (optional)"
            className="rounded-xl border-2 border-white/80 bg-white/70 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Create Coupon
        </button>
      </form>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-600">Loading coupons…</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-slate-600">No coupons yet. Create SCHOOL50 to get started.</p>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="glass-card flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-bold text-slate-800">{coupon.code}</p>
                <p className="text-xs text-slate-600">
                  {coupon.discount_percent}% off · {coupon.plan_type} · Used{" "}
                  {coupon.usage_count}
                  {coupon.usage_limit ? `/${coupon.usage_limit}` : ""}
                </p>
                {coupon.expires_at && (
                  <p className="text-xs text-slate-500">
                    Expires {new Date(coupon.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <MotionPressable
                onClick={() => toggleActive(coupon)}
                ariaLabel={coupon.is_active ? "Deactivate coupon" : "Activate coupon"}
                className="flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                {coupon.is_active ? (
                  <ToggleRight className="h-6 w-6 text-emerald-500" aria-hidden />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-slate-400" aria-hidden />
                )}
                {coupon.is_active ? "Active" : "Inactive"}
              </MotionPressable>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
