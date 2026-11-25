"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Download,
  Eraser,
  LayoutGrid,
  Lock,
  RotateCcw,
  X,
} from "lucide-react";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import {
  FREE_COLORING_DAILY_LIMIT,
  FREE_COLORING_POOL_SIZE,
  useProAccess,
} from "@/hooks/useProAccess";
import { burstConfetti, playDing, starShower } from "@/utils/celebrate";
import {
  COLORING_COMPLETE_RATIO,
  COLORING_PALETTE,
  COLORING_STARS_AWARD,
} from "@/utils/coloringPalette";
import {
  COLORING_SHEETS,
  type ColoringSheet,
} from "@/utils/coloringSheets";
import { createClient } from "@/utils/supabase/client";
import { handleGuestAward } from "@/utils/awardProgress";
import { logProgress } from "@/utils/logProgress";

const LINE_LUMA = 110; // pixels darker than this are ink walls
const COLORING_DAILY_KEY = "growva_coloring_daily_v1";

type DailyColoringState = {
  date: string;
  completedIds: string[];
  coloredCountToday: number;
};

function todayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readDailyColoring(): DailyColoringState {
  const today = todayDateKey();
  if (typeof window === "undefined") {
    return { date: today, completedIds: [], coloredCountToday: 0 };
  }
  try {
    const raw = window.localStorage.getItem(COLORING_DAILY_KEY);
    if (!raw) return { date: today, completedIds: [], coloredCountToday: 0 };
    const parsed = JSON.parse(raw) as Partial<DailyColoringState>;
    if (parsed.date !== today) {
      return { date: today, completedIds: [], coloredCountToday: 0 };
    }
    const ids = Array.isArray(parsed.completedIds) ? parsed.completedIds : [];
    const count =
      typeof parsed.coloredCountToday === "number"
        ? parsed.coloredCountToday
        : ids.length;
    return { date: today, completedIds: ids, coloredCountToday: count };
  } catch {
    return { date: today, completedIds: [], coloredCountToday: 0 };
  }
}

function recordDailyColoringCompletion(sheetId: string): DailyColoringState {
  const cur = readDailyColoring();
  if (cur.completedIds.includes(sheetId)) return cur;
  const next: DailyColoringState = {
    date: cur.date,
    completedIds: [...cur.completedIds, sheetId],
    coloredCountToday: cur.coloredCountToday + 1,
  };
  try {
    window.localStorage.setItem(COLORING_DAILY_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
  return next;
}

const FREE_POOL_IDS = new Set(
  COLORING_SHEETS.slice(0, FREE_COLORING_POOL_SIZE).map((s) => s.id),
);

function getTodayFreeSheetIds(): Set<string> {
  const pool = COLORING_SHEETS.slice(0, FREE_COLORING_POOL_SIZE);
  if (pool.length <= FREE_COLORING_DAILY_LIMIT) {
    return new Set(pool.map((s) => s.id));
  }
  const daySeed = Math.floor(Date.now() / 86_400_000);
  const start = (daySeed * FREE_COLORING_DAILY_LIMIT) % pool.length;
  const picked = new Set<string>();
  for (let i = 0; i < FREE_COLORING_DAILY_LIMIT; i += 1) {
    picked.add(pool[(start + i) % pool.length].id);
  }
  return picked;
}

function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function luma(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillHex: string,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(startX)));
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(startY)));
  const i0 = (y0 * w + x0) * 4;
  const sr = data[i0];
  const sg = data[i0 + 1];
  const sb = data[i0 + 2];

  // Don't fill on ink lines
  if (luma(sr, sg, sb) < LINE_LUMA) return 0;

  const [fr, fg, fb] = hexToRgba(fillHex);
  // Already this color
  if (sr === fr && sg === fg && sb === fb) return 0;

  const match = (i: number) => {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (luma(r, g, b) < LINE_LUMA) return false;
    // same region as start (tolerance for anti-alias / off-white)
    return (
      Math.abs(r - sr) < 40 && Math.abs(g - sg) < 40 && Math.abs(b - sb) < 40
    );
  };

  const stack: number[] = [x0, y0];
  const seen = new Uint8Array(w * h);
  let painted = 0;

  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const idx = y * w + x;
    if (seen[idx]) continue;
    seen[idx] = 1;
    const i = idx * 4;
    if (!match(i)) continue;
    data[i] = fr;
    data[i + 1] = fg;
    data[i + 2] = fb;
    data[i + 3] = 255;
    painted++;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  ctx.putImageData(img, 0, 0);
  return painted;
}

