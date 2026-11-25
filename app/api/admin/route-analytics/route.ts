import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home Dashboard",
  "/games": "Games Hub",
  "/games/stories": "Stories Hub",
  "/games/stories/bedtime": "Bedtime Stories",
  "/games/stories/toddlers": "Toddler Stories",
  "/games/math": "3D Math Lab",
  "/games/logic": "Logic Puzzles",
  "/games/word-search": "Word Search",
  "/games/picture-puzzle": "3D Picture Puzzle",
  "/games/bloom-blast": "Bloom Blast",
  "/games/shape-ninja": "Shape Ninja",
  "/games/coin-shop": "Coin Toy Shop",
  "/games/trolley": "Supermarket Trolley",
  "/games/memory": "3D Tactile Memory",
  "/coloring": "Colouring Board",
  "/worksheets": "Printable Worksheets",
  "/phonics": "Phonics",
  "/sentences": "Make Sentence",
  "/flashcards": "Flashcards",
  "/shop": "Parent Shop",
  "/analytics": "Child Progress",
  "/asd": "ASD Sensory Hub",
  "/pecs": "PECS Board",
  "/upgrade": "Upgrade Plans",
  "/payment": "Manual Payment",
  "/checkout": "Checkout",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function featureNameForRoute(routePath: string): string {
  return ROUTE_LABELS[routePath] ?? routePath;
}

function isoDateUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function listCalendarDates(startStr: string, endStr: string): string[] {
  const start = new Date(`${startStr}T00:00:00.000Z`);
  const end = new Date(`${endStr}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }
  const dates: string[] = [];
  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 366) {
    dates.push(isoDateUTC(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
    guard += 1;
  }
  return dates;
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const defaultEnd = isoDateUTC(now);
  const defaultStartDate = new Date(now);
  defaultStartDate.setUTCDate(defaultStartDate.getUTCDate() - 29);
  const defaultStart = isoDateUTC(defaultStartDate);

  const startDate = searchParams.get("startDate") || defaultStart;
  const endDate = searchParams.get("endDate") || defaultEnd;
  const calendarDates = listCalendarDates(startDate, endDate);
  const totalDays = Math.max(1, calendarDates.length);

  const rangeStartIso = `${startDate}T00:00:00.000Z`;
  const rangeEndIso = `${endDate}T23:59:59.999Z`;

  const { data, error } = await auth.supabase
    .from("route_views")
    .select("route_path, viewed_at")
    .gte("viewed_at", rangeStartIso)
    .lte("viewed_at", rangeEndIso)
    .order("viewed_at", { ascending: true })
    .limit(50000);

  if (error) {
    if (error.message.includes("schema cache") || error.code === "PGRST204") {
      return NextResponse.json({
        missingTable: true,
        startDate,
        endDate,
        summary: {
          totalViews: 0,
          topRoute: "—",
          topRouteName: "—",
          topRouteViews: 0,
          avgDailyViews: 0,
          totalDays,
        },
        routes: [],
        daily: calendarDates.map((d) => ({
          date: d,
          dayOfWeek: DAY_NAMES[new Date(`${d}T00:00:00.000Z`).getUTCDay()],
          totalViews: 0,
          byRoute: {},
        })),
        dailyRows: [],
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as { route_path: string; viewed_at: string }[];
  const routeTotals = new Map<string, number>();
  const dailyMap = new Map<string, { totalViews: number; byRoute: Record<string, number> }>();

  for (const d of calendarDates) {
    dailyMap.set(d, { totalViews: 0, byRoute: {} });
  }

  for (const row of rows) {
    const r = row.route_path || "/";
    const dateKey = String(row.viewed_at).slice(0, 10);
    routeTotals.set(r, (routeTotals.get(r) ?? 0) + 1);
    const bucket = dailyMap.get(dateKey);
    if (bucket) {
      bucket.totalViews += 1;
      bucket.byRoute[r] = (bucket.byRoute[r] ?? 0) + 1;
    }
  }

  const totalViews = rows.length;
  const routes = Array.from(routeTotals.entries())
    .map(([routePath, views]) => ({
      routePath,
      featureName: featureNameForRoute(routePath),
      totalViews: views,
      dailyAvg: Number((views / totalDays).toFixed(1)),
      trafficSharePct:
        totalViews > 0 ? Number(((views / totalViews) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.totalViews - a.totalViews);

  const top = routes[0];
  const daily = calendarDates.map((d) => {
    const bucket = dailyMap.get(d) ?? { totalViews: 0, byRoute: {} };
    const dayOfWeek = DAY_NAMES[new Date(`${d}T00:00:00.000Z`).getUTCDay()];
    return {
      date: d,
      dayOfWeek,
      totalViews: bucket.totalViews,
      byRoute: bucket.byRoute,
    };
  });

  const dailyRows: {
    date: string;
    dayOfWeek: string;
    routePath: string;
    featureName: string;
    views: number;
  }[] = [];

  for (const d of daily) {
    const entries = Object.entries(d.byRoute).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      dailyRows.push({
        date: d.date,
        dayOfWeek: d.dayOfWeek,
        routePath: "ALL",
        featureName: "Platform Total",
        views: 0,
      });
    } else {
      for (const [routePath, views] of entries) {
        dailyRows.push({
          date: d.date,
          dayOfWeek: d.dayOfWeek,
          routePath,
          featureName: featureNameForRoute(routePath),
          views,
        });
      }
    }
  }

  return NextResponse.json({
    missingTable: false,
    startDate,
    endDate,
    summary: {
      totalViews,
      topRoute: top?.routePath ?? "—",
      topRouteName: top?.featureName ?? "—",
      topRouteViews: top?.totalViews ?? 0,
      avgDailyViews: Number((totalViews / totalDays).toFixed(1)),
      totalDays,
    },
    routes,
    daily,
    dailyRows,
  });
}
