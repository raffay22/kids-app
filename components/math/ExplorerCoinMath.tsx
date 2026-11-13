"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import MathFruitTile from "@/components/math/MathFruitTile";
import MathGoldCoin, {
  type PointerPoint,
} from "@/components/math/MathGoldCoin";
import NumberCard from "@/components/math/NumberCard";
import { playClink, playBankSave } from "@/utils/celebrate";
import {
  MATH_FRUITS,
  type ExplorerPuzzle,
} from "@/utils/mathLab";

type ExplorerCoinMathProps = {
  puzzle: ExplorerPuzzle;
  locked: boolean;
  onSolve: (choice: number) => void;
  onMiss: (coach?: string) => void;
  onCoachSpeak?: (line: string) => void;
};

function hitsTarget(
  point: PointerPoint,
  el: HTMLElement | null,
  pad = 28,
): boolean {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const insideRect =
    point.x >= rect.left - pad &&
    point.x <= rect.right + pad &&
    point.y >= rect.top - pad &&
    point.y <= rect.bottom + pad;
  if (insideRect) return true;
  const under = document.elementFromPoint(point.x, point.y);
  return Boolean(under && el.contains(under));
}

export default function ExplorerCoinMath({
  puzzle,
  locked,
  onSolve,
  onMiss,
  onCoachSpeak,
}: ExplorerCoinMathProps) {
  const [celebrateChoice, setCelebrateChoice] = useState<number | null>(null);
  const [wiggleChoice, setWiggleChoice] = useState<number | null>(null);
  const [jarCount, setJarCount] = useState(0);
  const [spentIds, setSpentIds] = useState<string[]>([]);
  const [bankedIds, setBankedIds] = useState<string[]>([]);
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [subReady, setSubReady] = useState(false);
  const jarRef = useRef<HTMLDivElement | null>(null);
  const savingBoxRef = useRef<HTMLDivElement | null>(null);
  const bankedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    setCelebrateChoice(null);
    setWiggleChoice(null);
    setJarCount(0);
    setSpentIds([]);
    setBankedIds([]);
    bankedIdsRef.current = [];
    setSelectedCoinId(null);
    setSubReady(false);
  }, [puzzle.id]);

  const additionCoins = useMemo(() => {
    if (puzzle.kind !== "addition") return [];
    return Array.from({ length: puzzle.left + puzzle.right }, (_, i) => `add-${i}`);
  }, [puzzle]);

  const subtractionCoins = useMemo(() => {
    if (puzzle.kind !== "subtraction") return [];
    return Array.from({ length: puzzle.start }, (_, i) => `sub-${i}`);
  }, [puzzle]);

  const markSubReady = (nextBanked: string[]) => {
    if (puzzle.kind !== "subtraction") return;
    if (nextBanked.length < puzzle.takeAway) return;
    setSubReady(true);
    setSelectedCoinId(null);
    onCoachSpeak?.("How many coins are left? Pick the number!");
  };

  const bankCoin = (coinId: string) => {
    if (locked || puzzle.kind !== "subtraction") return false;
    if (bankedIdsRef.current.includes(coinId)) return false;
    if (bankedIdsRef.current.length >= puzzle.takeAway) return false;

    playBankSave();
    const nextBanked = [...bankedIdsRef.current, coinId];
    bankedIdsRef.current = nextBanked;
    setBankedIds(nextBanked);
    setSelectedCoinId(null);
    markSubReady(nextBanked);
    return true;
  };

  const autoBankForSolve = () => {
    if (puzzle.kind !== "subtraction") return;
    const need = puzzle.takeAway - bankedIdsRef.current.length;
    if (need <= 0) return;
    const extras = subtractionCoins
      .filter((id) => !bankedIdsRef.current.includes(id))
      .slice(0, need);
    const nextBanked = [...bankedIdsRef.current, ...extras];
    bankedIdsRef.current = nextBanked;
    setBankedIds(nextBanked);
    setSubReady(true);
    setSelectedCoinId(null);
  };

  const onPick = (value: number) => {
    if (locked) return;

    if (puzzle.kind === "subtraction" && !subReady) {
      // Kid already knows the leftover — accept correct math even if drag was skipped.
      if (value === puzzle.answer) {
        autoBankForSolve();
        setCelebrateChoice(value);
        onSolve(value);
        return;
      }
      setWiggleChoice(value);
      window.setTimeout(() => setWiggleChoice(null), 400);
      onMiss(
        `First put ${puzzle.takeAway} ${
          puzzle.takeAway === 1 ? "coin" : "coins"
        } in the Saving Box, then pick how many are left!`,
      );
      return;
    }

    if (value === puzzle.answer) {
      setCelebrateChoice(value);
      onSolve(value);
      return;
    }
    setWiggleChoice(value);
    window.setTimeout(() => setWiggleChoice(null), 400);
    onMiss(
      puzzle.kind === "subtraction"
        ? "Count the coins still outside the Saving Box!"
        : undefined,
    );
  };

  const dropInJar = (coinId: string, point: PointerPoint) => {
    if (locked || puzzle.kind !== "addition") return;
    if (spentIds.includes(coinId)) return;
    if (!hitsTarget(point, jarRef.current, 28)) return;
    playClink();
    setSpentIds((prev) => [...prev, coinId]);
    setJarCount((n) => {
      const next = n + 1;
      if (next === puzzle.answer) {
        window.setTimeout(() => {
          setCelebrateChoice(puzzle.answer);
          onSolve(puzzle.answer);
        }, 280);
      }
      return next;
    });
  };

  const dropInSavingBox = (coinId: string, point: PointerPoint) => {
    if (!hitsTarget(point, savingBoxRef.current, 36)) return;
    bankCoin(coinId);
  };

  const onSavingBoxTap = () => {
    if (locked || puzzle.kind !== "subtraction" || !selectedCoinId) return;
    bankCoin(selectedCoinId);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border-4 border-white bg-white/90 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-6">
        <p className="mb-1 text-center text-sm font-extrabold uppercase tracking-wide text-amber-700">
          Explorer coin math · {puzzle.kind}
        </p>
        <p className="mb-4 text-center text-lg font-extrabold text-slate-800 sm:text-xl">
          {puzzle.prompt}
        </p>

        {puzzle.kind === "addition" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <CoinTray label={`${puzzle.left} coins`}>
                {Array.from({ length: puzzle.left }, (_, i) => (
                  <MathGoldCoin key={`Lshow-${i}`} id={`Lshow-${i}`} size="sm" />
                ))}
              </CoinTray>
              <OpBadge>+</OpBadge>
              <CoinTray label={`${puzzle.right} coins`}>
                {Array.from({ length: puzzle.right }, (_, i) => (
                  <MathGoldCoin key={`Rshow-${i}`} id={`Rshow-${i}`} size="sm" />
                ))}
              </CoinTray>
              <OpBadge>?</OpBadge>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <div
                ref={jarRef}
                className="flex min-h-[5.5rem] min-w-[9rem] flex-col items-center justify-center rounded-[1.5rem] border-4 border-dashed border-amber-300 bg-amber-50 px-4 py-3 shadow-inner"
              >
                <p className="text-xs font-extrabold uppercase tracking-wide text-amber-700">
                  Total jar
                </p>
                <p className="text-2xl font-black text-amber-900">{jarCount}</p>
              </div>
              <div className="flex max-w-full flex-wrap justify-center gap-2 rounded-[1.35rem] bg-white/80 p-2 shadow-md">
                {additionCoins.map((id) => (
                  <MathGoldCoin
                    key={id}
                    id={id}
                    spent={spentIds.includes(id)}
                    drag={!locked && !spentIds.includes(id)}
                    onDragEnd={(point) => dropInJar(id, point)}
                    ariaLabel="Drag coin into total jar"
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-sm font-bold text-slate-500">
              Drag coins into the jar, or pick a number card below
            </p>
          </div>
        )}

        {puzzle.kind === "subtraction" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex flex-wrap justify-center gap-2 rounded-[1.5rem] border-4 border-white bg-amber-50/80 p-3">
                {subtractionCoins.map((id) => {
                  const banked = bankedIds.includes(id);
                  const remaining = !banked;
                  const glow = subReady && remaining;
                  return (
                    <MathGoldCoin
                      key={id}
                      id={id}
                      spent={banked}
                      glowing={glow}
                      selected={selectedCoinId === id}
                      drag={!locked && !banked && bankedIds.length < puzzle.takeAway}
                      onDragEnd={(point) => dropInSavingBox(id, point)}
                      onTap={() => {
                        if (locked || banked || bankedIds.length >= puzzle.takeAway) {
                          return;
                        }
                        setSelectedCoinId((prev) => (prev === id ? null : id));
                      }}
                      ariaLabel="Drag or tap coin for the saving box"
                    />
                  );
                })}
              </div>
              <OpBadge>−</OpBadge>
              <button
                type="button"
                ref={savingBoxRef}
                onClick={onSavingBoxTap}
                aria-label="Saving box. Tap after selecting a coin."
                className={`relative flex min-h-[6.5rem] min-w-[9rem] flex-col items-center justify-center rounded-[1.6rem] border-4 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 px-4 py-3 shadow-lg ${
                  selectedCoinId
                    ? "border-sky-400 ring-4 ring-sky-200"
                    : "border-amber-300"
                }`}
              >
                <span className="text-5xl drop-shadow-sm" aria-hidden>
                  🐻
                </span>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-amber-800">
                  Saving box
                </p>
                <p className="text-sm font-black text-amber-950">
                  {bankedIds.length}/{puzzle.takeAway}
                </p>
                {bankedIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {bankedIds.map((id) => (
                      <span
                        key={`banked-${id}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-amber-950"
                        aria-hidden
                      >
                        ●
                      </span>
                    ))}
                  </div>
                )}
              </button>
            </div>
            <p className="text-center text-sm font-bold text-slate-500">
              {subReady
                ? "Great! Now pick how many coins are left"
                : selectedCoinId
                  ? "Now tap the Saving Box 🐻"
                  : `Drag ${puzzle.takeAway} coin${
                      puzzle.takeAway === 1 ? "" : "s"
                    } into the Saving Box 🐻 — or tap a coin, then tap the box`}
            </p>
          </div>
        )}

        {puzzle.kind === "groups" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-stretch justify-center gap-3">
              {Array.from({ length: puzzle.groups }, (_, g) => (
                <div
                  key={`basket-${g}`}
                  className="rounded-[1.5rem] border-4 border-lime-200 bg-gradient-to-b from-lime-50 to-emerald-100 p-3 shadow-lg"
                >
                  <p className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                    Basket {g + 1}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: puzzle.perGroup }, (_, i) => (
                      <MathFruitTile
                        key={`${g}-${i}`}
                        fruit={puzzle.fruit}
                        size="sm"
                        ariaLabel={`${MATH_FRUITS[puzzle.fruit].singular} in basket ${g + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm font-bold text-slate-500">
              {puzzle.groups} groups of {puzzle.perGroup}{" "}
              {MATH_FRUITS[puzzle.fruit].label.toLowerCase()}
            </p>
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-center text-base font-bold text-slate-700">
          Pick the answer
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {puzzle.choices.map((n) => (
            <NumberCard
              key={`${puzzle.id}-${n}`}
              value={n}
              locked={locked}
              celebrate={celebrateChoice === n}
              wiggle={wiggleChoice === n}
              wrongFlash={wiggleChoice === n}
              onPick={() => onPick(n)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CoinTray({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border-4 border-white bg-amber-50/90 p-3 shadow-md">
      <p className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-amber-700">
        {label}
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">{children}</div>
    </div>
  );
}

function OpBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-violet-100 text-2xl font-black text-violet-700 shadow-md">
      {children}
    </span>
  );
}
