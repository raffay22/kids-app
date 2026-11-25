"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Lock,
  ShoppingBag,
  X,
} from "lucide-react";
import ParentalGate from "@/components/ParentalGate";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import { useAuth } from "@/components/AuthProvider";
import { useProAccess } from "@/hooks/useProAccess";
import {
  getMembershipTier,
  getMonthlyPdfCredits,
} from "@/lib/membership";
import {
  PRINTABLE_AGE_FILTERS,
  PRINTABLE_CATEGORY_FILTERS,
  STATIC_PRINTABLE_WORKSHEETS,
  type PrintableAgeGroup,
  type PrintableCategory,
  type PrintableWorksheet,
} from "@/utils/printableWorksheets";

const UNLOCKED_KEY = "kids-app-worksheet-unlocked-v1";

function loadUnlocked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveUnlocked(ids: string[]) {
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(ids));
}

/**
 * Prompt I + age/category taxonomy — DB first, static fallback.
 */
export default function WorksheetHub() {
  const { profile } = useAuth();
  const { isPro } = useProAccess();
  const [proModalOpen, setProModalOpen] = useState(false);
  const [unlockedGate, setUnlockedGate] = useState(false);
  const [gateOpen, setGateOpen] = useState(true);
  const [ageFilter, setAgeFilter] = useState<"all" | PrintableAgeGroup>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | PrintableCategory>(
    "all",
  );
  const [preview, setPreview] = useState<PrintableWorksheet | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [creditsLeft, setCreditsLeft] = useState(() => getMonthlyPdfCredits(profile));
  const [msg, setMsg] = useState<string | null>(null);
  const [rows, setRows] = useState<PrintableWorksheet[]>(STATIC_PRINTABLE_WORKSHEETS);
  const [source, setSource] = useState<"db" | "static">("static");
  const [loadingSheets, setLoadingSheets] = useState(true);

  useEffect(() => {
    setUnlockedIds(loadUnlocked());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/printable-worksheets", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.worksheets) && data.worksheets.length > 0) {
          setRows(data.worksheets as PrintableWorksheet[]);
          setSource(data.source === "db" ? "db" : "static");
        }
      } catch {
        // keep static fallback
      } finally {
        if (!cancelled) setLoadingSheets(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bundles = useMemo(
    () =>
      rows.filter(
        (b) =>
          (ageFilter === "all" || b.age_group === ageFilter) &&
          (categoryFilter === "all" || b.category === categoryFilter),
      ),
    [rows, ageFilter, categoryFilter],
  );

  const claimOrBuy = (bundle: PrintableWorksheet) => {
    if (!isPro) {
      setProModalOpen(true);
      return;
    }
    const tier = getMembershipTier(profile);
    const price = bundle.price_pkr ?? 150;
    const already = unlockedIds.includes(bundle.id);
    if (already) {
      window.open(bundle.pdfUrl, "_blank");
      return;
    }

    if (tier === "full_member" || tier === "basic_pro") {
      if (creditsLeft <= 0) {
        setMsg("No PDF credits left this month — buy for PKR 150 or upgrade.");
        return;
      }
      const nextCredits = Math.max(0, creditsLeft - 1);
      setCreditsLeft(nextCredits);
      const next = [...unlockedIds, bundle.id];
      setUnlockedIds(next);
      saveUnlocked(next);
      setMsg(`Claimed ${bundle.title} · ${nextCredits} credit(s) left`);
      window.open(bundle.pdfUrl, "_blank");
      return;
    }

    const next = [...unlockedIds, bundle.id];
    setUnlockedIds(next);
    saveUnlocked(next);
    setMsg(`Unlocked ${bundle.title} — PKR ${price} (download started)`);
    window.open(bundle.pdfUrl, "_blank");
  };

  if (!unlockedGate) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl border-4 border-white bg-white/95 p-6 text-center shadow-xl">
        <Lock className="mx-auto h-10 w-10 text-indigo-500" aria-hidden />
        <h1 className="text-2xl font-extrabold text-slate-800">
          Activity Sheets Hub
        </h1>
        <p className="text-sm font-medium text-slate-600">
          Grown-ups only — unlock to browse printable PDF worksheet bundles.
        </p>
        <button
          type="button"
          onClick={() => setGateOpen(true)}
          className="rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg"
        >
          Unlock Worksheets
        </button>
        <ParentalGate
          open={gateOpen}
          onClose={() => setGateOpen(false)}
          onSuccess={() => {
            setUnlockedGate(true);
            setGateOpen(false);
            setUnlockedIds(loadUnlocked());
          }}
          title="Parent Check — Worksheets"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-md"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-800"
        >
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
          Parent Shop
        </Link>
      </div>

      <section className="rounded-3xl border-4 border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-xl">
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Activity Sheets Hub
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Browse by age (2–4 / 4–6 / 6–9) and category. Source:{" "}
          {source === "db" ? "Supabase catalog" : "offline fallback packs"}.
        </p>
        <p className="mt-2 text-xs font-bold text-amber-800">
          PDF credits left this month: {creditsLeft}
        </p>
      </section>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Age groups">
        {PRINTABLE_AGE_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={ageFilter === f.id}
            onClick={() => setAgeFilter(f.id)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-extrabold ${
              ageFilter === f.id
                ? "border-amber-400 bg-amber-100 text-amber-950"
                : "border-white bg-white text-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
        {PRINTABLE_CATEGORY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={categoryFilter === f.id}
            onClick={() => setCategoryFilter(f.id)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-extrabold ${
              categoryFilter === f.id
                ? "border-indigo-400 bg-indigo-100 text-indigo-950"
                : "border-white bg-white text-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {msg && (
        <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800" role="status">
          {msg}
        </p>
      )}

      {loadingSheets ? (
        <ul className="grid gap-3 sm:grid-cols-2" aria-label="Loading worksheets">
          {[1, 2, 3, 4].map((n) => (
            <li
              key={`ws-skel-${n}`}
              className="animate-pulse rounded-3xl border-4 border-white bg-white/80 p-4 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
      <ul className="grid gap-3 sm:grid-cols-2">
        {bundles.map((bundle) => {
          const owned = unlockedIds.includes(bundle.id);
          return (
            <li
              key={bundle.id}
              className="rounded-3xl border-4 border-white bg-white/95 p-4 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <FileText className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                    Ages {bundle.age_group} · {bundle.category}
                  </p>
                  <h2 className="text-base font-extrabold text-slate-800">
                    {bundle.title}
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    {bundle.total_pages} pages · {bundle.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreview(bundle)}
                  className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => claimOrBuy(bundle)}
                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-extrabold text-white ${
                    owned ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  {!isPro
                    ? "🔒 Unlock Pro to Download"
                    : owned
                      ? "✓ Unlocked / Download"
                      : getMembershipTier(profile) !== "free"
                        ? `Claim with 1 Credit (${creditsLeft} left)`
                        : `Buy Bundle — PKR ${bundle.price_pkr ?? 150}`}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal
            className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="border-b border-slate-100 p-4 pr-12">
              <h3 className="font-extrabold text-slate-800">{preview.title}</h3>
              <p className="text-xs font-medium text-slate-500">
                Watermarked preview · ages {preview.age_group}
              </p>
            </div>
            <div className="relative max-h-[60vh] overflow-auto bg-slate-100 p-3">
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <span className="rotate-[-18deg] text-4xl font-black uppercase tracking-widest text-slate-400/40">
                  Preview
                </span>
              </div>
              <iframe
                title={`${preview.title} preview`}
                src={`${preview.pdfUrl}#toolbar=0`}
                className="h-[55vh] w-full rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="p-3">
              <button
                type="button"
                onClick={() => claimOrBuy(preview)}
                className="w-full rounded-2xl bg-indigo-500 py-3 text-sm font-extrabold text-white"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
      <ProUpgradeModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        title="Unlock Pro Printable Worksheets"
        description="All printable PDF workbooks and activity bundles require Growva Junior Pro. Upgrade to download and print unlimited activity sheets!"
      />
    </div>
  );
}
