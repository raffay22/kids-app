"use client";

import { useEffect, useState } from "react";
import { BarChart3, Crown, Users } from "lucide-react";
import type { AnalyticsSummary } from "@/types/database";

export default function UserAnalytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to load analytics");
        return;
      }
      setData(json);
    };
    load();
  }, []);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-600">Loading analytics…</p>;

  const maxGrowth = Math.max(...data.signUpGrowth.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Users className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase">Total Users</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.totalUsers}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-slate-600">
            <BarChart3 className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase">Free Plan</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.freeUsers}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Crown className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase">Pro Plan</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.proUsers}</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="mb-3 font-bold text-slate-800">Child Age Distribution</h3>
        <div className="space-y-2">
          {data.ageDistribution.map((item) => (
            <div key={item.ageGroup} className="flex items-center gap-3">
              <span className="w-16 text-xs font-medium text-slate-600">
                {item.ageGroup === "unknown" ? "Unset" : item.ageGroup}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  style={{
                    width: `${data.totalUsers ? (item.count / data.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs font-bold text-slate-700">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="mb-3 font-bold text-slate-800">Sign-Up Growth (14 days)</h3>
        <div className="flex h-40 items-end gap-1">
          {data.signUpGrowth.length === 0 ? (
            <p className="text-sm text-slate-500">No sign-ups recorded yet.</p>
          ) : (
            data.signUpGrowth.map((point) => (
              <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400"
                  style={{ height: `${(point.count / maxGrowth) * 100}%`, minHeight: 4 }}
                  title={`${point.date}: ${point.count}`}
                />
                <span className="text-[9px] text-slate-500">{point.date.slice(5)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
