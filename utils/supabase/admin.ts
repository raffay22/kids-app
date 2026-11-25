import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/adminEmails";
import { createClient } from "@/utils/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin, parent_email")
    .eq("id", user.id)
    .maybeSingle();

  const allowlisted =
    isAdminEmail(user.email) || isAdminEmail(profile?.parent_email ?? null);

  if (profileError || (!profile?.is_admin && !allowlisted)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  // Keep DB flag in sync when an allowlisted admin signs in
  if (allowlisted && profile && !profile.is_admin) {
    await supabase.from("profiles").update({ is_admin: true }).eq("id", user.id);
  }

  return { supabase, user };
}
