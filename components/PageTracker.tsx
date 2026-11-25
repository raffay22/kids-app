"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { normalizePageRoute, titleForRoute } from "@/utils/pageAnalytics";

/**
 * Increments page_analytics.total_views on each client-side route change.
 */
export default function PageTracker() {
  const pathname = usePathname();
  const lastCounted = useRef<string | null>(null);
  const lastGranular = useRef<string | null>(null);

  useEffect(() => {
    const route = normalizePageRoute(pathname);
    if (route && lastCounted.current !== route) {
      lastCounted.current = route;
      try {
        const supabase = createClient();
        void supabase.rpc("increment_page_view", {
          p_route: route,
          p_title: titleForRoute(route),
        });
      } catch {
        /* Supabase not configured */
      }
    }

    // Lightweight debounced anonymous granular route view tracker (no PII / no user_id)
    if (!pathname || lastGranular.current === pathname) return;
    const timer = window.setTimeout(() => {
      lastGranular.current = pathname;
      void fetch("/api/analytics/route-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route_path: pathname }),
        keepalive: true,
      }).catch(() => {
        /* offline */
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
