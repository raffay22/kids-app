"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { normalizePageRoute } from "@/utils/pageAnalytics";

const CHANNEL = "online-users";

function sessionPresenceKey(): string {
  try {
    const existing = window.sessionStorage.getItem("kl_presence_key");
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    window.sessionStorage.setItem("kl_presence_key", id);
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

/**
 * Lightweight Supabase Realtime presence heartbeat for the whole app.
 * Admin listens on the same channel for 🟢 LIVE NOW counts.
 */
export default function PresenceHeartbeat() {
  const pathname = usePathname();
  const trackRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let cancelled = false;
    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch {
      return;
    }

    const key = sessionPresenceKey();
    const channel = supabase.channel(CHANNEL, {
      config: { presence: { key } },
    });

    const track = async () => {
      if (cancelled) return;
      const route = normalizePageRoute(pathname) ?? pathname;
      await channel.track({
        online_at: new Date().toISOString(),
        path: route,
      });
    };
    trackRef.current = track;

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await track();
    });

    const heartbeat = window.setInterval(() => {
      void trackRef.current?.();
    }, 25_000);

    return () => {
      cancelled = true;
      trackRef.current = null;
      window.clearInterval(heartbeat);
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- subscribe once; path updates below
  }, []);

  useEffect(() => {
    void trackRef.current?.();
  }, [pathname]);

  return null;
}
