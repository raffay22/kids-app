"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, ExternalLink, Receipt } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import type { PaymentRequest } from "@/types/database";

type PaymentWithUrl = PaymentRequest & { receipt_url?: string | null };

export default function PaymentVerification() {
  const [payments, setPayments] = useState<PaymentWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/payments");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load payments");
      setLoading(false);
      return;
    }
    setPayments(data.payments ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const approve = async (id: string) => {
    setApprovingId(id);
    const res = await fetch(`/api/admin/payments/${id}/approve`, { method: "POST" });
    setApprovingId(null);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Approval failed");
      return;
    }

    await loadPayments();
  };

  if (loading) return <p className="text-sm text-slate-600">Loading payment requests…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const pending = payments.filter((p) => p.status === "pending");
  const processed = payments.filter((p) => p.status !== "pending");

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 font-bold text-slate-800">Pending Verification</h3>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-600">No pending payment requests.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onApprove={() => approve(payment.id)}
                approving={approvingId === payment.id}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-bold text-slate-800">Processed</h3>
        {processed.length === 0 ? (
          <p className="text-sm text-slate-600">No processed payments yet.</p>
        ) : (
          <div className="space-y-3">
            {processed.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PaymentCard({
  payment,
  onApprove,
  approving,
}: {
  payment: PaymentWithUrl;
  onApprove?: () => void;
  approving?: boolean;
}) {
  const profile = payment.profiles;

  return (
    <div className="glass-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">
            {profile?.child_nickname ?? "Unknown child"} · {payment.plan_type}
          </p>
          <p className="text-xs text-slate-600">{profile?.parent_email}</p>
          <p className="mt-1 text-xs text-slate-500">
            {payment.payment_method} · {payment.amount ?? "—"} {payment.currency} ·{" "}
            <span
              className={
                payment.status === "approved"
                  ? "text-emerald-600"
                  : payment.status === "pending"
                    ? "text-amber-600"
                    : "text-rose-600"
              }
            >
              {payment.status}
            </span>
          </p>
          {payment.approved_at && (
            <p className="text-xs text-slate-500">
              Approved {new Date(payment.approved_at).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {payment.receipt_url && (
            <a
              href={payment.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
            >
              <Receipt className="h-4 w-4" aria-hidden />
              View Receipt
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}

          {payment.status === "pending" && onApprove && (
            <MotionPressable
              onClick={onApprove}
              ariaLabel="Approve payment"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" aria-hidden />
              {approving ? "Approving…" : "Approve Pro Pass"}
            </MotionPressable>
          )}
        </div>
      </div>
    </div>
  );
}
