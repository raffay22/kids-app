import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

/** List children with current_streak >= 7 for shoutout banner studio. */
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("user_streaks")
    .select(
      "id, user_id, child_id, current_streak, longest_streak, last_practice_date, feature_route",
    )
    .gte("current_streak", 7)
    .order("current_streak", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const childIds = [...new Set((data ?? []).map((r) => r.child_id).filter(Boolean))];
  let children: { id: string; nickname: string | null; avatar_id: string | null }[] = [];
  if (childIds.length) {
    const { data: kids } = await auth.supabase
      .from("children")
      .select("id, nickname, avatar_id")
      .in("id", childIds);
    children = kids ?? [];
  }
  const byId = new Map(children.map((c) => [c.id, c]));

  const shoutouts = (data ?? []).map((row) => {
    const child = byId.get(row.child_id);
    return {
      ...row,
      nickname: child?.nickname ?? "Friend",
      avatar_id: child?.avatar_id ?? null,
      whatsappText: `🔥 ${child?.nickname ?? "Our star"} just hit a ${row.current_streak}-Day Practice Streak on Kids Learning App! Keep going!`,
    };
  });

  return NextResponse.json({ shoutouts });
}
