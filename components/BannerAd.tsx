"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ParentalGate from "@/components/ParentalGate";
import { useAuth } from "@/components/AuthProvider";
import { isProUser, OPEN_ACCESS_TEST_MODE } from "@/lib/membership";
import {
  buildBrandClickUrl,
  type BrandAd,
  type BrandAdPlacementId,
} from "@/utils/brandAds";
import { createClient } from "@/utils/supabase/client";

type BannerAdProps = {
  /** Which inventory slot to fill — each slot can run a different brand creative. */
  placement: BrandAdPlacementId | string | (BrandAdPlacementId | string)[];
  className?: string;
};

function pickAd(ads: BrandAd[]): BrandAd | null {
  if (!ads.length) return null;
  // Stable daily rotate among ads sharing this placement
  const day = Math.floor(Date.now() / 86_400_000);
  return ads[day % ads.length] ?? ads[0];
}

/**
 * Custom brand banner (image or video) from Supabase `brand_ads`.
 * Not Google AdSense — creatives + links managed in /admin → Brand Ads.
 */
export default function BannerAd({ placement, className = "" }: BannerAdProps) {
  const { profile } = useAuth();
  const [ad, setAd] = useState<BrandAd | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const impressed = useRef(false);
  const rootRef = useRef<HTMLElement | null>(null);

  const hideForPaid =
    !OPEN_ACCESS_TEST_MODE && isProUser(profile);

  const placementKey = Array.isArray(placement) ? placement.join(",") : String(placement ?? "");

  useEffect(() => {
    if (hideForPaid || !placementKey) {
      setAd(null);
      return;
    }

    let cancelled = false;
    const placements = Array.isArray(placement) ? placement : [placement];

    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("brand_ads")
          .select("*")
          .in("placement", placements)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (cancelled) return;
        if (error || !data?.length) {
          setAd(null);
          return;
        }
        // Prefer exact first placement match if present, else fallback to broader match
        const preferred = data.filter((row) => row.placement === placements[0]);
        const pool = preferred.length ? preferred : data;
        setAd(pickAd(pool as BrandAd[]));
      } catch {
        if (!cancelled) setAd(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placementKey, hideForPaid]);

  useEffect(() => {
    impressed.current = false;
  }, [ad?.id]);

  useEffect(() => {
    if (!ad || !rootRef.current) return;
    const el = rootRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.4);
        if (!hit || impressed.current) return;
        impressed.current = true;
        try {
          const supabase = createClient();
          void supabase.rpc("increment_ad_impression", { p_ad_id: ad.id });
        } catch {
          /* ignore */
        }
      },
      { threshold: [0.4] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ad]);

  const destination = useMemo(() => (ad ? buildBrandClickUrl(ad) : null), [ad]);

  const openDestination = useCallback(() => {
    if (!ad || !destination) return;
    try {
      const supabase = createClient();
      void supabase.rpc("increment_ad_click", { p_ad_id: ad.id });
    } catch {
      /* ignore */
    }
    window.open(destination, "_blank", "noopener,noreferrer");
  }, [ad, destination]);

  if (hideForPaid || !ad) return null;

  return (
    <>
      <aside
        ref={rootRef}
        aria-label={`Sponsored: ${ad.brand_name}`}
        className={`relative mx-auto my-3 w-full max-w-xl overflow-hidden rounded-2xl border-2 border-amber-100 bg-white shadow-md ${className}`}
      >
        <span className="absolute right-2 top-2 z-10 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Ad
        </span>
        <button
          type="button"
          onClick={() => {
            if (!destination) return;
            setGateOpen(true);
          }}
          className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {ad.media_type === "video" ? (
            <video
              src={ad.media_url}
              className="aspect-[16/5] w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster=""
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.media_url}
              alt={ad.headline || ad.brand_name}
              className="aspect-[16/5] w-full object-cover"
            />
          )}
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-amber-700">{ad.brand_name}</p>
              {ad.headline ? (
                <p className="truncate text-sm font-extrabold text-slate-800">{ad.headline}</p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-white">
              {ad.whatsapp_phone ? "WhatsApp" : "Open"}
            </span>
          </div>
        </button>
      </aside>

      <ParentalGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onSuccess={openDestination}
        title="Parent check to open brand link"
      />
    </>
  );
}
