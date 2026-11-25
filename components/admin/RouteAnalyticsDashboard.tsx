"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, Download, Eye, TrendingUp, Trophy } from "lucide-react";

type RouteMetric = {
  routePath: string;
  featureName: string;
  totalViews: number;
  dailyAvg: number;
  trafficSharePct: number;
};

type DailyBucket = {
  date: string;
  dayOfWeek: string;
  totalViews: number;
  byRoute: Record<string, number>;
};

type DailyCsvRow = {
  date: string;
  dayOfWeek: string;
  routePath: string;
  featureName: string;
  views: number;
};

type AnalyticsResponse = {
  missingTable?: boolean;
  startDate: string;
  endDate: string;
  summary: {
    totalViews: number;
    topRoute: string;
    topRouteName: string;
    topRouteViews: number;
    avgDailyViews: number;
    totalDays: number;
  };
  routes: RouteMetric[];
  daily: DailyBucket[];
  dailyRows: DailyCsvRow[];
};

type PresetKey = "today" | "yesterday" | "7d" | "14d" | "30d" | "90d" | "custom";

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getPresetRange(preset: Exclude<PresetKey, "custom">): { start: string; end: string } {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);

  if (preset === "today") {
    return { start: formatDateInput(start), end: formatDateInput(end) };
  }
  if (preset === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
    return { start: formatDateInput(start), end: formatDateInput(end) };
  }
  const daysBack =
    preset === "7d" ? 6 : preset === "14d" ? 13 : preset === "30d" ? 29 : 89;
  start.setDate(start.getDate() - daysBack);
  return { start: formatDateInput(start), end: formatDateInput(end) };
}

