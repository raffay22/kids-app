import { createClient } from "@/utils/supabase/client";
import { GUEST_CHILD_ID, isGuestChild } from "@/utils/guestProgress";
import { todayLocalISO } from "@/utils/streaks";

export type DailyProgressRecord = {
  date: string; // YYYY-MM-DD
  stars_earned: number;
  activities_completed: number;
  trophies_earned: number;
};

export const DAILY_PROGRESS_UPDATED_EVENT = "kids:daily-progress-updated";

const MAX_DAYS = 30;
const CACHE_TTL_MS = 60_000;
const DEBOUNCE_MS = 1500;

const memoryCache = new Map<string, { fetchedAt: number; rows: DailyProgressRecord[] }>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function getRolling30DayCutoffISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (MAX_DAYS - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localKey(childId: string): string {
  return `growva_daily_progress_30d_v1_${childId}`;
}

function pruneTo30Days(rows: DailyProgressRecord[]): DailyProgressRecord[] {
  const cutoff = getRolling30DayCutoffISO();
  const byDate = new Map<string, DailyProgressRecord>();
  for (const row of rows) {
    if (!row.date || row.date < cutoff) continue;
    byDate.set(row.date, {
      date: row.date,
      stars_earned: Math.max(0, Number(row.stars_earned) || 0),
      activities_completed: Math.max(0, Number(row.activities_completed) || 0),
      trophies_earned: Math.max(0, Number(row.trophies_earned) || 0),
    });
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function readLocalDailyProgress(childId: string): DailyProgressRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localKey(childId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DailyProgressRecord[];
    if (!Array.isArray(parsed)) return [];
    return pruneTo30Days(parsed);
  } catch {
    return [];
  }
}

function writeLocalDailyProgress(childId: string, rows: DailyProgressRecord[]): DailyProgressRecord[] {
  const pruned = pruneTo30Days(rows);
  memoryCache.set(childId, { fetchedAt: Date.now(), rows: pruned });
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(localKey(childId), JSON.stringify(pruned));
    } catch {
      // ignore quota errors
    }
    window.dispatchEvent(
      new CustomEvent<{ childId: string; rows: DailyProgressRecord[] }>(
        DAILY_PROGRESS_UPDATED_EVENT,
        { detail: { childId, rows: pruned } },
      ),
    );
  }
  return pruned;
}

/**
 * Fetches strictly the past 30 days for a child, with client-side memory + localStorage caching
 * so switching between Today / This Week / Past Month is instantaneous with zero extra fetches.
 */
export async function fetch30DayChildProgress(
  childId: string | null | undefined,
  options?: { forceRefresh?: boolean },
): Promise<DailyProgressRecord[]> {
  const resolvedId = !childId || isGuestChild(childId) ? GUEST_CHILD_ID : childId;

  if (!options?.forceRefresh) {
    const cached = memoryCache.get(resolvedId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.rows;
    }
  }

  const localRows = readLocalDailyProgress(resolvedId);

  if (resolvedId === GUEST_CHILD_ID) {
    memoryCache.set(resolvedId, { fetchedAt: Date.now(), rows: localRows });
    return localRows;
  }

  try {
    const supabase = createClient();
    const cutoff = getRolling30DayCutoffISO();
    const { data, error } = await supabase
      .from("child_daily_progress")
      .select("date, stars_earned, activities_completed, trophies_earned")
      .eq("child_id", resolvedId)
      .gte("date", cutoff)
      .order("date", { ascending: true })
      .limit(MAX_DAYS);

    if (error || !data) {
      memoryCache.set(resolvedId, { fetchedAt: Date.now(), rows: localRows });
      return localRows;
    }

    // Merge remote rows with any unsynced local rows (taking max per date to prevent regressions)
    const mergedMap = new Map<string, DailyProgressRecord>();
    for (const r of localRows) {
      mergedMap.set(r.date, r);
    }
    for (const r of data) {
      const dateStr = String(r.date).slice(0, 10);
      const prev = mergedMap.get(dateStr);
      mergedMap.set(dateStr, {
        date: dateStr,
        stars_earned: Math.max(prev?.stars_earned ?? 0, Number(r.stars_earned ?? 0)),
        activities_completed: Math.max(
          prev?.activities_completed ?? 0,
          Number(r.activities_completed ?? 0),
        ),
        trophies_earned: Math.max(prev?.trophies_earned ?? 0, Number(r.trophies_earned ?? 0)),
      });
    }

    return writeLocalDailyProgress(resolvedId, Array.from(mergedMap.values()));
  } catch {
    memoryCache.set(resolvedId, { fetchedAt: Date.now(), rows: localRows });
    return localRows;
  }
}

/**
 * Increments today's daily counters in local cache immediately and debounces a single
 * daily upsert to `child_daily_progress` on `(child_id, date)` to minimize DB writes.
 */
export function recordDailyProgressDelta(params: {
  childId?: string | null;
  starsDelta?: number;
  activitiesDelta?: number;
  trophiesDelta?: number;
}): void {
  if (typeof window === "undefined") return;
  const resolvedId =
    !params.childId || isGuestChild(params.childId) ? GUEST_CHILD_ID : params.childId;
  const today = todayLocalISO();

  const existing = memoryCache.get(resolvedId)?.rows ?? readLocalDailyProgress(resolvedId);
  const current = existing.find((r) => r.date === today) ?? {
    date: today,
    stars_earned: 0,
    activities_completed: 0,
    trophies_earned: 0,
  };

  const updatedToday: DailyProgressRecord = {
    date: today,
    stars_earned: current.stars_earned + Math.max(0, Math.floor(params.starsDelta ?? 0)),
    activities_completed:
      current.activities_completed + Math.max(0, Math.floor(params.activitiesDelta ?? 0)),
    trophies_earned: current.trophies_earned + Math.max(0, Math.floor(params.trophiesDelta ?? 0)),
  };

  const nextRows = [...existing.filter((r) => r.date !== today), updatedToday];
  writeLocalDailyProgress(resolvedId, nextRows);

  // Guest mode stays strictly in localStorage
  if (resolvedId === GUEST_CHILD_ID) return;

  // Debounced single upsert to Supabase
  const prevTimer = pendingTimers.get(resolvedId);
  if (prevTimer) clearTimeout(prevTimer);

  const timer = setTimeout(() => {
    pendingTimers.delete(resolvedId);
    const latestRows = memoryCache.get(resolvedId)?.rows ?? readLocalDailyProgress(resolvedId);
    const latestToday = latestRows.find((r) => r.date === today);
    if (!latestToday) return;

    void (async () => {
      try {
        const supabase = createClient();
        await supabase.from("child_daily_progress").upsert(
          {
            child_id: resolvedId,
            date: latestToday.date,
            stars_earned: latestToday.stars_earned,
            activities_completed: latestToday.activities_completed,
            trophies_earned: latestToday.trophies_earned,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "child_id,date" },
        );
      } catch {
        // Silent fail if offline or table not yet migrated
      }
    })();
  }, DEBOUNCE_MS);

  pendingTimers.set(resolvedId, timer);
}