function fillRatioFromCanvas(ctx: CanvasRenderingContext2D) {
  const { width: w, height: h } = ctx.canvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  let fillable = 0;
  let filled = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const L = luma(r, g, b);
    if (L < LINE_LUMA) continue;
    fillable++;
    // colored if not near-white
    if (L < 245 || Math.abs(r - g) > 8 || Math.abs(g - b) > 8) filled++;
  }
  return fillable ? filled / fillable : 0;
}

export default function ColouringBoard() {
  const { user } = useAuth();
  const { isPro } = useProAccess();
  const { activeChild, refreshChildren } = useActiveChild();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);

  const todayFreeIds = useMemo(() => getTodayFreeSheetIds(), []);
  const defaultSheet = useMemo(() => {
    const firstFree = COLORING_SHEETS.find((s) => todayFreeIds.has(s.id));
    return (
      firstFree ??
      COLORING_SHEETS.find((s) => s.id === "03-park-slide") ??
      COLORING_SHEETS[0]
    );
  }, [todayFreeIds]);
  const [sheetId, setSheetId] = useState(defaultSheet?.id ?? "");
  const sheet = useMemo(
    () => COLORING_SHEETS.find((s) => s.id === sheetId) ?? defaultSheet,
    [sheetId, defaultSheet],
  );
  const [selected, setSelected] = useState(COLORING_PALETTE[0].hex);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ratio, setRatio] = useState(0);
  const [loading, setLoading] = useState(true);
  const [coloredCountToday, setColoredCountToday] = useState(0);
  const [proModal, setProModal] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({ open: false, title: "", description: "" });
  const awardedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setColoredCountToday(readDailyColoring().coloredCountToday);
  }, []);

  const loadSheet = useCallback(async (next: ColoringSheet) => {
    setLoading(true);
    setMsg(null);
    const img = new Image();
    img.decoding = "async";
    img.src = next.src;
    await img.decode().catch(() => undefined);
    baseRef.current = img;
    const canvas = canvasRef.current;
    if (!canvas) {
      setLoading(false);
      return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = 900;
    canvas.height = 1200;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Sheets are normalized to 900×1200; still contain-fit so nothing overflows.
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const dw = Math.round(img.width * scale);
    const dh = Math.round(img.height * scale);
    const dx = Math.round((canvas.width - dw) / 2);
    const dy = Math.round((canvas.height - dh) / 2);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, dw, dh);
    setRatio(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sheet) void loadSheet(sheet);
  }, [sheet, loadSheet]);

  const maybeAward = useCallback(
    async (nextRatio: number, id: string) => {
      if (nextRatio < COLORING_COMPLETE_RATIO) return;
      if (awardedRef.current.has(id)) return;
      awardedRef.current.add(id);
      starShower();
      burstConfetti();
      playDing();
      setMsg(`Beautiful art! +${COLORING_STARS_AWARD} stars`);

      if (!isPro) {
        const updated = recordDailyColoringCompletion(id);
        setColoredCountToday(updated.coloredCountToday);
        if (updated.coloredCountToday >= FREE_COLORING_DAILY_LIMIT) {
          setProModal({
            open: true,
            title: "Daily Free Limit Reached! 🎨",
            description:
              "You've completed your 3 free coloring sheets for today! 🎨 Come back tomorrow or unlock Unlimited Pro Coloring!",
          });
        }
      }
      if (
        handleGuestAward({
          userId: user?.id,
          childId: activeChild?.id,
          deltaStars: COLORING_STARS_AWARD,
        })
      ) {
        return;
      }
      if (user && activeChild) {
        try {
          await logProgress({
            user_id: user.id,
            child_id: activeChild.id,
            feature_route: "/coloring",
            attempt_type: "tap",
            target_word: `color-${id}`,
            is_correct: true,
          });
          const supabase = createClient();
          await supabase
            .from("children")
            .update({ stars: (activeChild.stars ?? 0) + COLORING_STARS_AWARD })
            .eq("id", activeChild.id);
          await refreshChildren();
        } catch {
          /* offline */
        }
      }
    },
    [activeChild, isPro, refreshChildren, user],
  );

  const onCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !sheet) return;
    if (!isPro && coloredCountToday >= FREE_COLORING_DAILY_LIMIT && !awardedRef.current.has(sheet.id)) {
      setProModal({
        open: true,
        title: "Daily Free Limit Reached! 🎨",
        description:
          "You've completed your 3 free coloring sheets for today! 🎨 Come back tomorrow or unlock Unlimited Pro Coloring!",
      });
      return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    floodFill(ctx, x, y, selected);
    const next = fillRatioFromCanvas(ctx);
    setRatio(next);
    void maybeAward(next, sheet.id);
  };

  const clearCanvas = () => {
    if (sheet) {
      awardedRef.current.delete(sheet.id);
      void loadSheet(sheet);
    }
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !sheet) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${sheet.id}-my-art.png`;
    a.click();
  };

  const switchSheet = (next: ColoringSheet) => {
    const inFreePool = FREE_POOL_IDS.has(next.id);
    if (!isPro && !inFreePool) {
      setPickerOpen(false);
      setProModal({
        open: true,
        title: "Unlock Pro Coloring Sheet",
        description:
          "This premium coloring sheet is part of the Growva Junior Pro Pool. Upgrade to unlock all coloring sheets with no daily limits!",
      });
      return;
    }
    if (!isPro && coloredCountToday >= FREE_COLORING_DAILY_LIMIT) {
      setPickerOpen(false);
      setProModal({
        open: true,
        title: "Daily Free Limit Reached! 🎨",
        description:
          "You've completed your 3 free coloring sheets for today! 🎨 Come back tomorrow or unlock Unlimited Pro Coloring!",
      });
      return;
    }
    setSheetId(next.id);
    setPickerOpen(false);
  };

  const categories = useMemo(() => {
    const map = new Map<string, ColoringSheet[]>();
    for (const s of COLORING_SHEETS) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return map;
  }, []);

  if (!sheet) {
    return (
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        No colouring sheets found. Run{" "}
        <code>python scripts/coloring/generate_premium_sheets.py --from-refs</code>
      </p>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-pink-100 bg-gradient-to-r from-rose-50 via-white to-amber-50 px-3 py-3 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-rose-500">
            Premium Colouring Board
          </p>
          <h1 className="text-lg font-black text-slate-800 sm:text-xl">
            {sheet.emoji} {sheet.title}
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Filled {Math.round(ratio * 100)}% · Tap regions to paint ·{" "}
            {COLORING_SHEETS.length} pro sheets
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow ring-1 ring-slate-200"
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            Worksheets
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow ring-1 ring-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
          <button
            type="button"
            onClick={downloadPng}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-2 text-xs font-extrabold text-white shadow"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Download My Art
          </button>
        </div>
      </header>

      {msg ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
          {msg}
        </p>
      ) : null}

      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-inner">
        {loading ? (
          <p className="p-8 text-center text-sm font-semibold text-slate-500">
            Loading sheet…
          </p>
        ) : null}
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          className="mx-auto h-auto max-h-[min(68vh,720px)] w-full cursor-crosshair touch-manipulation"
          style={{ aspectRatio: "3 / 4" }}
        />
        {ratio >= COLORING_COMPLETE_RATIO ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-extrabold text-white shadow">
            <Check className="h-3 w-3" aria-hidden />
            Complete
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Color palette
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {COLORING_PALETTE.map((swatch) => {
            const active = selected === swatch.hex;
            const isEraser = swatch.id === "eraser";
            return (
              <button
                key={swatch.id}
                type="button"
                aria-label={swatch.label}
                aria-pressed={active}
                onClick={() => setSelected(swatch.hex)}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm transition ${
                  active
                    ? "animate-bounce border-slate-900 ring-4 ring-amber-300/80"
                    : "border-slate-300 hover:scale-105"
                }`}
                style={{ backgroundColor: swatch.hex }}
              >
                {isEraser ? <Eraser className="h-4 w-4 text-slate-500" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-base font-extrabold text-slate-800">
                Premium worksheets ({COLORING_SHEETS.length})
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPickerOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-3">
              {[...categories.entries()].map(([cat, list]) => (
                <div key={cat}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {cat}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {list.map((t) => {
                      const isLockedProSheet = !isPro && !FREE_POOL_IDS.has(t.id);
                      const isTodayPick = !isPro && todayFreeIds.has(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => switchSheet(t)}
                          className={`relative overflow-hidden rounded-2xl border text-left transition ${
                            t.id === sheet.id
                              ? "border-rose-400 ring-2 ring-rose-200"
                              : isLockedProSheet
                                ? "border-amber-200 bg-amber-50/40 opacity-85 hover:opacity-100"
                                : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {isLockedProSheet ? (
                            <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-amber-950 shadow">
                              <Lock className="h-2.5 w-2.5" aria-hidden />
                              Pro 🔒
                            </span>
                          ) : isTodayPick ? (
                            <span className="absolute right-1.5 top-1.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow">
                              Today&apos;s Free
                            </span>
                          ) : null}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.src}
                            alt=""
                            className="aspect-[3/4] w-full bg-white object-contain"
                          />
                          <p className="px-2 py-1.5 text-xs font-bold text-slate-800">
                            {t.emoji} {t.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ProUpgradeModal
        open={proModal.open}
        onClose={() => setProModal((m) => ({ ...m, open: false }))}
        title={proModal.title}
        description={proModal.description}
      />
    </div>
  );
}
