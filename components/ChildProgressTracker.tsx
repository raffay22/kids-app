"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, Flame, Star, Trophy } from "lucide-react";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useStreak } from "@/hooks/useStreak";
import {
  DAILY_PROGRESS_UPDATED_EVENT,
  fetch30DayChildProgress,
  type DailyProgressRecord,
} from "@/utils/dailyProgress";
import { GUEST_CHILD_ID, isGuestChild } from "@/utils/guestProgress";
import { todayLocalISO } from "@/utils/streaks";

type ViewRange = "today" | "week" | "month";

export type ChildProgressTrackerProps = {
  childId?: string | null;
  childName?: string | null;
  demoMode?: boolean;
  fallbackRows?: { timestamp: string; is_correct: boolean }[];
};

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildPastNDays(n: number): { date: string; shortDay: string; dayNum: string }[] {
  const result: { date: string; shortDay: string; dayNum: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    result.push({
      date: formatLocalDate(d),
      shortDay: d.toLocaleDateString(undefined, { weekday: "short" }),
      dayNum: String(d.getDate()),
    });
  }
  return result;
}

export default function ChildProgressTracker({
  childId: propChildId,
  childName: propChildName,
  demoMode = false,
  fallbackRows = [],
}: ChildProgressTrackerProps) {
  const { activeChild } = useActiveChild();
  const { currentStreak } = useStreak();

  const resolvedChildId = propChildId ?? activeChild?.id ?? GUEST_CHILD_ID;
  const resolvedName = propChildName ?? activeChild?.nickname ?? "Little Learner";

  const [view, setView] = useState<ViewRange>("today");
  const [records, setRecords] = useState<DailyProgressRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const todayISO = useMemo(() => todayLocalISO(), []);
  const todayReadable = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  // Fetch strictly once per child (30-day cap) and reuse client cache across all tab switches
  useEffect(() => {
    if (demoMode) return;
    let cancelled = false;
    setLoading(true);
    void fetch30DayChildProgress(resolvedChildId).then((rows) => {
      if (!cancelled) {
        setRecords(rows);
        setLoading(false);
      }
    });

    const normalizedId = !resolvedChildId || isGuestChild(resolvedChildId) ? GUEST_CHILD_ID : resolvedChildId;
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ childId: string; rows: DailyProgressRecord[] }>).detail;
      if (detail && detail.childId === normalizedId) {
        setRecords(detail.rows);
      }
    };
    window.addEventListener(DAILY_PROGRESS_UPDATED_EVENT, onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(DAILY_PROGRESS_UPDATED_EVENT, onUpdated);
    };
  }, [resolvedChildId, demoMode]);

  // Merge any fallbackRows (e.g. demo mode or existing user_progress logs) strictly within 30 days
  const mergedByDate = useMemo(() => {
    const map = new Map<string, DailyProgressRecord>();
    for (const r of records) {
      map.set(r.date, r);
    }
    if (fallbackRows.length > 0) {
      const past30Dates = new Set(buildPastNDays(30).map((d) => d.date));
      const fallbackMap = new Map<string, { activities: number; stars: number }>();
      for (const row of fallbackRows) {
        const key = row.timestamp.slice(0, 10);
        if (!past30Dates.has(key)) continue;
        const cur = fallbackMap.get(key) ?? { activities: 0, stars: 0 };
        cur.activities += 1;
        if (row.is_correct) cur.stars += 5;
        fallbackMap.set(key, cur);
      }
      for (const [date, agg] of fallbackMap.entries()) {
        const existing = map.get(date);
        map.set(date, {
          date,
          stars_earned: Math.max(existing?.stars_earned ?? 0, agg.stars),
          activities_completed: Math.max(existing?.activities_completed ?? 0, agg.activities),
          trophies_earned: existing?.trophies_earned ?? (demoMode && date === todayISO ? 1 : 0),
        });
      }
    }
    return map;
  }, [records, fallbackRows, demoMode, todayISO]);

  const todayRecord = mergedByDate.get(todayISO) ?? {
    date: todayISO,
    stars_earned: 0,
    activities_completed: 0,
    trophies_earned: 0,
  };

  const weekDays = useMemo(() => {
    const days = buildPastNDays(7);
    return days.map((d) => {
      const rec = mergedByDate.get(d.date);
      return {
        ...d,
        isToday: d.date === todayISO,
        stars: rec?.stars_earned ?? 0,
        activities: rec?.activities_completed ?? 0,
        trophies: rec?.trophies_earned ?? 0,
      };
    });
  }, [mergedByDate, todayISO]);

  const weekTotals = useMemo(() => {
    let stars = 0;
    let activities = 0;
    let activeDays = 0;
    for (const d of weekDays) {
      stars += d.stars;
      activities += d.activities;
      if (d.activities > 0 || d.stars > 0) activeDays += 1;
    }
    const maxActivities = Math.max(1, ...weekDays.map((d) => d.activities));
    return { stars, activities, activeDays, maxActivities };
  }, [weekDays]);

  const monthDays = useMemo(() => {
    const days = buildPastNDays(30);
    return days.map((d) => {
      const rec = mergedByDate.get(d.date);
      return {
        ...d,
        stars: rec?.stars_earned ?? 0,
        activities: rec?.activities_completed ?? 0,
        trophies: rec?.trophies_earned ?? 0,
      };
    });
  }, [mergedByDate]);

  const monthTotals = useMemo(() => {
    let stars = 0;
    let activities = 0;
    let trophies = 0;
    let activeDays = 0;
    for (const d of monthDays) {
      stars += d.stars;
      activities += d.activities;
      trophies += d.trophies;
      if (d.activities > 0 || d.stars > 0) activeDays += 1;
    }
    return { stars, activities, trophies, activeDays };
  }, [monthDays]);

  const streakDisplay = demoMode ? 5 : currentStreak;

  return (
    <section
      aria-label="30-day rolling child progress tracker"
      className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-white p-5 shadow-md sm:p-6"
    >
      {/* Top Bar: Prominent Today Date + View Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            Today: {todayReadable}
          </p>
          <h2 className="mt-0.5 text-lg font-black text-slate-900 sm:text-xl">
            {resolvedName}&apos;s Rolling Progress
          </h2>
        </div>

        {/* Instant Client-Cached View Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Progress timeframe"
          className="inline-flex rounded-2xl bg-slate-100 p-1 shadow-inner"
        >
          {(
            [
              { id: "today", label: "Today" },
              { id: "week", label: "This Week (7 Days)" },
              { id: "month", label: "Past Month (30 Days)" },
            ] as const
          ).map((tab) => {
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition sm:px-3.5 ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-indigo-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && records.length === 0 ? (
        <p className="mt-4 text-center text-xs font-semibold text-slate-400">
          Syncing 30-day summary…
        </p>
      ) : null}

      {/* VIEW 1: TODAY (Default) */}
      {view === "today" && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-white shadow">
              <Star className="h-5 w-5 fill-white" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Today&apos;s Stars
              </p>
              <p className="text-2xl font-black text-slate-900">
                {todayRecord.stars_earned}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                Activities Done
              </p>
              <p className="text-2xl font-black text-slate-900">
                {todayRecord.activities_completed}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-orange-200/80 bg-orange-50/70 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow">
              <Flame className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-800">
                Current Streak
              </p>
              <p className="text-2xl font-black text-slate-900">
                {streakDisplay} {streakDisplay === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: THIS WEEK (7 DAYS) */}
      {view === "week" && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-7 gap-2 rounded-2xl border border-slate-100 bg-white p-4">
            {weekDays.map((day) => {
              const active = day.activities > 0 || day.stars > 0;
              const pct = active
                ? Math.max(22, Math.round((day.activities / weekTotals.maxActivities) * 100))
                : 8;
              return (
                <div key={day.date} className="flex flex-col items-center gap-1.5">
                  <div className="flex h-20 w-full max-w-[2.25rem] items-end justify-center rounded-xl bg-slate-100 p-1">
                    <div
                      style={{ height: `${pct}%` }}
                      className={`w-full rounded-lg transition-all ${
                        active
                          ? "bg-gradient-to-t from-indigo-600 to-emerald-400"
                          : "bg-slate-200"
                      }`}
                      title={`${day.date}: ${day.activities} activities, ${day.stars} stars`}
                    />
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-slate-200"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold ${
                      day.isToday ? "text-indigo-700" : "text-slate-500"
                    }`}
                  >
                    {day.shortDay}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-indigo-50/70 px-4 py-2.5 text-xs font-bold text-indigo-900">
            <span>✅ {weekTotals.activeDays} / 7 Active Days</span>
            <span>⭐ {weekTotals.stars} Stars This Week</span>
            <span>🎯 {weekTotals.activities} Activities</span>
          </div>
        </div>
      )}

      {/* VIEW 3: PAST MONTH (30 DAYS MAX) */}
      {view === "month" && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
                30-Day Stars
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">{monthTotals.stars}</p>
            </div>
            <div className="rounded-2xl border border-violet-200/80 bg-violet-50/70 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-violet-800">
                <Trophy className="h-3.5 w-3.5 text-violet-600" aria-hidden />
                30-Day Trophies
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">{monthTotals.trophies}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                Active Learning Days
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {monthTotals.activeDays} <span className="text-sm font-bold text-slate-500">/ 30</span>
              </p>
            </div>
          </div>

          {/* 30-day rolling consistency strip */}
          <div className="rounded-2xl border border-slate-100 bg-white p-3.5">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Past 30 Days Consistency (Rolling Cap)</span>
              <span>{monthTotals.activities} total activities</span>
            </div>
            <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-15">
              {monthDays.map((day) => {
                const active = day.activities > 0 || day.stars > 0;
                return (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.activities} activities, ${day.stars} stars`}
                    className={`h-5 rounded-md transition ${
                      active
                        ? "bg-emerald-500 shadow-xs"
                        : "bg-slate-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
