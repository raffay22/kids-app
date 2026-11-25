"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Download,
  FileText,
  RefreshCw,
  Share2,
  Star,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import GrowvaLogo from "@/components/brand/GrowvaLogo";
import ChildProgressTracker from "@/components/ChildProgressTracker";
import ParentalGate from "@/components/ParentalGate";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { BRAND } from "@/utils/brand";
import { getLatestTrophyTitle, getTrophyById } from "@/utils/trophies";
import {
  buildProgressReportPdf,
  downloadBlob,
} from "@/utils/progressReportPdf";
import { createClient } from "@/utils/supabase/client";

type ProgressRow = {
  child_id: string;
  feature_route: string;
  attempt_type: string;
  target_word: string;
  is_correct: boolean;
  timestamp: string;
};

const DEMO_CHILD = {
  id: "demo-child-aya",
  nickname: "Aya (Demo)",
  stars: 128,
  unlocked_trophies: [
    "First Phonics Star",
    "7-Day Streak",
    "Sentence Builder",
    "Calm Explorer",
    "Math Lab Rookie",
  ],
};

/** Rich sample logs so charts look filled without a real account. */
function buildDemoRows(): ProgressRow[] {
  const words = [
    { w: "apple", ok: true },
    { w: "ball", ok: true },
    { w: "cat", ok: true },
    { w: "dog", ok: false },
    { w: "egg", ok: true },
    { w: "fish", ok: true },
    { w: "goat", ok: false },
    { w: "hat", ok: true },
    { w: "igloo", ok: false },
    { w: "jam", ok: true },
    { w: "she", ok: true },
    { w: "he", ok: false },
    { w: "they", ok: true },
  ];
  const routes = [
    "/phonics",
    "/phonics",
    "/sentences",
    "/flashcards",
    "/games/math",
    "/games/memory",
    "/asd/emergency",
  ];
  const rows: ProgressRow[] = [];
  const now = new Date();
  for (let day = 0; day < 14; day++) {
    const count = 4 + ((day * 3) % 7);
    for (let i = 0; i < count; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (13 - day));
      d.setHours(9 + (i % 8), (i * 7) % 60, 0, 0);
      const word = words[(day + i) % words.length];
      rows.push({
        child_id: DEMO_CHILD.id,
        feature_route: routes[(day + i) % routes.length],
        attempt_type: i % 3 === 0 ? "tap" : "speech",
        target_word: word.w,
        is_correct: word.ok || i % 5 !== 0,
        timestamp: d.toISOString(),
      });
    }
  }
  return rows;
}

const DEMO_ROWS = buildDemoRows();

function minutesFromLogs(rows: ProgressRow[]) {
  return Math.round(rows.length * 0.5);
}

function accuracyPct(rows: ProgressRow[]) {
  if (!rows.length) return 0;
  return Math.round((rows.filter((r) => r.is_correct).length / rows.length) * 100);
}

const FRIENDLY_ROUTE_MAP: Record<string, string> = {
  "/": "Home & Flashcards",
  "/flashcards": "Flashcards",
  "/phonics": "Phonics & Tracing",
  "/sentences": "Sentence Builder",
  "/coloring": "Coloring Board",
  "/worksheets": "Printable Worksheets",
  "/games": "Learning Games",
  "/games/math": "Math Lab",
  "/games/logic": "Logic Puzzles",
  "/games/memory": "Memory Match",
  "/games/word-search": "Word Search",
  "/games/picture-puzzle": "3D Picture Puzzle",
  "/games/trolley": "Supermarket Trolley",
  "/games/coin-shop": "Coin Toy Shop",
  "/games/bloom-blast": "Bloom Blast",
  "/games/shape-ninja": "Shape Ninja",
  "/games/stories/toddlers": "Toddler Stories",
  "/games/stories/bedtime": "Bedtime Stories",
  "/games/stories/explorers": "Explorer Stories",
  "/asd": "Sensory & Calm Tools",
  "/calm": "Calm Corner",
  "/pecs": "PECS Communication",
};

