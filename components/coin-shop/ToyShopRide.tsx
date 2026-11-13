"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, Home, Star, Volume2 } from "lucide-react";
import ToyShopWorld from "@/components/coin-shop/ToyShopWorld";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { createClient } from "@/utils/supabase/client";
import { logProgress } from "@/utils/logProgress";
import { burstConfetti, playBoop, playClink, playDing, starShower } from "@/utils/celebrate";
import { FREE_MAX_COIN_PURCHASES, isProMembership } from "@/utils/membership";
import {
  COIN_TRAY_SIZE,
  SHOP_TOYS,
  STARS_PER_TOY,
  coinPrompt,
  coinsFromStars,
  toyAsShelfItem,
  type ShopToy,
} from "@/utils/coinShop";
import type { TrolleyShelfItem } from "@/utils/trolleyCatalog";

const TRAY = Array.from({ length: COIN_TRAY_SIZE }, (_, index) => `coin-${index}`);

export default function ToyShopRide() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();
  const isPro = isProMembership(profile);
  const reduceMotion = Boolean(profile?.reduce_motion);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropped, setDropped] = useState(0);
  const [spent, setSpent] = useState<string[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [landed, setLanded] = useState<TrolleyShelfItem[]>([]);
  const [purchases, setPurchases] = useState(0);
  const [banner, setBanner] = useState("Hold Walk to roll the trolley. Tap an item, then drop the coins on its tag.");
  const travelRef = useRef(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [bankPulse, setBankPulse] = useState(0);
  const [savedCoins, setSavedCoins] = useState(0);

  const starsRef = useRef<number | null>(null);
  const ownedRef = useRef<string[]>([]);
  const bankZone = useRef<HTMLDivElement>(null);
  const buyingRef = useRef(false);

  const selected = SHOP_TOYS.find((toy) => toy.id === selectedId) ?? null;
  const collectedIds = useMemo(() => new Set(owned), [owned]);

  useEffect(() => {
    const stop = () => {
      travelRef.current = 0;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    const timer = window.setTimeout(() => {
      speak("Walk the trolley. Tap an item, then drop the gold coins on its tag.", 0.92);
    }, 400);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.clearTimeout(timer);
    };
  }, [speak]);

  useEffect(() => {
    if (!activeChild) return;
    if (starsRef.current === null || activeChild.stars > starsRef.current) {
      starsRef.current = activeChild.stars ?? 0;
      setSavedCoins(coinsFromStars(starsRef.current));
    }
    setOwned((prev) => {
      const merged = Array.from(new Set([...(activeChild.unlocked_toys ?? []), ...prev]));
      ownedRef.current = merged;
      setLanded((basket) => {
        const ids = new Set(basket.map((item) => item.id));
        const extras = SHOP_TOYS.filter((toy) => merged.includes(toy.id) && !ids.has(toy.id)).map(toyAsShelfItem);
        return extras.length ? [...basket, ...extras] : basket;
      });
      return merged;
    });
  }, [activeChild]);

  const sayPaywall = useCallback(() => {
    playBoop();
    setShowPaywall(true);
    setBanner("Buy the paid plan to do more shopping.");
    speak("Buy the paid plan to do more shopping.", 0.92);
  }, [speak]);

  const selectToy = useCallback(
    (toy: ShopToy) => {
      if (ownedRef.current.includes(toy.id)) {
        playBoop();
        setBanner(`The ${toy.name} is already in the basket.`);
        speak(`The ${toy.name} is already in the basket.`, 0.92);
        return;
      }
      if (!isPro && purchases >= FREE_MAX_COIN_PURCHASES) {
        sayPaywall();
        return;
      }
      setShowPaywall(false);
      setSelectedId(toy.id);
      setDropped(0);
      setSpent([]);
      buyingRef.current = false;
      const line = coinPrompt(toy);
      setBanner(line);
      speak(line, 0.92);
    },
    [isPro, purchases, sayPaywall, speak],
  );

  const finishPurchase = useCallback(
    async (toy: ShopToy) => {
      if (buyingRef.current) return;
      buyingRef.current = true;
      setPurchases((count) => count + 1);
      setOwned((prev) => {
        const next = prev.includes(toy.id) ? prev : [...prev, toy.id];
        ownedRef.current = next;
        return next;
      });
      const nextStars = (starsRef.current ?? activeChild?.stars ?? 0) + STARS_PER_TOY;
      starsRef.current = nextStars;
      const nextCoins = coinsFromStars(nextStars);
      setSavedCoins(nextCoins);
      setBanner(`Saved! The ${toy.name} is yours. +5 stars equals 2 coins.`);
      playDing();
      starShower();
      burstConfetti();
      speak(`Saved! The ${toy.name} is yours. Plus 5 stars. That equals 2 coins.`, 0.92);

      if (!user || !activeChild) return;
      const unlocked = ownedRef.current;
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/games/coin-shop",
        attempt_type: "tap",
        target_word: `${toy.id}|saved_coins:${nextCoins}|unlocked:${unlocked.join(",")}`,
        is_correct: true,
      });
      try {
        const supabase = createClient();
        await supabase
          .from("children")
          .update({ stars: nextStars, unlocked_toys: unlocked })
          .eq("id", activeChild.id);
        await refreshChildren();
        await refreshProfile();
      } catch {
        // offline — the saving bank still keeps this round on screen
      }
    },
    [activeChild, refreshChildren, refreshProfile, speak, user],
  );

  const dropCoin = useCallback(
    (coinId: string) => {
      if (!selected) {
        playBoop();
        setBanner("Tap a toy on the shelf first.");
        speak("Tap a toy on the shelf first.", 0.92);
        return;
      }
      if (spent.includes(coinId) || dropped >= selected.price || buyingRef.current) return;
      const next = dropped + 1;
      setSpent((prev) => [...prev, coinId]);
      setDropped(next);
      setBankPulse((pulse) => pulse + 1);
      playClink();
      speak(String(next), 0.9);
      if (next >= selected.price) void finishPurchase(selected);
    },
    [dropped, finishPurchase, selected, speak, spent],
  );

  const onCoinPointerUp = (coinId: string, event: React.PointerEvent<HTMLButtonElement>) => {
    if (spent.includes(coinId)) return;
    const zone = bankZone.current?.getBoundingClientRect();
    const overBank = zone
      ? event.clientX >= zone.left &&
        event.clientX <= zone.right &&
        event.clientY >= zone.top &&
        event.clientY <= zone.bottom
      : false;
    const releasedOnCoin = event.currentTarget.contains(
      document.elementFromPoint(event.clientX, event.clientY),
    );
    if (overBank || releasedOnCoin) dropCoin(coinId);
  };

  return (
    <div className="overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/95 px-4 py-3">
        <div>
          <p className="text-sm font-extrabold text-slate-800">Math & Coin Toy Shop</p>
          <p className="inline-flex items-center gap-1 text-xs font-bold text-amber-800">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
            5 stars = 2 coins · Saved coins {savedCoins}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (selected) speak(coinPrompt(selected), 0.92);
              else speak("Tap a toy on the shelf first.", 0.92);
            }}
            className="inline-flex items-center gap-1 rounded-2xl bg-sky-50 px-3 py-2 text-xs font-extrabold text-sky-800"
          >
            <Volume2 className="h-4 w-4" aria-hidden />
            Hear Prompt
          </button>
          <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-900">
            {isPro ? "Toys unlocked" : `${purchases} / ${FREE_MAX_COIN_PURCHASES} toys`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-center text-sm font-extrabold text-amber-950">
        <span>{selected ? `${selected.name} needs ${selected.price} ${selected.price === 1 ? "coin" : "coins"}` : banner}</span>
        {selected && (
          <span className="inline-flex items-center gap-1" aria-label={`${selected.price} coins`}>
            {Array.from({ length: selected.price }, (_, index) => (
              <span
                key={index}
                className="inline-block h-5 w-5 rounded-full border-2 border-amber-700 bg-amber-300"
              />
            ))}
          </span>
        )}
      </div>

      <div className="relative h-[62svh] min-h-[340px] w-full md:h-[68vh] md:min-h-[480px] xl:h-[72vh] xl:min-h-[560px]">
        <ToyShopWorld
          toys={SHOP_TOYS}
          collectedIds={collectedIds}
          selectedId={selectedId}
          landedItems={landed}
          bankPulse={bankPulse}
          reduceMotion={reduceMotion}
          travelRef={travelRef}
          onSelect={selectToy}
          onLanded={(toy) => setLanded((prev) => [...prev, toyAsShelfItem(toy)])}
        />

        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-end justify-between gap-2 md:inset-x-6">
          <div
            ref={bankZone}
            className="pointer-events-auto rounded-3xl bg-white/95 px-4 py-3 shadow-xl"
          >
            <p className="text-xs font-black uppercase tracking-wide text-rose-600">Saving Bank</p>
            <p className="text-lg font-black text-slate-800">
              {selected ? `${dropped} / ${selected.price}` : "Pick a toy"}
            </p>
          </div>
          <div className="pointer-events-auto flex max-w-[70%] flex-wrap justify-end gap-2 rounded-3xl bg-white/95 p-2 shadow-xl">
            {TRAY.map((coinId) => {
              const used = spent.includes(coinId);
              return (
                <button
                  key={coinId}
                  type="button"
                  aria-label={used ? "Coin saved" : "Drop a gold coin into the Saving Bank"}
                  onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                  onPointerUp={(event) => onCoinPointerUp(coinId, event)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-b-4 text-sm font-black ${
                    used
                      ? "border-amber-200 bg-amber-100 text-amber-400"
                      : "border-amber-600 bg-gradient-to-b from-yellow-200 to-amber-400 text-amber-950"
                  }`}
                >
                  <Coins className="h-5 w-5" aria-hidden />
                </button>
              );
            })}
          </div>
        </div>

        {showPaywall && (
          <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-center">
            <div className="pointer-events-auto flex max-w-xl flex-col items-center gap-2 rounded-3xl bg-white/95 px-4 py-3 text-center shadow-xl sm:flex-row">
              <p className="text-sm font-extrabold text-slate-800">Buy the paid plan to do more shopping.</p>
              <Link href="/upgrade" className="rounded-2xl bg-amber-400 px-4 py-2 text-sm font-black text-amber-950">
                See the plan
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 bg-white px-3 py-3 md:flex-row md:items-center md:px-6">
        <button
          type="button"
          onClick={() => router.push("/games")}
          className="inline-flex items-center gap-1 rounded-2xl px-3 py-3 text-sm font-extrabold text-slate-600"
        >
          <Home className="h-4 w-4" aria-hidden />
          Games
        </button>
        <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto">
          <button
            type="button"
            onPointerDown={() => {
              travelRef.current = 1;
            }}
            onPointerUp={() => {
              travelRef.current = 0;
            }}
            onPointerLeave={() => {
              travelRef.current = 0;
            }}
            className="inline-flex items-center justify-center rounded-3xl border-b-8 border-sky-800 bg-sky-500 px-4 py-4 text-base font-black text-white"
          >
            Walk Back
          </button>
          <button
            type="button"
            onPointerDown={() => {
              travelRef.current = -1;
            }}
            onPointerUp={() => {
              travelRef.current = 0;
            }}
            onPointerLeave={() => {
              travelRef.current = 0;
            }}
            className="inline-flex items-center justify-center rounded-3xl border-b-8 border-emerald-800 bg-emerald-500 px-4 py-4 text-base font-black text-white"
          >
            Walk
          </button>
        </div>
        <p className="text-center text-xs font-bold text-slate-500 md:max-w-[14rem] md:text-right">
          Hold Walk to roll. Match the coin icons on the tag.
        </p>
      </div>
    </div>
  );
}
