"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, X, XCircle } from "lucide-react";

type SubmissionRow = {
  id: string;
  user_id: string;
  parent_name: string | null;
  parent_phone: string | null;
  amount: string;
  receipt_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
  profiles?: {
    parent_email?: string | null;
    child_nickname?: string | null;
  } | null;
};

export default function ManualPaymentDashboard() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingTable, setMissingTable] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payment-submissions", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load payment submissions");
        return;
      }
      setMissingTable(Boolean(data.missingTable));
      setRows((data.submissions ?? []) as SubmissionRow[]);
    } catch {
      setError("Network error while loading submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payment-submissions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Action failed");
        return;
      }
      await load();
    } catch {
      setError("Network error while processing payment.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-slate-800">
          Manual Payment Verification &amp; Approval
        </h3>
        <p className="text-sm text-slate-600">
          Inspect uploaded bank / JazzCash / EasyPaisa receipts and activate Pro accounts in one click.
        </p>
      </div>

      {missingTable && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold">
                ⚠️ Supabase Table Missing: <code className="rounded bg-amber-200/60 px-1 py-0.5 font-mono text-xs">payment_submissions</code>
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

      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading payment submissions…</p> : null}

      {!loading && rows.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600">
          No manual payment proof submissions yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User / Parent Name</th>
                <th className="px-4 py-3">Submission Date</th>
                <th className="px-4 py-3">Receipt Image</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const displayName =
                  row.parent_name ||
                  row.profiles?.child_nickname ||
                  row.profiles?.parent_email ||
                  "Parent";
                return (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{displayName}</p>
                      <p className="text-xs text-slate-500">
                        {row.profiles?.parent_email ?? "—"}
                        {row.parent_phone ? ` · 📞 ${row.parent_phone}` : ""}
                      </p>
                      <p className="text-xs font-semibold text-emerald-700">{row.amount}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(row.receipt_url)}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm transition hover:ring-2 hover:ring-indigo-400"
                        title="Click to preview full receipt"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.receipt_url}
                          alt="Payment receipt thumbnail"
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${
                          row.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : row.status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.status === "pending" ? (
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => void handleAction(row.id, "approve")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            {busyId === row.id ? "Activating…" : "Approve & Activate Pro"}
                          </button>
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => void handleAction(row.id, "reject")}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" aria-hidden />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          {row.approved_at
                            ? `Updated ${new Date(row.approved_at).toLocaleDateString()}`
                            : "Completed"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipt Lightbox Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-3xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                Open original image
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                aria-label="Close preview"
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Full receipt preview"
              className="mx-auto max-h-[75vh] rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