function csvCell(val: string | number): string {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export default function RouteAnalyticsDashboard() {
  const defaultRange = useMemo(() => getPresetRange("30d"), []);
  const [preset, setPreset] = useState<PresetKey>("30d");
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [viewMode, setViewMode] = useState<"summary" | "daily">("summary");
  const [selectedRoute, setSelectedRoute] = useState<string>("ALL");

  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/route-analytics?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`,
        { cache: "no-store" },
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to load route analytics");
        return;
      }
      setData(json as AnalyticsResponse);
    } catch {
      setError("Network error while loading route analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics(startDate, endDate);
  }, [startDate, endDate, loadAnalytics]);

  const applyPreset = (key: Exclude<PresetKey, "custom">) => {
    const range = getPresetRange(key);
    setPreset(key);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const dailyDisplay = useMemo(() => {
    if (!data) return [];
    return data.daily.map((d) => ({
      date: d.date,
      dayOfWeek: d.dayOfWeek,
      views:
        selectedRoute === "ALL"
          ? d.totalViews
          : (d.byRoute[selectedRoute] ?? 0),
    }));
  }, [data, selectedRoute]);

  const maxDailyViews = useMemo(
    () => Math.max(1, ...dailyDisplay.map((d) => d.views)),
    [dailyDisplay],
  );

  const exportSponsorCsv = () => {
    if (!data) return;
    const lines: string[] = [];

    // Section 1: Summary Header
    lines.push("GROWVA JUNIOR — SPONSOR TRAFFIC PROOF REPORT");
    lines.push(`Date Range,${csvCell(`${startDate} to ${endDate}`)}`);
    lines.push(`Total Platform Views,${data.summary.totalViews}`);
    lines.push(`Average Daily Views,${data.summary.avgDailyViews}`);
    lines.push(`Top Performing Route,${csvCell(`${data.summary.topRouteName} (${data.summary.topRoute})`)}`);
    lines.push("");

    // Section 2: Route Performance Summary
    lines.push("ROUTE PERFORMANCE SUMMARY");
    lines.push("Route,Feature Name,Total Views,Daily Average Views,Traffic Share (%)");
    for (const r of data.routes) {
      lines.push(
        [
          csvCell(r.routePath),
          csvCell(r.featureName),
          r.totalViews,
          r.dailyAvg,
          `${r.trafficSharePct}%`,
        ].join(","),
      );
    }
    lines.push("");

    // Section 3: Day-by-Day Granular Breakdown
    lines.push("DAY-BY-DAY GRANULAR BREAKDOWN");
    lines.push("Date,Day,Route,Daily Views");
    const rowsToExport =
      selectedRoute === "ALL"
        ? data.dailyRows
        : dailyDisplay.map((d) => ({
            date: d.date,
            dayOfWeek: d.dayOfWeek,
            routePath: selectedRoute,
            views: d.views,
          }));

    for (const row of rowsToExport) {
      lines.push(
        [
          csvCell(row.date),
          csvCell(row.dayOfWeek),
          csvCell(row.routePath),
          row.views,
        ].join(","),
      );
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sponsor-traffic-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presets: { key: Exclude<PresetKey, "custom">; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "7d", label: "Last 7 Days" },
    { key: "14d", label: "Last 14 Days" },
    { key: "30d", label: "Last 30 Days" },
    { key: "90d", label: "Last 90 Days" },
  ];

  return (
    <div className="space-y-6">
      {/* Header + CSV Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
            Sponsor &amp; Partner Route Analytics
          </h2>
          <p className="text-sm text-slate-600">
            Strictly anonymous page-by-page &amp; day-by-day traffic proof (zero PII / zero user IDs).
          </p>
        </div>

        <button
          type="button"
          onClick={exportSponsorCsv}
          disabled={!data || loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden />
          📥 Export Sponsor Report (.csv)
        </button>
      </div>

      {/* Missing Table Notice */}
      {data?.missingTable && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold">
                ⚠️ Supabase Table Missing: <code className="rounded bg-amber-200/60 px-1 py-0.5 font-mono text-xs">route_views</code>
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Run <code className="rounded bg-amber-200/60 px-1 py-0.5 font-mono">supabase/migrations/024_route_views_analytics.sql</code> in your Supabase SQL Editor to start recording day-by-day route traffic.
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

      {/* A. Date Range Controls */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                preset === p.key
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
            Start Date
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => {
                setPreset("custom");
                setStartDate(e.target.value);
              }}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
            End Date
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                setPreset("custom");
                setEndDate(e.target.value);
              }}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            />
          </label>
        </div>
      </section>

      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

      {/* Summary Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-indigo-600">
            <Eye className="h-4 w-4" aria-hidden />
            Total Platform Views
          </p>
          <p className="mt-2 text-3xl font-black tabular-nums text-slate-900">
            {loading ? "…" : (data?.summary.totalViews ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across {data?.summary.totalDays ?? 0} day(s)
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-amber-600">
            <Trophy className="h-4 w-4" aria-hidden />
            Top Performing Route
          </p>
          <p className="mt-2 truncate text-xl font-black text-slate-900">
            {loading ? "…" : (data?.summary.topRouteName ?? "—")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {data?.summary.topRoute !== "—"
              ? `${data?.summary.topRoute} · ${(data?.summary.topRouteViews ?? 0).toLocaleString()} views`
              : "No views recorded in range"}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-600">
            <TrendingUp className="h-4 w-4" aria-hidden />
            Average Daily Views
          </p>
          <p className="mt-2 text-3xl font-black tabular-nums text-slate-900">
            {loading ? "…" : (data?.summary.avgDailyViews ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">Views per calendar day</p>
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              viewMode === "summary"
                ? "bg-white text-indigo-700 shadow"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" aria-hidden />
            View 1: Route Performance Summary
          </button>
          <button
            type="button"
            onClick={() => setViewMode("daily")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              viewMode === "daily"
                ? "bg-white text-indigo-700 shadow"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            View 2: Day-by-Day Daily Breakdown
          </button>
        </div>

        {viewMode === "daily" && (
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
            Filter Route:
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Routes (Platform-Wide)</option>
              {(data?.routes ?? []).map((r) => (
                <option key={r.routePath} value={r.routePath}>
                  {r.featureName} ({r.routePath})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* View 1: Route Performance Summary */}
      {viewMode === "summary" ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Route / Feature Name</th>
                <th className="px-4 py-3 text-right">Total Impressions / Views</th>
                <th className="px-4 py-3 text-right">Daily Average Views</th>
                <th className="px-4 py-3">Traffic Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Loading route performance…
                  </td>
                </tr>
              ) : (data?.routes.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No route views recorded for this date range yet.
                  </td>
                </tr>
              ) : (
                data?.routes.map((row) => (
                  <tr key={row.routePath} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{row.featureName}</p>
                      <p className="font-mono text-xs text-slate-500">{row.routePath}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold tabular-nums text-slate-900">
                      {row.totalViews.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-700">
                      {row.dailyAvg}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(100, row.trafficSharePct)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-slate-700">
                          {row.trafficSharePct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* View 2: Day-by-Day Daily Breakdown */
        <div className="space-y-4">
          {/* Daily Trend Sparkline / Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Daily Traffic Trend ({selectedRoute === "ALL" ? "Platform-Wide" : selectedRoute})
            </p>
            <div className="flex h-36 items-end gap-1 overflow-x-auto pb-1">
              {dailyDisplay.map((d) => {
                const pct = Math.max(4, Math.round((d.views / maxDailyViews) * 100));
                return (
                  <div
                    key={d.date}
                    className="group flex min-w-[14px] flex-1 flex-col items-center justify-end gap-1"
                    title={`${d.date} (${d.dayOfWeek}): ${d.views} views`}
                  >
                    <div
                      className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-indigo-600 to-sky-400 transition group-hover:from-amber-500 group-hover:to-yellow-400"
                      style={{ height: `${d.views === 0 ? 4 : pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date (YYYY-MM-DD)</th>
                  <th className="px-4 py-3">Day of Week</th>
                  <th className="px-4 py-3 text-right">Route Views</th>
                  <th className="px-4 py-3">Daily Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyDisplay.map((d) => {
                  const pct = Math.round((d.views / maxDailyViews) * 100);
                  return (
                    <tr key={d.date} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-slate-800">
                        {d.date}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-slate-600">
                        {d.dayOfWeek}
                      </td>
                      <td className="px-4 py-2.5 text-right font-extrabold tabular-nums text-slate-900">
                        {d.views.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
