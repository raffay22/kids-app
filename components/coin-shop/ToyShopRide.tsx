"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  Home,
  PlusCircle,
  Sparkles,
  Star,
  Volume2,
  Wallet,
  X,
} from "lucide-react";
import ToyShopWorld from "@/components/coin-shop/ToyShopWorld";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { createClient } from "@/utils/supabase/client";
import {
  GUEST_PROGRESS_STORAGE_KEY,
  GUEST_PROGRESS_UPDATED_EVENT,
  isGuestChild,
  readGuestProgress,
  type GuestProgressState,
} from "@/utils/guestProgress";
import { logProgress } from "@/utils/logProgress";
import { burstConfetti, playBoop, playClink, playDing, starShower } from "@/utils/celebrate";
import { FREE_MAX_COIN_PURCHASES, isProMembership } from "@/utils/membership";
import {
  COIN_PACKS,
  CROSSROADS_INTERVAL,
  INITIAL_COIN_BUDGET,
  MART_DEPARTMENTS,
  SHOP_ROWS,
  SHOP_TOYS,
  coinPrompt,
  readCoinWallet,
  rowZ,
  toyAsShelfItem,
  writeCoinWallet,
  type CoinPack,
  type MartPathChoice,
  type ShopToy,
} from "@/utils/coinShop";
import type { ShopperChoice, TrolleyShelfItem } from "@/utils/trolleyCatalog";

const STARTER_STARS_SEED_KEY = "kids_coin_shop_starter_stars_v3";
const STARTER_STARS_AMOUNT = 150;
const LOW_BALANCE_MESSAGE =
  "You do not have enough balance to buy this! Do you want to buy some coins? You can buy from the left side from Coin Wallet.";

/**
 * Clean 2D Full-Character Boy & Girl Shopper Portrait Images for the starting page
 * so their full smiling faces, eyes, hair, outfits, and shopping carts are 100% visible.
 */