function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatRouteLabel(route: string | null | undefined): string {
  const clean = (route || "/").trim().replace(/\/+$/, "") || "/";
  const normalized = clean.startsWith("/") ? clean : `/${clean}`;
  if (FRIENDLY_ROUTE_MAP[normalized]) return FRIENDLY_ROUTE_MAP[normalized];
  if (normalized.startsWith("/games/stories/toddlers")) return "Toddler Stories";
  if (normalized.startsWith("/games/stories/bedtime")) return "Bedtime Stories";
  if (normalized.startsWith("/games/stories/explorers")) return "Explorer Stories";
  if (normalized.startsWith("/asd/")) return "Sensory & Calm Tools";
  const lastSegment = normalized.split("/").filter(Boolean).pop() ?? "Learning Activity";
  return toTitleCase(lastSegment.replace(/[-_]+/g, " "));
}

function formatActivityWord(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Learning Activity";
  const lower = trimmed.toLowerCase();

  // e.g. story_toddler_01:scene2 -> "Toddler Stories: Scene 2"
  const toddlerSceneMatch = lower.match(/^story_toddler_(\d+):scene(\d+)$/);
  if (toddlerSceneMatch) {
    return `Toddler Stories: Scene ${Number(toddlerSceneMatch[2])}`;
  }

  // e.g. story_bedtime_01:scene3 -> "Bedtime Stories: Scene 3"
  const bedtimeSceneMatch = lower.match(/^story_bedtime_(\d+):scene(\d+)$/);
  if (bedtimeSceneMatch) {
    return `Bedtime Stories: Scene ${Number(bedtimeSceneMatch[2])}`;
  }

  // e.g. trace-a -> "Phonics Tracing: Letter A"
  const traceMatch = lower.match(/^trace[-_]([a-z])$/);
  if (traceMatch) {
    return `Phonics Tracing: Letter ${traceMatch[1].toUpperCase()}`;
  }

  // e.g. math_solve:toddler -> "Math Lab (Toddler)"
  const mathMatch = lower.match(/^math_solve:([a-z0-9_-]+)$/);
  if (mathMatch) {
    return `Math Lab (${toTitleCase(mathMatch[1].replace(/[-_]+/g, " "))})`;
  }

  // e.g. session_complete:25 -> "Completed Learning Session"
  if (lower.startsWith("session_complete")) {
    return "Completed Learning Session";
  }

  // Generic colon-separated or snake/kebab slug cleanup
  if (trimmed.includes(":") || trimmed.includes("_") || trimmed.includes("-")) {
    return trimmed
      .split(":")
      .map((part) => toTitleCase(part.replace(/[-_]+/g, " ")))
      .join(": ");
  }

  return toTitleCase(trimmed);
}

function phonicBreakdown(rows: ProgressRow[]) {
  const map = new Map<string, { label: string; correct: number; total: number }>();
  for (const row of rows) {
    if (!row.target_word) continue;
    const label = formatActivityWord(row.target_word);
    const key = label.toLowerCase();
    const cur = map.get(key) ?? { label, correct: 0, total: 0 };
    cur.total += 1;
    if (row.is_correct) cur.correct += 1;
    map.set(key, cur);
  }
  const ranked = [...map.values()]
    .map((v) => ({
      word: v.label,
      pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
      total: v.total,
    }))
    .sort((a, b) => b.pct - a.pct || b.total - a.total);
  return {
    strongest: ranked.filter((item) => item.pct >= 70).slice(0, 6),
    // Strictly < 70% only — items with >= 70% (and never >= 80%) appear under Needs Practice
    weakest: ranked
      .filter((item) => item.pct < 70)
      .sort((a, b) => a.pct - b.pct || b.total - a.total)
      .slice(0, 6),
    all: ranked,
  };
}

function last14Days(rows: ProgressRow[]) {
  const days: { key: string; label: string; count: number; correct: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0,
      correct: 0,
    });
  }
  const index = new Map(days.map((d, i) => [d.key, i]));
  for (const row of rows) {
    const key = row.timestamp.slice(0, 10);
    const i = index.get(key);
    if (i == null) continue;
    days[i].count += 1;
    if (row.is_correct) days[i].correct += 1;
  }
  return days;
}

