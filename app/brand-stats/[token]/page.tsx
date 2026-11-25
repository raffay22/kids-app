"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ctrPercent } from "@/utils/brandAds";

type Proof = {
  brand_name: string;
  total_impressions: number;
  total_clicks: number;
  is_active: boolean;
  placement: string;
  monthly_rent_pkr: number | null;
};

export default function BrandStatsProofPage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const [proof, setProof] = useState<Proof | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data, error: rpcError } = await supabase.rpc("get_brand_ad_proof", {
          p_token: token,
        });
        if (rpcError) {
          setError(rpcError.message);
          return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) {
          setError("No brand campaign found for this link.");
          return;
        }
        setProof(row as Proof);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load stats");
      }
    })();
  }, [token]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
          Live brand proof
        </p>
        {error ? (
          <p className="mt-4 text-sm text-rose-600">{error}</p>
        ) : !proof ? (
          <p className="mt-4 text-sm text-slate-600">Loading campaign stats…</p>
        ) : (
          <>
            <h1 className="mt-2 text-2xl font-black text-slate-900">{proof.brand_name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Placement: {proof.placement} · {proof.is_active ? "Live" : "Paused"}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-bold uppercase text-slate-500">Impressions</dt>
                <dd className="mt-1 text-2xl font-black tabular-nums text-slate-900">
                  {proof.total_impressions.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-bold uppercase text-slate-500">Clicks</dt>
                <dd className="mt-1 text-2xl font-black tabular-nums text-slate-900">
                  {proof.total_clicks.toLocaleString()}
                </dd>
              </div>
              <div className="col-span-2 rounded-2xl bg-amber-50 p-4">
                <dt className="text-xs font-bold uppercase text-amber-700">CTR</dt>
                <dd className="mt-1 text-2xl font-black tabular-nums text-amber-900">
                  {ctrPercent(proof.total_impressions, proof.total_clicks)}%
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-center text-[11px] text-slate-400">
              Kids Learning Hub · Growva · Read-only partner report
            </p>
          </>
        )}
      </div>
    </main>
  );
}
