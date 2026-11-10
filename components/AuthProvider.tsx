"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/types/database";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    parent_email: (row.parent_email as string) ?? null,
    child_nickname: (row.child_nickname as string) ?? null,
    target_age_group: (row.target_age_group as Profile["target_age_group"]) ?? null,
    avatar_id: (row.avatar_id as string) ?? null,
    subscription_status: (row.subscription_status as Profile["subscription_status"]) ?? "free",
    subscription_expires_at: (row.subscription_expires_at as string) ?? null,
    is_admin: Boolean(row.is_admin),
    family_pack: Boolean(row.family_pack),
    tos_accepted_at: (row.tos_accepted_at as string) ?? null,
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
    async (client: SupabaseClient, userId: string) => {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        setProfile(null);
        return;
      }

      setProfile(mapProfile(data));
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
      if (data.user) await fetchProfile(supabase, data.user.id);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await fetchProfile(supabase, nextUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const refreshProfile = async () => {
    if (!supabase || !user) return;
    await fetchProfile(supabase, user.id);
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
