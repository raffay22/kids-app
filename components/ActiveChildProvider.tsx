"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import type { ChildProfile } from "@/types/database";

const STORAGE_KEY = "kids_active_child_id";

type ActiveChildContextValue = {
  children: ChildProfile[];
  activeChild: ChildProfile | null;
  loading: boolean;
  refreshChildren: () => Promise<void>;
  setActiveChild: (childId: string) => void;
};

const ActiveChildContext = createContext<ActiveChildContextValue | undefined>(undefined);

function mapChild(row: Record<string, unknown>): ChildProfile {
  return {
    id: row.id as string,
    parent_user_id: row.parent_user_id as string,
    nickname: row.nickname as string,
    avatar_id: (row.avatar_id as string) ?? null,
    age_group: (row.age_group as ChildProfile["age_group"]) ?? null,
    onboarding_completed: Boolean(row.onboarding_completed),
    stars: Number(row.stars ?? 0),
    unlocked_trophies: (row.unlocked_trophies as string[]) ?? [],
    unlocked_badges: (row.unlocked_badges as string[]) ?? [],
    unlocked_toys: (row.unlocked_toys as string[]) ?? [],
    created_at: row.created_at as string,
  };
}

async function fetchChildren(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("children")
    .select("*")
    .eq("parent_user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapChild);
}

export function ActiveChildProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [childList, setChildList] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setSupabase(createClient());
    } catch {
      setLoading(false);
    }
  }, []);

  const refreshChildren = useCallback(async () => {
    if (!supabase || !user) {
      setChildList([]);
      setActiveChildId(null);
      setLoading(false);
      return;
    }

    const list = await fetchChildren(supabase, user.id);
    setChildList(list);

    const stored = localStorage.getItem(STORAGE_KEY);
    const validStored = list.find((c) => c.id === stored);
    const nextActive = validStored ?? list[0] ?? null;
    setActiveChildId(nextActive?.id ?? null);
    if (nextActive) localStorage.setItem(STORAGE_KEY, nextActive.id);

    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    refreshChildren();
  }, [refreshChildren]);

  const setActiveChild = (childId: string) => {
    const found = childList.find((c) => c.id === childId);
    if (!found) return;
    setActiveChildId(childId);
    localStorage.setItem(STORAGE_KEY, childId);
  };

  const activeChild = childList.find((c) => c.id === activeChildId) ?? null;

  return (
    <ActiveChildContext.Provider
      value={{
        children: childList,
        activeChild,
        loading,
        refreshChildren,
        setActiveChild,
      }}
    >
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) throw new Error("useActiveChild must be used within ActiveChildProvider");
  return ctx;
}
