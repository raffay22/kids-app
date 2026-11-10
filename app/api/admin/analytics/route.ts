import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";
import type { AnalyticsSummary } from "@/types/database";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data: profiles, error } = await auth.supabase
    .from("profiles")
    .select("subscription_status, target_age_group, created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = profiles ?? [];
  const totalUsers = rows.length;
  const freeUsers = rows.filter((p) => p.subscription_status === "free").length;
  const proUsers = rows.filter((p) => p.subscription_status === "pro").length;

  const ageMap = new Map<string, number>();
  rows.forEach((p) => {
    const key = p.target_age_group ?? "unknown";
    ageMap.set(key, (ageMap.get(key) ?? 0) + 1);
  });

  const ageDistribution = Array.from(ageMap.entries()).map(([ageGroup, count]) => ({
    ageGroup,
    count,
  }));

  const growthMap = new Map<string, number>();
  rows.forEach((p) => {
    const date = new Date(p.created_at).toISOString().slice(0, 10);
    growthMap.set(date, (growthMap.get(date) ?? 0) + 1);
  });

  const signUpGrowth = Array.from(growthMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  const summary: AnalyticsSummary = {
    totalUsers,
    freeUsers,
    proUsers,
    ageDistribution,
    signUpGrowth,
  };

  return NextResponse.json(summary);
}