function byRoute(rows: ProgressRow[]) {
  const map = new Map<string, { total: number; correct: number }>();
  for (const row of rows) {
    const label = formatRouteLabel(row.feature_route);
    const cur = map.get(label) ?? { total: 0, correct: 0 };
    cur.total += 1;
    if (row.is_correct) cur.correct += 1;
    map.set(label, cur);
  }
  return [...map.entries()]
    .map(([label, v]) => ({
      label,
      count: v.total,
      accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function toCsv(rows: ProgressRow[]) {
  const header = [
    "timestamp",
    "child_id",
    "feature_route",
    "attempt_type",
    "target_word",
    "is_correct",
  ];
  const lines = rows.map((r) =>
    [
      r.timestamp,
      r.child_id,
      r.feature_route,
      r.attempt_type,
      `"${(r.target_word ?? "").replace(/"/g, '""')}"`,
      r.is_correct ? "1" : "0",
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

const ShareableProgressCard = dynamic(
  () => import("@/components/ShareableProgressCard"),
  { ssr: false },
);

/**
 * Professional Progress Tracking — branded charts, PDF report, share.
 */
export default function ParentAnalytics() {
  const { user, profile } = useAuth();
  const { children, activeChild, setActiveChild } = useActiveChild();
  const reportRef = useRef<HTMLElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const childId = activeChild?.id ?? null;

  const loadDemo = useCallback(() => {
    setDemoMode(true);
    setRows(DEMO_ROWS);
    setLoading(false);
  }, []);

  const load = useCallback(async () => {
    if (!user || !childId) {
      loadDemo();
      return;
    }
    setLoading(true);
    setDemoMode(false);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_progress")
        .select(
          "child_id, feature_route, attempt_type, target_word, is_correct, timestamp",
        )
        .eq("user_id", user.id)
        .eq("child_id", childId)
        .order("timestamp", { ascending: false })
        .limit(800);
      const real = error ? [] : ((data as ProgressRow[]) ?? []);
      if (real.length === 0) {
        loadDemo();
      } else {
        setDemoMode(false);
        setRows(real);
      }
    } catch {
      loadDemo();
    } finally {
      setLoading(false);
    }
  }, [user, childId, loadDemo]);

  useEffect(() => {
    if (unlocked) void load();
  }, [unlocked, load]);

  const displayRows = demoMode ? DEMO_ROWS : rows;
  const minutes = useMemo(() => minutesFromLogs(displayRows), [displayRows]);
  const accuracy = useMemo(() => accuracyPct(displayRows), [displayRows]);
  const phonics = useMemo(() => phonicBreakdown(displayRows), [displayRows]);
  const daily = useMemo(() => last14Days(displayRows), [displayRows]);
  const routes = useMemo(() => byRoute(displayRows), [displayRows]);
  const speechAttempts = displayRows.filter((r) => r.attempt_type === "speech").length;
  const tapAttempts = displayRows.length - speechAttempts;
  const trophies = demoMode
    ? DEMO_CHILD.unlocked_trophies
    : (activeChild?.unlocked_trophies ?? DEMO_CHILD.unlocked_trophies);
  const stars = demoMode
    ? DEMO_CHILD.stars
    : (activeChild?.stars && activeChild.stars > 0
        ? activeChild.stars
        : DEMO_CHILD.stars);
  const childName = demoMode
    ? DEMO_CHILD.nickname
    : (activeChild?.nickname ?? DEMO_CHILD.nickname);
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));

  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const productionAppUrl =
    envAppUrl && !envAppUrl.includes("localhost")
      ? envAppUrl.replace(/\/$/, "")
      : "https://growvajunior.com";

  const shareUrl = `${productionAppUrl}/analytics`;
  const practiceTime = `${minutes} min`;

  const latestTrophyTitle = getLatestTrophyTitle(trophies);
  const shareText =
    "🌟 Proud Parent Moment on Growva Junior! 🎉\n\n" +
    `My little learner *${childName}* just rocked their learning session! 🚀\n` +
    `⭐ Stars Earned: ${stars}\n` +
    `🏆 Trophies: ${trophies.length}` +
    (latestTrophyTitle ? ` (${latestTrophyTitle})` : "") +
    `\n` +
    `🎯 Accuracy: ${accuracy}%\n` +
    `⏱️ Practice: ${practiceTime}\n\n` +
    `Try 100% ad-free logic, math & stories for kids: ${productionAppUrl}`;

  const topHighlight = useMemo(() => {
    const top1 = routes[0];
    const top2 = routes[1];
    if (top1 && top2) {
      return `Practiced ${top1.label} & ${top2.label} with ${accuracy}% accuracy!`;
    }
    if (top1) {
      return `Completed ${top1.count} ${top1.count === 1 ? "activity" : "activities"} in ${top1.label} (${top1.accuracy}% accuracy)!`;
    }
    if (displayRows.length > 0) {
      return `Completed ${displayRows.length} learning ${displayRows.length === 1 ? "activity" : "activities"} with ${accuracy}% accuracy!`;
    }
    if (stars > 0) {
      return `Earned ${stars} stars on Growva Junior!`;
    }
    return "Started a new learning adventure on Growva Junior!";
  }, [routes, displayRows.length, accuracy, stars]);

  const downloadCsv = () => {
    const blob = new Blob([toCsv(displayRows)], {
      type: "text/csv;charset=utf-8",
    });
    downloadBlob(
      blob,
      `growva-progress-${childName}-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    setStatus(demoMode ? "Demo CSV downloaded." : "CSV downloaded.");
  };

  const downloadPdf = () => {
    const blob = buildProgressReportPdf({
      childName,
      parentEmail:
        profile?.parent_email ?? user?.email ?? "demo.parent@growvabusiness.com",
      generatedAt: new Date().toLocaleString(),
      minutes,
      accuracy,
      stars,
      trophies: trophies.length,
      attempts: displayRows.length,
      speechAttempts,
      tapAttempts,
      daily: daily.map((d) => ({ label: d.label, count: d.count })),
      byRoute: routes,
      strongest: phonics.strongest,
      weakest: phonics.weakest,
    });
    downloadBlob(
      blob,
      `growva-progress-report-${childName}-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
    setStatus(
      demoMode
        ? "Demo branded PDF downloaded."
        : "Branded PDF report downloaded.",
    );
  };

  const shareReport = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${BRAND.product} Progress`,
          text: shareText,
          url: shareUrl,
        });
        setStatus("Shared.");
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setStatus("Share text copied.");
    } catch {
      setStatus("Share cancelled.");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("Share link copied.");
    } catch {
      setStatus("Could not copy link.");
    }
  };


  if (!unlocked) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-indigo-100 bg-white p-8 text-center shadow-xl">
        <GrowvaLogo className="justify-center" />
        <h1 className="text-2xl font-extrabold text-slate-900">Progress Tracking</h1>
        <p className="text-sm font-medium text-slate-600">
          Parent area — unlock charts, PDF report, and shareable summary.
        </p>
        <button
          type="button"
          onClick={() => setGateOpen(true)}
          className="w-full rounded-2xl border-b-4 border-indigo-700 bg-gradient-to-b from-indigo-400 to-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg"
        >
          Unlock Progress Dashboard
        </button>
        <button
          type="button"
          onClick={() => {
            loadDemo();
            setUnlocked(true);
            setGateOpen(false);
          }}
          className="w-full rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-3 text-sm font-extrabold text-amber-900 shadow-md transition hover:bg-amber-100"
        >
          Preview demo account (Aya · 128⭐)
        </button>
        <p className="text-xs font-medium text-slate-400">
          Demo shows sample stars, trophies, and graphs — no signup needed.
        </p>
        <ParentalGate
          open={gateOpen}
          onClose={() => setGateOpen(false)}
          onSuccess={() => {
            setUnlocked(true);
            setGateOpen(false);
          }}
          title="Parent Check — Progress"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Home
        </Link>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Refresh
        </button>
      </div>

      {/* Brand hero */}
      <section
        ref={reportRef}
        className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl"
      >
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 px-5 py-6 text-white sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <GrowvaLogo dark />
            <div className="text-right text-xs font-semibold text-indigo-100">
              <p>Progress Tracking</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
            {childName}&apos;s Learning Report
          </h1>
          <p className="mt-1 max-w-xl text-sm font-medium text-indigo-100">
            Professional practice analytics for parents, teachers, and therapists —
            export PDF or share a summary link.
          </p>
          {demoMode && (
            <p className="mt-3 inline-flex rounded-full bg-amber-300/95 px-3 py-1 text-xs font-extrabold text-amber-950 shadow">
              Demo account preview · sample stars, trophies &amp; graphs
            </p>
          )}
        </div>

        {demoMode ? (
          <div className="flex flex-wrap gap-2 border-b border-amber-100 bg-amber-50/90 px-5 py-3 sm:px-7">
            <span className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-extrabold text-white shadow">
              {DEMO_CHILD.nickname}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
              ⭐ {DEMO_CHILD.stars} stars
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-violet-800 ring-1 ring-violet-200">
              🏆 {DEMO_CHILD.unlocked_trophies.length} trophies
            </span>
          </div>
        ) : children.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3 sm:px-7">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={c.id === childId}
                onClick={() => setActiveChild(c.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                  c.id === childId
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {c.nickname}
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-6 p-5 sm:p-7">
          <ChildProgressTracker
            childId={childId}
            childName={childName}
            demoMode={demoMode}
            fallbackRows={displayRows}
          />
          {loading ? (
            <p className="text-center text-sm font-semibold text-slate-500">
              Loading analytics…
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi
                  icon={<Timer className="h-5 w-5" />}
                  label="Practice time"
                  value={`${minutes} min`}
                  hint="Estimated from attempts"
                  accent="text-sky-600 bg-sky-50"
                />
                <Kpi
                  icon={<Target className="h-5 w-5" />}
                  label="Accuracy"
                  value={`${accuracy}%`}
                  hint="Speech & tap success"
                  accent="text-emerald-600 bg-emerald-50"
                />
                <Kpi
                  icon={<Star className="h-5 w-5" />}
                  label="Stars"
                  value={`${stars}`}
                  hint="Earned rewards"
                  accent="text-amber-600 bg-amber-50"
                />
                <Kpi
                  icon={<Trophy className="h-5 w-5" />}
                  label="Trophies"
                  value={`${trophies.length}`}
                  hint="Unlocked badges"
                  accent="text-violet-600 bg-violet-50"
                />
              </div>

              {/* Line / area activity chart */}
              <article className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <h2 className="text-sm font-extrabold text-slate-800">
                  14-day practice activity
                </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Attempts per day · brand indigo series
                  </p>
                  <svg
                    viewBox="0 0 560 180"
                    className="mt-3 h-44 w-full"
                    role="img"
                    aria-label="Practice activity chart"
                  >
                    <defs>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BRAND.colors.indigo} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={BRAND.colors.indigo} stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2, 3].map((g) => (
                      <line
                        key={g}
                        x1="40"
                        x2="540"
                        y1={20 + g * 40}
                        y2={20 + g * 40}
                        stroke="#E2E8F0"
                        strokeWidth="1"
                      />
                    ))}
                    {(() => {
                      const pts = daily.map((d, i) => {
                        const x = 40 + (i / Math.max(1, daily.length - 1)) * 500;
                        const y = 160 - (d.count / maxDaily) * 130;
                        return `${x},${y}`;
                      });
                      const line = pts.join(" ");
                      const area = `40,160 ${pts.join(" ")} 540,160`;
                      return (
                        <>
                          <polygon points={area} fill="url(#areaFill)" />
                          <polyline
                            points={line}
                            fill="none"
                            stroke={BRAND.colors.indigo}
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                          {daily.map((d, i) => {
                            const x = 40 + (i / Math.max(1, daily.length - 1)) * 500;
                            const y = 160 - (d.count / maxDaily) * 130;
                            return (
                              <circle
                                key={d.key}
                                cx={x}
                                cy={y}
                                r="3.5"
                                fill={BRAND.colors.violet}
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                    {daily
                      .filter((_, i) => i % 2 === 0)
                      .map((d, idx) => {
                        const i = idx * 2;
                        const x = 40 + (i / Math.max(1, daily.length - 1)) * 500;
                        return (
                          <text
                            key={d.key}
                            x={x}
                            y="176"
                            textAnchor="middle"
                            fontSize="9"
                            fill="#64748B"
                          >
                            {d.label}
                          </text>
                        );
                      })}
                </svg>
              </article>

              {/* Horizontal bars by route */}
              <article className="rounded-2xl border border-slate-100 bg-white p-4">
                <h2 className="text-sm font-extrabold text-slate-800">
                  Activity breakdown
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Volume and accuracy by learning activity
                </p>
                <div className="mt-4 space-y-3">
                  {routes.length === 0 && (
                    <p className="text-sm text-slate-400">No activity logged yet.</p>
                  )}
                  {routes.map((r) => (
                    <div
                      key={r.label}
                      className="grid grid-cols-[minmax(8.5rem,11.5rem)_1fr_3.25rem] items-center gap-2.5"
                    >
                      <span
                        title={r.label}
                        className="truncate text-xs font-bold text-slate-700"
                      >
                        {r.label}
                      </span>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{
                            width: `${Math.max(
                              6,
                              (r.count / Math.max(1, routes[0]?.count ?? 1)) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-right text-[11px] font-bold text-slate-500">
                        {r.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <div className="grid gap-4 sm:grid-cols-2">
                <SkillPanel
                  title="Strongest sounds / activities"
                  items={phonics.strongest}
                  tone="good"
                />
                <SkillPanel
                  title="Needs practice"
                  items={phonics.weakest}
                  tone="soft"
                  emptyCelebration={
                    displayRows.length > 0
                      ? "🌟 Super Star! Doing great in all areas today!"
                      : undefined
                  }
                />
              </div>

              {trophies.length > 0 && (
                <article className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                  <h2 className="text-sm font-extrabold text-amber-900">
                    Trophy gallery
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {trophies.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-200"
                      >
                        🏆 {getTrophyById(t)?.label ?? formatActivityWord(t)}
                      </span>
                    ))}
                  </div>
                </article>
              )}
            </>
          )}
        </div>
      </section>

      {/* Actions */}
      <section className="rounded-3xl border border-indigo-100 bg-white p-4 shadow-lg sm:p-5">
        <h2 className="text-sm font-extrabold text-slate-800">Export &amp; share</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Branded PDF for teachers · CSV for spreadsheets · shareable summary
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <ActionBtn onClick={downloadPdf} icon={<FileText className="h-4 w-4" />} primary>
            Download complete PDF
          </ActionBtn>
          <ActionBtn
            onClick={downloadCsv}
            icon={<Download className="h-4 w-4" />}
            disabled={!displayRows.length}
          >
            Download CSV ({displayRows.length})
          </ActionBtn>
          <ActionBtn onClick={() => void shareReport()} icon={<Share2 className="h-4 w-4" />}>
            Share report
          </ActionBtn>
          <ActionBtn onClick={() => void copyLink()} icon={<Copy className="h-4 w-4" />}>
            Copy share link
          </ActionBtn>
          <button
            type="button"
            onClick={() => setShareCardOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800 transition hover:bg-emerald-100"
          >
            WhatsApp share
          </button>
        </div>
        {status && (
          <p className="mt-3 text-center text-sm font-semibold text-indigo-700" role="status">
            {status}
          </p>
        )}
      </section>

      {shareCardOpen ? (
        <ShareableProgressCard
          open={shareCardOpen}
          onClose={() => setShareCardOpen(false)}
          childName={childName}
          stars={stars}
          trophiesCount={trophies.length}
          latestTrophyTitle={getLatestTrophyTitle(trophies)}
          accuracy={accuracy}
          practiceMinutes={minutes}
          highlightText={topHighlight}
          appUrl={productionAppUrl}
          captionText={shareText}
        />
      ) : null}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`inline-flex rounded-xl p-2 ${accent}`}>{icon}</div>
      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[11px] font-medium text-slate-400">{hint}</p>
    </div>
  );
}

function SkillPanel({
  title,
  items,
  tone,
  emptyCelebration,
}: {
  title: string;
  items: { word: string; pct: number }[];
  tone: "good" | "soft";
  emptyCelebration?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-extrabold text-slate-800">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.length === 0 && (
          emptyCelebration ? (
            <li className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-3 text-center text-xs font-extrabold text-emerald-800 sm:text-sm">
              {emptyCelebration}
            </li>
          ) : (
            <li className="text-sm text-slate-400">No data yet — keep practising.</li>
          )
        )}
        {items.map((item) => (
          <li key={item.word} className="flex items-center gap-2.5">
            <span
              title={item.word}
              className="w-36 shrink-0 truncate text-xs font-bold text-slate-700 sm:w-44"
            >
              {item.word}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  tone === "good"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                    : "bg-gradient-to-r from-rose-300 to-orange-400"
                }`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs font-bold text-slate-600">
              {item.pct}%
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ActionBtn({
  children,
  onClick,
  icon,
  primary,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon: ReactNode;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold disabled:opacity-50 ${
        primary
          ? "border-b-4 border-indigo-800 bg-gradient-to-b from-indigo-500 to-violet-600 text-white shadow-lg"
          : "border border-slate-200 bg-slate-50 text-slate-800"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