function ShopperPortraitImage({ shopper }: { shopper: ShopperChoice }) {
  if (shopper === "boy") {
    return (
      <svg
        viewBox="0 0 240 220"
        className="h-full w-full"
        role="img"
        aria-label="Boy Shopper illustration"
      >
        <defs>
          <radialGradient id="boyBg" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </radialGradient>
        </defs>
        <rect width="240" height="220" rx="20" fill="url(#boyBg)" />
        <ellipse cx="120" cy="202" rx="64" ry="10" fill="#93c5fd" opacity="0.55" />
        {/* Legs & Red Sneakers */}
        <rect x="98" y="148" width="16" height="44" rx="8" fill="#1e293b" />
        <rect x="126" y="148" width="16" height="44" rx="8" fill="#1e293b" />
        <ellipse cx="104" cy="194" rx="14" ry="8" fill="#ef4444" />
        <ellipse cx="136" cy="194" rx="14" ry="8" fill="#ef4444" />
        <rect x="90" y="196" width="28" height="4" rx="2" fill="#ffffff" />
        <rect x="122" y="196" width="28" height="4" rx="2" fill="#ffffff" />
        {/* Royal Blue Varsity Jacket & Star Shirt */}
        <rect x="88" y="96" width="64" height="58" rx="18" fill="#1d4ed8" />
        <rect x="106" y="96" width="28" height="58" fill="#38bdf8" />
        <polygon
          points="120,112 123,120 131,120 125,125 127,133 120,128 113,133 115,125 109,120 117,120"
          fill="#facc15"
        />
        {/* Waving Arms & Hands */}
        <path
          d="M90 106 Q72 122 76 142"
          stroke="#1d4ed8"
          strokeWidth="15"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="76" cy="145" r="8" fill="#f1b896" />
        <path
          d="M150 106 Q172 88 176 68"
          stroke="#1d4ed8"
          strokeWidth="15"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="177" cy="65" r="8" fill="#f1b896" />
        {/* Neck & Smiling Face */}
        <rect x="112" y="84" width="16" height="16" rx="6" fill="#e5a782" />
        <circle cx="88" cy="58" r="8" fill="#f1b896" />
        <circle cx="152" cy="58" r="8" fill="#f1b896" />
        <circle cx="120" cy="56" r="32" fill="#f1b896" />
        {/* Rosy Cheeks */}
        <ellipse cx="101" cy="63" rx="6" ry="3.5" fill="#fb7185" opacity="0.45" />
        <ellipse cx="139" cy="63" rx="6" ry="3.5" fill="#fb7185" opacity="0.45" />
        {/* Big Bright Eyes */}
        <circle cx="107" cy="54" r="6" fill="#ffffff" />
        <circle cx="133" cy="54" r="6" fill="#ffffff" />
        <circle cx="108" cy="54" r="4" fill="#3b2314" />
        <circle cx="134" cy="54" r="4" fill="#3b2314" />
        <circle cx="109.5" cy="52.5" r="1.5" fill="#ffffff" />
        <circle cx="135.5" cy="52.5" r="1.5" fill="#ffffff" />
        {/* Eyebrows & Cute Nose & Happy Smile */}
        <path d="M100 44 Q107 41 113 44" stroke="#3b2314" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M127 44 Q133 41 140 44" stroke="#3b2314" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="120" cy="60" r="2.5" fill="#d9956f" />
        <path
          d="M108 68 Q120 79 132 68"
          stroke="#be123c"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Styled Chocolate Hair & Sporty Cap */}
        <path
          d="M88 48 Q92 20 120 20 Q148 20 152 48 Q138 35 120 37 Q102 35 88 48 Z"
          fill="#3b2314"
        />
        <path d="M90 36 Q120 14 150 36 Z" fill="#2563eb" />
        <path d="M115 28 Q145 24 162 34 Q142 38 115 34 Z" fill="#facc15" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 220"
      className="h-full w-full"
      role="img"
      aria-label="Girl Shopper illustration"
    >
      <defs>
        <radialGradient id="girlBg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#fbcfe8" />
        </radialGradient>
      </defs>
      <rect width="240" height="220" rx="20" fill="url(#girlBg)" />
      <ellipse cx="120" cy="202" rx="64" ry="10" fill="#f9a8d4" opacity="0.55" />
      {/* Long Flowing Chestnut Back Hair Cascade */}
      <path
        d="M84 52 Q72 95 78 134 Q120 144 162 134 Q168 95 156 52 Z"
        fill="#5c2c16"
      />
      {/* Legs & Pink Sneakers */}
      <rect x="100" y="152" width="14" height="40" rx="7" fill="#7e22ce" />
      <rect x="126" y="152" width="14" height="40" rx="7" fill="#7e22ce" />
      <ellipse cx="105" cy="194" rx="13" ry="8" fill="#f43f5e" />
      <ellipse cx="135" cy="194" rx="13" ry="8" fill="#f43f5e" />
      <rect x="92" y="196" width="26" height="4" rx="2" fill="#ffffff" />
      <rect x="122" y="196" width="26" height="4" rx="2" fill="#ffffff" />
      {/* Pink Cardigan & Flared Pleated Skirt */}
      <rect x="90" y="96" width="60" height="44" rx="16" fill="#ec4899" />
      <rect x="108" y="96" width="24" height="44" fill="#fdf2f8" />
      <polygon points="82,156 158,156 146,132 94,132" fill="#f472b6" />
      <line x1="86" y1="153" x2="154" y2="153" stroke="#fdf2f8" strokeWidth="3" />
      {/* Waving Arms & Hands */}
      <path
        d="M92 106 Q74 122 78 140"
        stroke="#ec4899"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="78" cy="143" r="7.5" fill="#f4bfa0" />
      <path
        d="M148 106 Q170 88 174 68"
        stroke="#ec4899"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="175" cy="65" r="7.5" fill="#f4bfa0" />
      {/* Neck & Smiling Face */}
      <rect x="112" y="84" width="16" height="15" rx="6" fill="#e6ab8a" />
      <circle cx="88" cy="58" r="7.5" fill="#f4bfa0" />
      <circle cx="152" cy="58" r="7.5" fill="#f4bfa0" />
      <circle cx="120" cy="56" r="31" fill="#f4bfa0" />
      {/* Rosy Cheeks */}
      <ellipse cx="101" cy="63" rx="6.5" ry="3.8" fill="#fb7185" opacity="0.5" />
      <ellipse cx="139" cy="63" rx="6.5" ry="3.8" fill="#fb7185" opacity="0.5" />
      {/* Big Sapphire Eyes */}
      <circle cx="107" cy="54" r="6.2" fill="#ffffff" />
      <circle cx="133" cy="54" r="6.2" fill="#ffffff" />
      <circle cx="108" cy="54" r="4.2" fill="#1d4ed8" />
      <circle cx="134" cy="54" r="4.2" fill="#1d4ed8" />
      <circle cx="108" cy="54" r="2.1" fill="#090d16" />
      <circle cx="134" cy="54" r="2.1" fill="#090d16" />
      <circle cx="109.5" cy="52.5" r="1.6" fill="#ffffff" />
      <circle cx="135.5" cy="52.5" r="1.6" fill="#ffffff" />
      {/* Eyebrows, Button Nose & Warm Smile */}
      <path d="M100 44 Q107 41 113 44" stroke="#5c2c16" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M127 44 Q133 41 140 44" stroke="#5c2c16" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="120" cy="60" r="2.3" fill="#dc9e7c" />
      <path
        d="M108 68 Q120 79 132 68"
        stroke="#be123c"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Side-Swept Bangs & Pink Alice Headband with Ribbon Bow */}
      <path
        d="M88 50 Q92 20 120 20 Q148 20 152 50 Q136 34 120 40 Q104 34 88 50 Z"
        fill="#5c2c16"
      />
      <path
        d="M91 42 Q120 18 149 42"
        stroke="#f43f5e"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Side Ribbon Bow */}
      <polygon points="144,30 156,24 154,36" fill="#f43f5e" />
      <polygon points="144,30 134,22 135,34" fill="#f43f5e" />
      <circle cx="144" cy="30" r="3.5" fill="#fb7185" />
    </svg>
  );
}

