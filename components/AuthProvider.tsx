"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { isAdminEmail } from "@/lib/adminEmails";
import type { Profile } from "@/types/database";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapProfile(
  row: Record<string, unknown>,
  authEmail?: string | null,
  authCountry?: string | null,
): Profile {
  const parentEmail = (row.parent_email as string) ?? null;
  const flagged = Boolean(row.is_admin);
  return {
    id: row.id as string,
    parent_email: parentEmail,
    child_nickname: (row.child_nickname as string) ?? null,
    target_age_group: (row.target_age_group as Profile["target_age_group"]) ?? null,
    avatar_id: (row.avatar_id as string) ?? null,
    subscription_status: (row.subscription_status as Profile["subscription_status"]) ?? "free",
    subscription_expires_at: (row.subscription_expires_at as string) ?? null,
    is_admin: flagged || isAdminEmail(parentEmail) || isAdminEmail(authEmail),
    family_pack: Boolean(row.family_pack),
    tos_accepted_at: (row.tos_accepted_at as string) ?? null,
    country: (row.country as string) ?? authCountry ?? null,
    school_code: (row.school_code as string) ?? null,
    school_id: (row.school_id as string) ?? null,
    school_monthly_price_pkr:
      row.school_monthly_price_pkr != null
        ? Number(row.school_monthly_price_pkr)
        : null,
    stars: Number(row.stars ?? 0),
    unlocked_trophies: (row.unlocked_trophies as string[]) ?? [],
    unlocked_badges: (row.unlocked_badges as string[]) ?? [],
    unlocked_toys: (row.unlocked_toys as string[]) ?? [],
    reduce_motion: Boolean(row.reduce_motion),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (
      client: SupabaseClient,
      userId: string,
      authEmail?: string | null,
      authCountry?: string | null,
    ) => {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        if (isAdminEmail(authEmail)) {
          const adminRow = {
            id: userId,
            parent_email: authEmail,
            is_admin: true,
          };
          setProfile(mapProfile(adminRow, authEmail, authCountry));
          void client.from("profiles").upsert(adminRow);
          return;
        }
        setProfile(null);
        return;
      }

      const mapped = mapProfile(data, authEmail, authCountry);
      setProfile(mapped);

      // Persist allowlisted admin flag so RLS policies unlock
      if (mapped.is_admin && !data.is_admin) {
        await client.from("profiles").update({ is_admin: true }).eq("id", userId);
      }
    },
    [],
  );

  useEffect(() => {
    try {
      setSupabase(createClient());
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      if (data.user) {
        const metaCountry =
          typeof data.user.user_metadata?.country === "string"
            ? data.user.user_metadata.country
            : null;
        await fetchProfile(supabase, data.user.id, data.user.email, metaCountry);
      }
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        const metaCountry =
          typeof nextUser.user_metadata?.country === "string"
            ? nextUser.user_metadata.country
            : null;
        await fetchProfile(supabase, nextUser.id, nextUser.email, metaCountry);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const refreshProfile = async () => {
    if (!supabase || !user) return;
    const metaCountry =
      typeof user.user_metadata?.country === "string" ? user.user_metadata.country : null;
    await fetchProfile(supabase, user.id, user.email, metaCountry);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
