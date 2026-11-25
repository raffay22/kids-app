"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, CheckCircle2, Save } from "lucide-react";

type SettingsState = {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  jazzcashNumber: string;
  easypaisaNumber: string;
  proPriceDisplay: string;
};

const INITIAL: SettingsState = {
  bankName: "Meezan Bank",
  accountTitle: "Growva Business",
  accountNumber: "",
  jazzcashNumber: "",
  easypaisaNumber: "",
  proPriceDisplay: "Rs. 1,500 / Month",
};

export default function PaymentSettingsForm() {
  const [form, setForm] = useState<SettingsState>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [missingTable, setMissingTable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-settings", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.settings) {
        setForm(data.settings as SettingsState);
        setMissingTable(Boolean(data.missingTable));
      } else if (!res.ok) {
        setError(data.error ?? "Failed to load payment settings");
      }
    } catch {
      setError("Network error while loading payment settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save payment settings");
        return;
      }
      setSavedMsg("Payment settings saved globally! Parents now see the updated bank & wallet details.");
    } catch {
      setError("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Building2 className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Admin Payment Settings</h3>
          <p className="text-sm text-slate-600">
            Configure bank account, JazzCash, EasyPaisa, and Pro pricing shown on the parent checkout page.
          </p>
        </div>
      </div>

      {missingTable && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold">
                ⚠️ Supabase Table Missing: <code className="rounded bg-amber-200/60 px-1 py-0.5 font-mono text-xs">payment_settings</code>
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Run <code className="rounded bg-amber-200/60 px-1 py-0.5 font-mono">supabase/migrations/023_manual_payments_bank_config.sql</code> in Supabase SQL Editor.
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard/project/rgacgfnsxkiolebdnqfj/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Open SQL Editor ↗
            </a>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading payment settings…</p>
      ) : (
        <form onSubmit={handleSave} className="grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase text-slate-600">
            Bank Name
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
              placeholder="e.g. Meezan Bank, HBL"
              value={form.bankName}
              onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
              required
            />
          </label>

          <label className="block text-xs font-bold uppercase text-slate-600">
            Account Title
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
              placeholder="e.g. Growva Business / Founder Name"
              value={form.accountTitle}
              onChange={(e) => setForm((f) => ({ ...f, accountTitle: e.target.value }))}
              required
            />
          </label>

          <label className="block text-xs font-bold uppercase text-slate-600 sm:col-span-2">
            Account Number / IBAN
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm font-medium text-slate-800"
              placeholder="e.g. PK12 MEZN 0002 1234 5678 9012"
              value={form.accountNumber}
              onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
              required
            />
          </label>

          <label className="block text-xs font-bold uppercase text-slate-600">
            JazzCash Number (Optional)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
              placeholder="e.g. 0300-1234567"
              value={form.jazzcashNumber}
              onChange={(e) => setForm((f) => ({ ...f, jazzcashNumber: e.target.value }))}
            />
          </label>

          <label className="block text-xs font-bold uppercase text-slate-600">
            EasyPaisa Number (Optional)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
              placeholder="e.g. 0345-1234567"
              value={form.easypaisaNumber}
              onChange={(e) => setForm((f) => ({ ...f, easypaisaNumber: e.target.value }))}
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow transition hover:bg-emerald-700 disabled:opacity-60 sm:col-span-2"
          >
            <Save className="h-4 w-4" aria-hidden />
            {saving ? "Saving Settings…" : "Save Settings"}
          </button>
        </form>
      )}

      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
      {savedMsg ? (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {savedMsg}
        </p>
      ) : null}
    </div>
  );
}