export default function ToyShopRide() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();
  const isPro = isProMembership(profile);
  const reduceMotion = Boolean(profile?.reduce_motion);

  const [shopper, setShopper] = useState<ShopperChoice | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropped, setDropped] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [landed, setLanded] = useState<TrolleyShelfItem[]>([]);
  const [purchases, setPurchases] = useState(0);
  const [banner, setBanner] = useState(
    "You start with 10 Coins! Tap a toy, then tap gold coins to drop them into the Saving Bank!",
  );
  const travelRef = useRef(0);
  const targetZRef = useRef<number | null>(null);
  const [currentRow, setCurrentRow] = useState(0);
  const [activeJunction, setActiveJunction] = useState<number | null>(null);
  const [pathChoices, setPathChoices] = useState<Record<number, MartPathChoice>>({});
  const [showPaywall, setShowPaywall] = useState(false);

  // Left-side Coin Wallet Drawer & Low-Balance Prompt Dialog
  const [leftWalletOpen, setLeftWalletOpen] = useState(false);
  const [lowBalancePromptToy, setLowBalancePromptToy] = useState<ShopToy | null>(null);
  const [buyingPackId, setBuyingPackId] = useState<string | null>(null);
  const [bankPulse, setBankPulse] = useState(0);

  // Kid's live Coin Budget (starts at 10 coins) and live Star Balance (synced with Navbar)
  const [walletCoins, setWalletCoins] = useState<number>(INITIAL_COIN_BUDGET);
  const [currentStars, setCurrentStars] = useState<number>(0);

  const walletCoinsRef = useRef<number>(INITIAL_COIN_BUDGET);
  const starsRef = useRef<number>(0);
  const droppedRef = useRef<number>(0);
  const ownedRef = useRef<string[]>([]);
  const bankZone = useRef<HTMLDivElement>(null);
  const buyingRef = useRef(false);

  const selected = SHOP_TOYS.find((toy) => toy.id === selectedId) ?? null;
  const collectedIds = useMemo(() => new Set(owned), [owned]);
  const currentDept =
    MART_DEPARTMENTS[
      Math.min(MART_DEPARTMENTS.length - 1, Math.floor(currentRow / CROSSROADS_INTERVAL))
    ];

  const activeChildId = activeChild?.id ?? "guest-local";
  const activeChildStars = activeChild?.stars;

  useEffect(() => {
    walletCoinsRef.current = walletCoins;
  }, [walletCoins]);

  useEffect(() => {
    droppedRef.current = dropped;
  }, [dropped]);

  useEffect(() => {
    const stop = () => {
      travelRef.current = 0;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  // Initialize Coin Wallet (10 starter coins) and ensure the child has starter Stars to buy Coin Packs
  useEffect(() => {
    const initialCoins = readCoinWallet(activeChildId);
    walletCoinsRef.current = initialCoins;
    setWalletCoins(initialCoins);

    let liveStars = activeChildStars ?? readGuestProgress().stars ?? 0;

    // Seed starter stars once in guest mode if the child has 0 stars so they can buy Coin Packs right away
    if (typeof window !== "undefined" && (!user || isGuestChild(activeChildId))) {
      try {
        const seeded = window.localStorage.getItem(STARTER_STARS_SEED_KEY);
        if (!seeded && liveStars < STARTER_STARS_AMOUNT) {
          window.localStorage.setItem(STARTER_STARS_SEED_KEY, "1");
          liveStars = STARTER_STARS_AMOUNT;
          const prev = readGuestProgress();
          const nextGuest: GuestProgressState = {
            ...prev,
            stars: liveStars,
          };
          window.localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(nextGuest));
          window.dispatchEvent(
            new CustomEvent<GuestProgressState>(GUEST_PROGRESS_UPDATED_EVENT, {
              detail: nextGuest,
            }),
          );
        }
      } catch {
        // ignore storage errors
      }
    }

    starsRef.current = liveStars;
    setCurrentStars(liveStars);
  }, [activeChildId, activeChildStars, user]);

  // Start each shopping visit with an empty trolley and 100% full shelves
  useEffect(() => {
    ownedRef.current = [];
    setOwned([]);
    setLanded([]);
  }, [activeChildId]);

  useEffect(() => {
    if (!shopper) return;
    const timer = window.setTimeout(() => {
      speak(
        `${shopper === "boy" ? "Boy" : "Girl"} is ready in the 30-row Mega Mart with ${walletCoinsRef.current} coins! Hold Walk Forward to push the trolley.`,
        0.92,
      );
    }, 400);
    return () => window.clearTimeout(timer);
  }, [shopper, speak]);

  /**
   * Persist updated star count and unlocked toys to Guest localStorage OR Supabase `children`,
   * and trigger an immediate update in `ActiveChildProvider` so the Navbar star count updates right away.
   */
  const syncChildStarsAndToys = useCallback(
    async (nextStars: number, nextUnlockedToys?: string[]) => {
      const safeStars = Math.max(0, Math.floor(nextStars));
      starsRef.current = safeStars;
      setCurrentStars(safeStars);

      // Always update local guest progress and dispatch event so Header navbar updates immediately
      if (typeof window !== "undefined") {
        try {
          const prev = readGuestProgress();
          const mergedToys = nextUnlockedToys
            ? Array.from(new Set([...prev.unlockedToys, ...nextUnlockedToys]))
            : prev.unlockedToys;
          const nextGuest: GuestProgressState = {
            ...prev,
            stars: safeStars,
            unlockedToys: mergedToys,
          };
          window.localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(nextGuest));
          window.dispatchEvent(
            new CustomEvent<GuestProgressState>(GUEST_PROGRESS_UPDATED_EVENT, {
              detail: nextGuest,
            }),
          );
        } catch {
          // ignore storage errors
        }
      }

      if (user && activeChild && !isGuestChild(activeChild.id)) {
        try {
          const supabase = createClient();
          const payload: { stars: number; unlocked_toys?: string[] } = { stars: safeStars };
          if (nextUnlockedToys) {
            payload.unlocked_toys = nextUnlockedToys;
          }
          await supabase.from("children").update(payload).eq("id", activeChild.id);
          await refreshChildren();
          await refreshProfile();
        } catch {
          // offline fallback
        }
      }
    },
    [activeChild, refreshChildren, refreshProfile, user],
  );

  /**
   * Trigger the exact Low/Empty Coin Balance prompt & voice message requested by the user.
   */
  const triggerLowBalancePrompt = useCallback(
    (toy: ShopToy | null) => {
      playBoop();
      setLowBalancePromptToy(toy);
      setLeftWalletOpen(true);
      setBanner(LOW_BALANCE_MESSAGE);
      speak(LOW_BALANCE_MESSAGE, 0.92);
    },
    [speak],
  );

  /**
   * Buy a Coin Pack from the Left-Side Coin Wallet using the child's Stars:
   * - 3 coins = 10 stars
   * - 10 coins = 25 stars
   * - 20 coins = 45 stars
   * - 50 coins = 87 stars
   * Deducts exact stars from the child's star board & navbar, and adds exact coins to their Coin Wallet.
   */
  const handleBuyCoinPack = useCallback(
    async (pack: CoinPack) => {
      if (buyingPackId) return;
      const availableStars = starsRef.current;
      if (availableStars < pack.starsCost) {
        playBoop();
        const msg = `You need ${pack.starsCost} stars for +${pack.coins} coins, and you have ${availableStars} stars! Tap +50 Bonus Stars below or play games to earn more stars!`;
        setBanner(msg);
        speak(msg, 0.92);
        return;
      }

      setBuyingPackId(pack.id);
      try {
        const nextStars = Math.max(0, availableStars - pack.starsCost);
        const nextCoins = writeCoinWallet(activeChildId, walletCoinsRef.current + pack.coins);

        walletCoinsRef.current = nextCoins;
        setWalletCoins(nextCoins);
        setLowBalancePromptToy(null);
        setBankPulse((p) => p + 1);
        playDing();
        burstConfetti();

        await syncChildStarsAndToys(nextStars);

        const msg = `Added +${pack.coins} Coins to your Coin Wallet! (${pack.starsCost} Stars removed · Wallet: ${nextCoins} Coins · Stars: ${nextStars} ⭐️)`;
        setBanner(msg);
        speak(
          `You bought ${pack.coins} coins for ${pack.starsCost} stars! You now have ${nextCoins} coins.`,
          0.94,
        );
      } finally {
        setBuyingPackId(null);
      }
    },
    [activeChildId, buyingPackId, speak, syncChildStarsAndToys],
  );

  const handleEarnBonusStars = useCallback(async () => {
    const nextStars = starsRef.current + 50;
    playDing();
    await syncChildStarsAndToys(nextStars);
    const msg = `Added +50 Stars! You now have ${nextStars} Stars in your Star Board and Navbar.`;
    setBanner(msg);
    speak(`Plus 50 stars! You now have ${nextStars} stars.`, 0.94);
  }, [speak, syncChildStarsAndToys]);

  const choosePathAtJunction = useCallback(
    (junctionIndex: number, choice: MartPathChoice) => {
      setPathChoices((prev) => ({ ...prev, [junctionIndex]: choice }));
      playDing();
      const nextFirstRow = (junctionIndex + 1) * CROSSROADS_INTERVAL;
      const nextDept =
        MART_DEPARTMENTS[Math.min(MART_DEPARTMENTS.length - 1, junctionIndex + 1)];
      targetZRef.current = rowZ(nextFirstRow) + 1.1;
      const label = choice === "left" ? "Left Path" : "Right Path";
      setBanner(`Turning onto the ${label} into ${nextDept.title}!`);
      speak(`Turning ${choice} into ${nextDept.title}!`, 0.94);
    },
    [speak],
  );

  // Keyboard navigation support
  useEffect(() => {
    if (!shopper) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        travelRef.current = -1;
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        travelRef.current = 1;
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        const jIdx = activeJunction ?? Math.floor(currentRow / CROSSROADS_INTERVAL);
        choosePathAtJunction(jIdx, "left");
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        const jIdx = activeJunction ?? Math.floor(currentRow / CROSSROADS_INTERVAL);
        choosePathAtJunction(jIdx, "right");
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === "W" ||
        e.key === "ArrowDown" ||
        e.key === "s" ||
        e.key === "S"
      ) {
        travelRef.current = 0;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [shopper, activeJunction, currentRow, choosePathAtJunction]);

  const sayPaywall = useCallback(() => {
    playBoop();
    setShowPaywall(true);
    setBanner("Buy the paid plan to do more shopping.");
    speak("Buy the paid plan to do more shopping.", 0.92);
  }, [speak]);

  const lastSelectTapRef = useRef<{ id: string; time: number }>({ id: "", time: 0 });

  const selectToy = useCallback(
    (toy: ShopToy) => {
      // Prevent duplicate pointer/click events within 350ms from cancelling and cutting off TTS speech
      const now = performance.now();
      if (
        lastSelectTapRef.current.id === toy.id &&
        now - lastSelectTapRef.current.time < 350
      ) {
        return;
      }
      lastSelectTapRef.current = { id: toy.id, time: now };

      const coinsWord = toy.price === 1 ? "coin" : "coins";
      if (ownedRef.current.includes(toy.id)) {
        playBoop();
        const ownedLine = `${toy.name} is ${toy.price} ${coinsWord}, and it is already in your trolley!`;
        setBanner(ownedLine);
        speak(ownedLine, 0.92);
        return;
      }
      if (!isPro && purchases >= FREE_MAX_COIN_PURCHASES) {
        sayPaywall();
        return;
      }

      // Refund any partially dropped coins from a previous unfinished toy first
      let availableCoins = walletCoinsRef.current;
      if (!buyingRef.current && droppedRef.current > 0 && selectedId && selectedId !== toy.id) {
        availableCoins = writeCoinWallet(activeChildId, availableCoins + droppedRef.current);
        walletCoinsRef.current = availableCoins;
        setWalletCoins(availableCoins);
        droppedRef.current = 0;
        setDropped(0);
      }

      // Check if the child has enough coins in their Coin Wallet to buy this toy
      const alreadyDroppedForThisToy = selectedId === toy.id ? droppedRef.current : 0;
      if (availableCoins + alreadyDroppedForThisToy < toy.price) {
        setSelectedId(toy.id);
        triggerLowBalancePrompt(toy);
        return;
      }

      setLowBalancePromptToy(null);
      setShowPaywall(false);
      setSelectedId(toy.id);
      if (selectedId !== toy.id) {
        setDropped(0);
        droppedRef.current = 0;
      }
      buyingRef.current = false;
      const line = coinPrompt(toy);
      setBanner(line);
      speak(line, 0.92);
    },
    [activeChildId, isPro, purchases, sayPaywall, selectedId, speak, triggerLowBalancePrompt],
  );

  const finishPurchase = useCallback(
    async (toy: ShopToy, remainingCoins: number) => {
      if (buyingRef.current) return;
      buyingRef.current = true;
      setPurchases((count) => count + 1);
      setOwned((prev) => {
        const next = prev.includes(toy.id) ? prev : [...prev, toy.id];
        ownedRef.current = next;
        return next;
      });
      droppedRef.current = 0;
      setBanner(
        `Purchased! The ${toy.name} is in your trolley! You have ${remainingCoins} ${
          remainingCoins === 1 ? "coin" : "coins"
        } left in your Coin Wallet.`,
      );
      playDing();
      starShower();
      burstConfetti();
      speak(
        `Awesome! The ${toy.name} is yours! You have ${remainingCoins} ${
          remainingCoins === 1 ? "coin" : "coins"
        } left.`,
        0.92,
      );

      // Reset selection after a short celebration so the Saving Bank is ready for the next toy
      window.setTimeout(() => {
        setSelectedId((cur) => (cur === toy.id ? null : cur));
        setDropped(0);
        droppedRef.current = 0;
        buyingRef.current = false;
      }, 750);

      const unlocked = ownedRef.current;
      await syncChildStarsAndToys(starsRef.current, unlocked);

      if (user && activeChild && !isGuestChild(activeChild.id)) {
        void logProgress({
          user_id: user.id,
          child_id: activeChild.id,
          feature_route: "/games/coin-shop",
          attempt_type: "tap",
          target_word: `${toy.id}|wallet_coins:${remainingCoins}|unlocked:${unlocked.join(",")}`,
          is_correct: true,
        });
      }
    },
    [activeChild, speak, syncChildStarsAndToys, user],
  );

  const dropSingleCoin = useCallback(() => {
    if (!selected) {
      playBoop();
      setBanner("Tap a toy on the shelf first, then tap a gold coin!");
      speak("Tap a toy on the shelf first.", 0.92);
      return;
    }
    if (buyingRef.current || droppedRef.current >= selected.price) return;

    const currentWallet = walletCoinsRef.current;
    const neededRemaining = selected.price - droppedRef.current;
    if (currentWallet <= 0 || currentWallet < 1) {
      triggerLowBalancePrompt(selected);
      return;
    }

    const nextWallet = writeCoinWallet(activeChildId, currentWallet - 1);
    walletCoinsRef.current = nextWallet;
    setWalletCoins(nextWallet);

    const nextDropped = droppedRef.current + 1;
    droppedRef.current = nextDropped;
    setDropped(nextDropped);
    setBankPulse((pulse) => pulse + 1);
    playClink();
    speak(String(nextDropped), 0.9);

    if (nextDropped >= selected.price) {
      void finishPurchase(selected, nextWallet);
    } else if (nextWallet <= 0 && neededRemaining - 1 > 0) {
      // Just spent their last coin and still need more coins for this toy!
      window.setTimeout(() => {
        triggerLowBalancePrompt(selected);
      }, 450);
    }
  }, [activeChildId, finishPurchase, selected, speak, triggerLowBalancePrompt]);

  if (!shopper) {
    return (
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-amber-50 via-white to-sky-50 p-6 shadow-2xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-800">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            3D Mega Mart · 30 Rows · 60 Unique Toys · 10 Starter Coins
          </span>
          <h2 className="mt-2 text-center text-2xl font-black text-slate-800 sm:text-3xl">
            Coin Toy Mega Mart
          </h2>
          <p className="mt-1.5 text-center text-sm font-semibold text-slate-600">
            Who is pushing the shopping trolley today? Tap your 3D shopper!
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {(
            [
              {
                id: "boy" as const,
                label: "Boy Shopper",
                detail: "3D Varsity Jacket, Cap & Sneakers",
                border: "border-sky-200 hover:border-sky-400",
                bg: "from-sky-100/80 via-white to-blue-50",
                badge: "bg-sky-600 text-white",
              },
              {
                id: "girl" as const,
                label: "Girl Shopper",
                detail: "3D Pink Cardigan, Flowing Hair & Headband",
                border: "border-pink-200 hover:border-pink-400",
                bg: "from-pink-100/80 via-white to-rose-50",
                badge: "bg-pink-600 text-white",
              },
            ]
          ).map((choice) => (
            <div
              key={choice.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setShopper(choice.id);
                playDing();
                speak(`${choice.label} is shopping in the Mega Mart.`, 0.95);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShopper(choice.id);
                  playDing();
                  speak(`${choice.label} is shopping in the Mega Mart.`, 0.95);
                }
              }}
              className={`group cursor-pointer rounded-3xl border-4 ${choice.border} bg-gradient-to-b ${choice.bg} p-4 text-left shadow-xl transition hover:scale-[1.015]`}
            >
              <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-white/70 to-slate-100/80">
                <ShopperPortraitImage shopper={choice.id} />
                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black shadow ${choice.badge}`}
                >
                  Tap to Start 🛒
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="block text-xl font-black text-slate-800">{choice.label}</span>
                  <span className="block text-xs font-semibold text-slate-500">
                    {choice.detail}
                  </span>
                </div>
                <span className="rounded-2xl bg-amber-400 px-4 py-2 text-sm font-black text-amber-950 shadow">
                  Start Mart
                </span>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => router.push("/games")}
          className="mt-6 w-full rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
        >
          Back to Games
        </button>
      </div>
    );
  }

  const activeOrUpcomingJunction =
    activeJunction ?? Math.min(6, Math.floor(currentRow / CROSSROADS_INTERVAL));
  // Number of visible clickable gold coin buttons in the bottom-right tray (reflects actual walletCoins!)
  const visibleTrayCoins = Math.min(10, Math.max(0, walletCoins));

  return (
    <div className="overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl">
      {/* Top Mart Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/95 px-4 py-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-extrabold text-slate-800">Coin Toy Mega Mart</p>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-black text-white"
              style={{ backgroundColor: currentDept.color }}
            >
              Row {currentRow + 1} / {SHOP_ROWS} · {currentDept.title}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-extrabold">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-950">
              <Coins className="h-3.5 w-3.5 text-amber-600" aria-hidden />
              Coin Wallet: {walletCoins} {walletCoins === 1 ? "Coin" : "Coins"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-amber-800">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
              Star Board: {currentStars} ⭐️
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Department / Row Jump Selector so kids can explore all 30 rows easily */}
          <select
            aria-label="Jump to Mart Row"
            value={currentRow}
            onChange={(e) => {
              const r = Number(e.target.value);
              targetZRef.current = rowZ(r) + 1.3;
              setCurrentRow(r);
            }}
            className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-extrabold text-amber-950"
          >
            {Array.from({ length: SHOP_ROWS }, (_, r) => {
              const t1 = SHOP_TOYS[r * 4];
              const t2 = SHOP_TOYS[r * 4 + 1];
              return (
                <option key={r} value={r}>
                  Row {r + 1}: {t1?.name} & {t2?.name}
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={() => {
              if (selected) speak(coinPrompt(selected), 0.92);
              else speak("Tap a toy on any of the 30 shelf rows first.", 0.92);
            }}
            className="inline-flex items-center gap-1 rounded-2xl bg-sky-50 px-3 py-2 text-xs font-extrabold text-sky-800"
          >
            <Volume2 className="h-4 w-4" aria-hidden />
            Hear Prompt
          </button>
          <button
            type="button"
            onClick={() => setShopper(null)}
            className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-extrabold text-sky-800"
          >
            {shopper === "boy" ? "Boy" : "Girl"} · Switch 3D Kid
          </button>
          <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-900">
            {isPro ? "Toys unlocked" : `${purchases} / ${FREE_MAX_COIN_PURCHASES} toys`}
          </p>
        </div>
      </div>

      {/* Prompt & Selected Toy Coin Banner */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-center text-sm font-extrabold text-amber-950">
        <span>
          {selected
            ? `${selected.name} (Row ${selected.section + 1}) costs ${selected.price} ${
                selected.price === 1 ? "coin" : "coins"
              } · Dropped: ${dropped} / ${selected.price} · Left in Wallet: ${walletCoins} 🪙`
            : banner}
        </span>
        {selected && (
          <span className="inline-flex items-center gap-1" aria-label={`${selected.price} coins`}>
            {Array.from({ length: selected.price }, (_, index) => (
              <span
                key={index}
                className={`inline-block h-5 w-5 rounded-full border-2 ${
                  index < dropped
                    ? "border-emerald-700 bg-emerald-400"
                    : "border-amber-700 bg-amber-300"
                }`}
              />
            ))}
          </span>
        )}
      </div>

      {/* 3D Supermarket Viewport */}
      <div className="relative h-[62svh] min-h-[380px] w-full md:h-[68vh] md:min-h-[500px] xl:h-[72vh] xl:min-h-[560px]">
        <ToyShopWorld
          toys={SHOP_TOYS}
          collectedIds={collectedIds}
          selectedId={selectedId}
          landedItems={landed}
          bankPulse={bankPulse}
          reduceMotion={reduceMotion}
          travelRef={travelRef}
          targetZRef={targetZRef}
          pathChoices={pathChoices}
          activeJunction={activeJunction}
          shopper={shopper}
          onSelect={selectToy}
          onLanded={(toy) => setLanded((prev) => [...prev, toyAsShelfItem(toy)])}
          onCurrentRowChange={(rowIdx) => setCurrentRow(rowIdx)}
          onActiveJunctionChange={(jIdx) => {
            setActiveJunction(jIdx);
          }}
          onChoosePath={choosePathAtJunction}
        />

        {/* Optional Crossroads Floating Banner whenever the trolley is near a 4-row junction */}
        {activeJunction !== null && !lowBalancePromptToy && (
          <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-center">
            <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-3xl border-4 border-amber-400 bg-slate-900/90 px-5 py-2.5 text-center text-white shadow-2xl backdrop-blur-md sm:flex-row sm:gap-4">
              <div className="text-left">
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  Optional Crossroads #{activeJunction + 1} (Row{" "}
                  {(activeJunction + 1) * CROSSROADS_INTERVAL})
                </p>
                <p className="text-xs font-extrabold">
                  Keep walking straight forward, or turn Left / Right!
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => choosePathAtJunction(activeJunction, "left")}
                  className="inline-flex items-center gap-1 rounded-2xl border-b-4 border-sky-800 bg-sky-500 px-3.5 py-2 text-xs font-black text-white shadow-lg active:translate-y-0.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Left Path
                </button>
                <button
                  type="button"
                  onClick={() => choosePathAtJunction(activeJunction, "right")}
                  className="inline-flex items-center gap-1 rounded-2xl border-b-4 border-emerald-800 bg-emerald-500 px-3.5 py-2 text-xs font-black text-white shadow-lg active:translate-y-0.5"
                >
                  Right Path
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Direct Low/Empty Coin Balance Prompt Dialog */}
        {lowBalancePromptToy && (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
            <div className="pointer-events-auto max-w-lg rounded-3xl border-4 border-rose-400 bg-white/98 p-4 text-center shadow-2xl">
              <p className="text-xs font-black uppercase tracking-wider text-rose-600">
                Not Enough Coins in Wallet ({walletCoins} 🪙)
              </p>
              <p className="mt-1 text-base font-black text-slate-800">
                You do not have enough balance to buy{" "}
                <span className="text-amber-700">
                  {lowBalancePromptToy.name} ({lowBalancePromptToy.price} Coins)
                </span>
                !
              </p>
              <p className="mt-1 text-xs font-bold text-slate-600">
                Do you want to buy some coins? You can buy from the left side from Coin Wallet!
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLeftWalletOpen(true);
                    speak("Choose a coin pack from your left side Coin Wallet!", 0.94);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-2xl border-b-4 border-amber-600 bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-2 text-xs font-black text-amber-950 shadow"
                >
                  <Wallet className="h-4 w-4" aria-hidden />
                  Buy from Left Coin Wallet
                </button>
                {COIN_PACKS.slice(0, 2).map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => void handleBuyCoinPack(pack)}
                    className="inline-flex items-center gap-1 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-3.5 py-2 text-xs font-black text-white shadow"
                  >
                    +{pack.coins} Coins ({pack.starsCost} ⭐️)
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setLowBalancePromptToy(null)}
                  className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom HUD: Left Side = Coin Wallet & Saving Bank | Right Side = Live Gold Coins Tray */}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-end justify-between gap-2 md:inset-x-6">
          {/* LEFT SIDE: Coin Wallet & Saving Bank with Direct Coin Pack Buying */}
          <div
            ref={bankZone}
            className="pointer-events-auto flex max-w-[340px] flex-col gap-2 rounded-3xl border-2 border-amber-300 bg-white/95 p-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-rose-600">
                  <Wallet className="h-3.5 w-3.5" aria-hidden />
                  Left Coin Wallet & Bank
                </p>
                <p className="text-lg font-black text-slate-800">
                  {walletCoins} {walletCoins === 1 ? "Coin" : "Coins"} 🪙
                </p>
                <p className="text-xs font-extrabold text-amber-700">
                  {selected
                    ? `Saving Bank: ${dropped} / ${selected.price} for ${selected.name}`
                    : `Your Stars: ${currentStars} ⭐️`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeftWalletOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-2xl border-b-4 border-amber-600 bg-gradient-to-b from-yellow-300 to-amber-400 px-3 py-2 text-xs font-black text-amber-950 shadow active:translate-y-0.5"
              >
                <PlusCircle className="h-4 w-4" aria-hidden />
                {leftWalletOpen ? "Hide Packs" : "Buy Coins"}
              </button>
            </div>

            {/* Direct Coin Packs inside the Left-Side Coin Wallet */}
            {leftWalletOpen && (
              <div className="mt-1 rounded-2xl border-2 border-amber-200 bg-amber-50/90 p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-900">
                    Buy Coins with Stars ({currentStars} ⭐️)
                  </span>
                  <button
                    type="button"
                    onClick={() => setLeftWalletOpen(false)}
                    className="rounded-lg bg-white p-1 text-slate-500"
                    aria-label="Close Coin Wallet Packs"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {COIN_PACKS.map((pack) => {
                    const canAfford = currentStars >= pack.starsCost;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        disabled={buyingPackId !== null}
                        onClick={() => void handleBuyCoinPack(pack)}
                        className={`flex flex-col items-center rounded-xl border-2 px-2 py-1.5 text-center transition ${
                          canAfford
                            ? "border-amber-400 bg-white hover:border-amber-600 active:scale-95"
                            : "border-slate-200 bg-slate-100 opacity-70"
                        }`}
                      >
                        <span className="text-xs font-black text-slate-800">
                          +{pack.coins} Coins 🪙
                        </span>
                        <span className="text-[11px] font-extrabold text-amber-700">
                          {pack.starsCost} Stars ⭐️
                        </span>
                      </button>
                    );
                  })}
                </div>
                {currentStars < 10 && (
                  <button
                    type="button"
                    onClick={() => void handleEarnBonusStars()}
                    className="mt-2 w-full rounded-xl bg-indigo-600 py-1.5 text-[11px] font-black text-white shadow"
                  >
                    +50 Bonus Practice Stars ⭐️
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Interactive Gold Coins Tray (shows actual walletCoins available to tap!) */}
          <div className="pointer-events-auto flex max-w-[62%] flex-col items-end gap-1.5 rounded-3xl bg-white/95 p-2.5 shadow-xl">
            <div className="flex w-full items-center justify-between gap-2 px-1">
              <span className="text-[11px] font-black uppercase tracking-wide text-amber-800">
                Tap a Gold Coin to Drop ({walletCoins} left)
              </span>
              {walletCoins > 10 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-900">
                  +{walletCoins - 10} more in wallet
                </span>
              )}
            </div>
            {visibleTrayCoins > 0 ? (
              <div className="flex flex-wrap justify-end gap-1.5">
                {Array.from({ length: visibleTrayCoins }, (_, idx) => (
                  <button
                    key={`wallet-coin-${idx}`}
                    type="button"
                    aria-label="Tap to drop 1 gold coin into the Saving Bank"
                    onClick={() => dropSingleCoin()}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-b-4 border-amber-600 bg-gradient-to-b from-yellow-200 to-amber-400 text-sm font-black text-amber-950 shadow transition hover:scale-105 active:translate-y-0.5"
                  >
                    <Coins className="h-5 w-5" aria-hidden />
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLeftWalletOpen(true);
                  triggerLowBalancePrompt(selected);
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl border-b-4 border-rose-700 bg-rose-500 px-4 py-2.5 text-xs font-black text-white shadow"
              >
                <PlusCircle className="h-4 w-4" aria-hidden />
                0 Coins Left · Buy from Left Coin Wallet
              </button>
            )}
          </div>
        </div>

        {showPaywall && (
          <div className="pointer-events-none absolute inset-x-3 top-20 flex justify-center">
            <div className="pointer-events-auto flex max-w-xl flex-col items-center gap-2 rounded-3xl bg-white/95 px-4 py-3 text-center shadow-xl sm:flex-row">
              <p className="text-sm font-extrabold text-slate-800">
                Buy the paid plan to do more shopping.
              </p>
              <Link
                href="/upgrade"
                className="rounded-2xl bg-amber-400 px-4 py-2 text-sm font-black text-amber-950"
              >
                See the plan
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Trolley Steering & Walking Controls */}
      <div className="flex flex-col items-stretch justify-between gap-3 bg-white px-3 py-3 md:flex-row md:items-center md:px-6">
        <button
          type="button"
          onClick={() => router.push("/games")}
          className="inline-flex items-center gap-1 rounded-2xl px-3 py-3 text-sm font-extrabold text-slate-600"
        >
          <Home className="h-4 w-4" aria-hidden />
          Games
        </button>

        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 md:flex md:w-auto">
          <button
            type="button"
            onClick={() => choosePathAtJunction(activeOrUpcomingJunction, "left")}
            className="inline-flex items-center justify-center gap-1 rounded-3xl border-b-8 border-indigo-800 bg-indigo-500 px-4 py-3.5 text-sm font-black text-white active:translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Left Path
          </button>
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
            className="inline-flex items-center justify-center rounded-3xl border-b-8 border-sky-800 bg-sky-500 px-4 py-3.5 text-base font-black text-white"
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
            className="inline-flex items-center justify-center rounded-3xl border-b-8 border-emerald-800 bg-emerald-500 px-5 py-3.5 text-base font-black text-white"
          >
            Walk Forward
          </button>
          <button
            type="button"
            onClick={() => choosePathAtJunction(activeOrUpcomingJunction, "right")}
            className="inline-flex items-center justify-center gap-1 rounded-3xl border-b-8 border-amber-700 bg-amber-500 px-4 py-3.5 text-sm font-black text-white active:translate-y-0.5"
          >
            Right Path
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <p className="text-center text-xs font-bold text-slate-500 md:max-w-[15rem] md:text-right">
          Row {currentRow + 1} of {SHOP_ROWS} · Walk straight anytime or optionally turn Left / Right.
        </p>
      </div>
    </div>
  );
}
