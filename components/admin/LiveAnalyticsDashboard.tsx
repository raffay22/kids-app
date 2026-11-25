"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, FileDown, Radio } from "lucide-react";
import {
  brandProofUrl,
  ctrPercent,
  placementLabel,
  type BrandAd,
} from "@/utils/brandAds";
import { downloadBrandBillingPdf } from "@/utils/brandBillingPdf";
import { TRACKED_PAGES, type PageAnalyticsRow } from "@/utils/pageAnalytics";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const DEFAULT_TRACKED_PAGES: PageAnalyticsRow[] = TRACKED_PAGES.map((p) => ({
  page_route: p.route,
  page_title: p.title,
  total_views: 0,
  active_users_now: 0,
}));

const PRESENCE_CHANNEL = "online-users";

type PresenceMeta = { path?: string; online_at?: string };

export default function LiveAnalyticsDashboard() {
  const [liveCount, setLiveCount] = useState(0);
  const [liveByPath, setLiveByPath] = useState<Record<string, number>>({});
  const [ads, setAds] = useState<BrandAd[]>([]);
  const [pages, setPages] = useState<PageAnalyticsRow[]>(DEFAULT_TRACKED_PAGES);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    try {
      const [adsRes, routeRes] = await Promise.all([
        fetch("/api/admin/brand-ads", { cache: "no-store" }),
        fetch("/api/admin/route-analytics", { cache: "no-store" }),
      ]);

      let hasError = false;

      if (adsRes.ok) {
        const adsJson = (await adsRes.json()) as { ads?: BrandAd[] };
        setAds(Array.isArray(adsJson.ads) ? adsJson.ads : []);
      } else {
        hasError = true;
      }

      if (routeRes.ok) {
        const routeJson = (await routeRes.json()) as {
          missingTable?: boolean;
          routes?: { routePath: string; featureName: string; totalViews: number }[];
        };
        if (routeJson.missingTable) {
          hasError = true;
        } else {
          const merged = new Map<string, PageAnalyticsRow>();
          for (const p of DEFAULT_TRACKED_PAGES) {
            merged.set(p.page_route, { ...p });
          }
          for (const r of routeJson.routes ?? []) {
            const existing = merged.get(r.routePath);
            merged.set(r.routePath, {
              page_route: r.routePath,
              page_title: existing?.page_title ?? r.featureName ?? r.routePath,
              total_views: Number(r.totalViews ?? 0),
              active_users_now: existing?.active_users_now ?? 0,
            });
          }
          const sorted = Array.from(merged.values()).sort(
            (a, b) => b.total_views - a.total_views,
          );
          setPages(sorted);
        }
      } else {
        hasError = true;
      }

      setError(hasError ? "missing_tables" : null);
    } catch {
      setError("missing_tables");
    }
  }, []);

  useEffect(() => {
    void loadTables();
    const poll = window.setInterval(() => void loadTables(), 15_000);
    return () => window.clearInterval(poll);
  }, [loadTables]);

  useEffect(() => {
    let client: ReturnType<typeof createSupabaseClient> | null = null;
    let channel: ReturnType<ReturnType<typeof createSupabaseClient>["channel"]> | null = null;
    let tick: number | null = null;

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return;

      // Use a dedicated client instance to ensure presence listeners are attached
      // BEFORE subscribe() and avoid collisions with PresenceHeartbeat's channel.
      client = createSupabaseClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      channel = client.channel(PRESENCE_CHANNEL);

      const sync = () => {
        if (!channel) return;
        try {
          const state = channel.presenceState<PresenceMeta>();
          const keys = Object.keys(state);
          setLiveCount(keys.length);
          const byPath: Record<string, number> = {};
          for (const key of keys) {
            const metas = state[key] ?? [];
            for (const meta of metas) {
              const path = meta.path || "/";
              byPath[path] = (byPath[path] ?? 0) + 1;
            }
          }
          setLiveByPath(byPath);
        } catch {
          // ignore presence state read errors
        }
      };

      channel.on("presence", { event: "sync" }, sync);
      channel.on("presence", { event: "join" }, sync);
      channel.on("presence", { event: "leave" }, sync);

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          sync();
        }
      });

      tick = window.setInterval(sync, 5_000);
    } catch (err) {
      console.warn("Realtime presence listener setup skipped:", err);
    }

    return () => {
      if (tick) window.clearInterval(tick);
      if (client && channel) {
        try {
          void client.removeChannel(channel);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const pagesWithLive = useMemo(() => {
    return pages.map((p) => ({
      ...p,
      live: liveByPath[p.page_route] ?? 0,
    }));
  }, [pages, liveByPath]);

  const copyProof = async (ad: BrandAd) => {
    const url = brandProofUrl(ad.proof_token) || `/brand-stats/${ad.proof_token}`;
    await navigator.clipboard.writeText(url);
    setCopied(ad.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <h3 className="text-lg font-black text-slate-900">
            LIVE NOW:{" "}
            <span className="tabular-nums text-emerald-700">{liveCount}</span> Active
            Users Online Right Now
          </h3>
          <Radio className="h-4 w-4 text-emerald-600" aria-hidden />
        </div>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Supabase Realtime presence · refreshes continuously
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-extrabold text-amber-900">
                ⚡ Supabase Setup Needed for Brand Ads &amp; Page Analytics
              </p>
              <p className="mt-1 text-xs text-amber-800">
                The <code>brand_ads</code> and <code>page_analytics</code> tables have not been created in your Supabase database yet. Run <code>supabase/APPLY_ALL_ADMIN_MIGRATIONS.sql</code> in the SQL Editor to enable full analytics tracking.
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard/project/rgacgfnsxkiolebdnqfj/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-indigo-700"
            >
              Open Supabase SQL Editor ↗
            </a>
          </div>
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-slate-800">
            Brand Ad Impressions &amp; Clicks
          </h3>
          <button
            type="button"
            onClick={() => downloadBrandBillingPdf(ads)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-extrabold text-white shadow"
          >
            <FileDown className="h-3.5 w-3.5" aria-hidden />
            Export Monthly PDF Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Brand Name</th>
                <th className="px-3 py-2">Placement</th>
                <th className="px-3 py-2">Views (Imp)</th>
                <th className="px-3 py-2">Clicks</th>
                <th className="px-3 py-2">CTR %</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Shareable Brand Link</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No brand ads created yet —{" "}
                    <Link href="/admin/ads" className="font-bold text-indigo-600 hover:underline">
                      upload your first brand ad in Brand Ads
                    </Link>{" "}
                    to track live impressions, clicks &amp; CTR.
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-800">{ad.brand_name}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {placementLabel(ad.placement)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{ad.total_impressions.toLocaleString()}</td>
                    <td className="px-3 py-2 tabular-nums">{ad.total_clicks.toLocaleString()}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {ctrPercent(ad.total_impressions, ad.total_clicks)}%
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          ad.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {ad.is_active ? "Live" : "Off"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => void copyProof(ad)}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                      >
                        <Copy className="h-3 w-3" aria-hidden />
                        {copied === ad.id ? "Copied!" : "Copy Live Proof"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="mb-3 text-base font-extrabold text-slate-800">
          Page-by-Page Traffic
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Page</th>
                <th className="px-3 py-2">Route</th>
                <th className="px-3 py-2">Total Views</th>
                <th className="px-3 py-2">Live Now</th>
              </tr>
            </thead>
            <tbody>
              {pagesWithLive.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                    No page views yet — open the app to start tracking.
                  </td>
                </tr>
              ) : (
                pagesWithLive.map((p) => (
                  <tr key={p.page_route} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-800">{p.page_title}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{p.page_route}</td>
                    <td className="px-3 py-2 tabular-nums">{p.total_views.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {p.live}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
