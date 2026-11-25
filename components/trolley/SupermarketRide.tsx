"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Lock, RotateCcw, Star, Trophy, Volume2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { createClient } from "@/utils/supabase/client";
import {
  AISLE_SPAN,
  buildShelfRow,
  TARGETS_PER_ROW,
  type ShopperChoice,
  type TrolleyShelfItem,
} from "@/utils/trolleyCatalog";
import { burstConfetti, playBoop, playDing } from "@/utils/celebrate";
import { triggerHaptic } from "@/utils/haptics";
import { handleGuestAward } from "@/utils/awardProgress";
import { logProgress } from "@/utils/logProgress";

const AisleWorld = dynamic(() => import("@/components/trolley/AisleWorld"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-900 text-lg font-extrabold text-white">
      Building the aisle…
    </div>
  ),
});

export const STARS_PER_TROLLEY_ROW = 5;
const TROLLEY_TROPHY = "supermarket-trolley-star";

type SupermarketRideProps = {
  letters: string[];
  shopper: ShopperChoice;
  onChangeLetters: () => void;
};

export default function SupermarketRide({
  letters,
  shopper,
  onChangeLetters,
}: SupermarketRideProps) {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();

  const [rowIndex, setRowIndex] = useState(0);
  const [rideSeed, setRideSeed] = useState(1);
  const [collectedByLetter, setCollectedByLetter] = useState<
    Record<string, TrolleyShelfItem[]>
  >({});
  const [landedItems, setLandedItems] = useState<TrolleyShelfItem[]>([]);
  const [cartBounceKey, setCartBounceKey] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [rideFinished, setRideFinished] = useState(false);

  const rewardedRowsRef = useRef<Set<string>>(new Set());
  const collectedRef = useRef(collectedByLetter);
  collectedRef.current = collectedByLetter;
  const travelRef = useRef(0);
  const gateZRef = useRef(-6.15);
  const rowIndexRef = useRef(0);
  rowIndexRef.current = rowIndex;

  const currentLetter = letters[rowIndex] ?? letters[0] ?? "A";
  const openIndex = letters.findIndex(
    (letter) => (collectedByLetter[letter]?.length ?? 0) < TARGETS_PER_ROW,
  );
  const reduceMotion = Boolean(profile?.reduce_motion);
  const itemsBySection = useMemo(
    () => letters.map((letter, index) => buildShelfRow(letter, `${rideSeed}-${index}`)),
    [letters, rideSeed],
  );
  const collectedForCurrent = collectedByLetter[currentLetter] ?? [];
  const collectedIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(collectedByLetter).forEach((list) => {
      list.forEach((item) => ids.add(item.id));
    });
    return ids;
  }, [collectedByLetter]);
  const targetCount = collectedForCurrent.length;
  const rowUnlocked = targetCount >= TARGETS_PER_ROW;

  useEffect(() => {
    if (openIndex === -1) gateZRef.current = -AISLE_SPAN * letters.length - 1.2;
    else gateZRef.current = -AISLE_SPAN * openIndex - 5.35;
  }, [letters.length, openIndex]);

  const announceRow = useCallback(
    (letter: string) => {
      speak(
        `Walk the trolley. Find 5 groceries starting with letter ${letter}.`,
        0.92,
      );
    },
    [speak],
  );

  useEffect(() => {
    if (rideFinished) return;
    const timer = window.setTimeout(() => announceRow(currentLetter), 400);
    return () => window.clearTimeout(timer);
  }, [announceRow, currentLetter, rideFinished]);

  const awardRowStars = useCallback(
    async (letter: string, isFinalRow: boolean) => {
      const key = `${rideSeed}:${letter}`;
      if (rewardedRowsRef.current.has(key)) return;
      rewardedRowsRef.current.add(key);
      burstConfetti();
      playDing();
      if (
        handleGuestAward({
          userId: user?.id,
          childId: activeChild?.id,
          deltaStars: STARS_PER_TROLLEY_ROW,
        })
      ) {
        return;
      }
      if (!activeChild) return;
      try {
        const supabase = createClient();
        const newStars = (activeChild.stars ?? 0) + STARS_PER_TROLLEY_ROW;
        await supabase
          .from("children")
          .update({ stars: newStars })
          .eq("id", activeChild.id);
        await refreshChildren();
        await refreshProfile();
      } catch {
        // offline — stars sync on the next refresh
      }
    },
    [activeChild, profile, refreshChildren, refreshProfile, rideSeed, user],
  );

  const handlePick = useCallback(
    (item: TrolleyShelfItem) => {
      triggerHaptic(30);
      const letter = letters[rowIndexRef.current] ?? currentLetter;
      if (!item.isTarget) {
        playBoop();
        setStatusBanner(`Try again! Find ${letter}!`);
        speak(`Try again! Find ${letter}!`, 0.92);
        if (user && activeChild) {
          void logProgress({
            user_id: user.id,
            child_id: activeChild.id,
            feature_route: "/games/trolley",
            attempt_type: "tap",
            target_word: `${letter}:wrong:${item.word}`,
            is_correct: false,
          });
        }
        return;
      }

      const already = collectedRef.current[letter] ?? [];
      if (already.some((picked) => picked.id === item.id)) return;
      playDing();
      const nextList = [...already, item];
      const nextBag = { ...collectedRef.current, [letter]: nextList };
      collectedRef.current = nextBag;
      setCollectedByLetter(nextBag);
      setCartBounceKey((key) => key + 1);

      if (user && activeChild) {
        void logProgress({
          user_id: user.id,
          child_id: activeChild.id,
          feature_route: "/games/trolley",
          attempt_type: "tap",
          target_word: `${letter}:${item.word}`,
          is_correct: true,
        });
      }

      if (nextList.length >= TARGETS_PER_ROW) {
        const isLast = rowIndexRef.current >= letters.length - 1;
        setStatusBanner(
          `5 of 5 groceries! +${STARS_PER_TROLLEY_ROW} stars. Walk to the next aisle!`,
        );
        speak(
          `Awesome! ${letter} is for ${item.word}! You collected 5 groceries and earned 5 stars!`,
          0.93,
        );
        void awardRowStars(letter, isLast);
      } else {
        setStatusBanner(`Awesome! ${letter} is for ${item.word}!`);
        speak(`Awesome! ${letter} is for ${item.word}!`, 0.94);
      }
    },
    [activeChild, awardRowStars, currentLetter, letters, speak, user],
  );

  const handleLanded = useCallback((item: TrolleyShelfItem) => {
    setLandedItems((prev) =>
      prev.some((picked) => picked.id === item.id) ? prev : [...prev, item],
    );
  }, []);

  const handleBlocked = useCallback(() => {
    const letter = letters[rowIndexRef.current] ?? "A";
    const have = (collectedRef.current[letter] ?? []).length;
    if (have >= TARGETS_PER_ROW) return;
    playBoop();
    const left = TARGETS_PER_ROW - have;
    setStatusBanner(
      `Walk back and tap ${left} more ${letter} food${left === 1 ? "" : "s"}.`,
    );
    speak(`Walk back. Find ${letter}!`, 0.92);
  }, [letters, speak]);

  const handleSection = useCallback((index: number) => {
    setRowIndex((prev) => (prev === index ? prev : index));
  }, []);

  const handleFinish = useCallback(() => {
    setRideFinished(true);
    burstConfetti();
    speak("Hooray! Your supermarket trolley is full! Amazing shopping!", 0.94);
  }, [speak]);

  const restartRide = () => {
    triggerHaptic(30);
    playDing();
    rewardedRowsRef.current.clear();
    collectedRef.current = {};
    setCollectedByLetter({});
    setLandedItems([]);
    setRowIndex(0);
    setRideFinished(false);
    setStatusBanner(null);
    setRideSeed((seed) => seed + 1);
    gateZRef.current = -6.15;
  };

  if (rideFinished) {
    const total = Object.values(collectedByLetter).reduce(
      (sum, list) => sum + list.length,
      0,
    );
    return (
      <section className="mx-auto max-w-2xl space-y-5 rounded-3xl border-4 border-white bg-white/95 p-6 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600">
          <Trophy className="h-11 w-11" aria-hidden />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">Trolley is full!</h1>
        <p className="text-base font-semibold text-slate-600">
          You shopped {letters.length} {letters.length === 1 ? "aisle" : "aisles"} (
          {total} groceries) and earned{" "}
          <span className="font-black text-amber-600">
            +{letters.length * STARS_PER_TROLLEY_ROW} stars
          </span>
          .
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={restartRide}
            className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-6 py-3.5 text-base font-extrabold text-white"
          >
            <RotateCcw className="h-5 w-5" aria-hidden />
            Shop Again
          </button>
          <button
            type="button"
            onClick={onChangeLetters}
            className="rounded-3xl bg-sky-500 px-6 py-3.5 text-base font-extrabold text-white"
          >
            Change Letters
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-3xl bg-white px-5 py-3.5 text-base font-extrabold text-slate-700 shadow"
          >
            <Home className="h-5 w-5" aria-hidden />
            Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/95 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-2xl font-black text-white">
            {currentLetter}
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800">
              Aisle {rowIndex + 1} of {letters.length}
            </p>
            <p className="inline-flex items-center gap-1 text-xs font-bold text-amber-800">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
              {targetCount} / {TARGETS_PER_ROW} groceries · +{STARS_PER_TROLLEY_ROW} stars
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => announceRow(currentLetter)}
            className="inline-flex items-center gap-1 rounded-2xl bg-sky-50 px-3 py-2 text-xs font-extrabold text-sky-800"
          >
            <Volume2 className="h-4 w-4" aria-hidden />
            Hear Prompt
          </button>
          <button
            type="button"
            onClick={onChangeLetters}
            className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-700"
          >
            Change Letters
          </button>
        </div>
      </div>

      {statusBanner && (
        <p className="bg-amber-50 px-4 py-2 text-center text-sm font-extrabold text-amber-950">
          {statusBanner}
        </p>
      )}

      <div className="relative h-[68vh] min-h-[420px] w-full">
        <AisleWorld
          letters={letters}
          itemsBySection={itemsBySection}
          collectedIds={collectedIds}
          landedItems={landedItems}
          cartBounceKey={cartBounceKey}
          shopper={shopper}
          travelRef={travelRef}
          gateZRef={gateZRef}
          reduceMotion={reduceMotion}
          onPick={handlePick}
          onLanded={handleLanded}
          onSection={handleSection}
          onBlocked={handleBlocked}
          onFinish={handleFinish}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1 rounded-2xl px-3 py-3 text-sm font-extrabold text-slate-600"
        >
          <Home className="h-4 w-4" aria-hidden />
          Home
        </button>
        <div className="flex flex-wrap items-center justify-center gap-2">
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
            className="inline-flex items-center justify-center rounded-3xl border-b-8 border-sky-800 bg-sky-500 px-5 py-4 text-base font-black text-white"
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
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-3xl border-b-8 border-emerald-800 bg-emerald-500 px-6 py-4 text-lg font-black text-white"
          >
            {rowUnlocked ? (
              "Walk Forward"
            ) : (
              <>
                <Lock className="h-5 w-5" aria-hidden />
                Walk · {targetCount}/{TARGETS_PER_ROW}
              </>
            )}
          </button>
        </div>
        <p className="max-w-[12rem] text-right text-xs font-bold text-slate-500">
          Hold Walk Back to return to foods you passed.
        </p>
      </div>
    </div>
  );
}
