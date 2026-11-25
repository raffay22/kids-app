"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, RefreshCw, Share2, Sparkles, X } from "lucide-react";
import { getRandomParentingTip } from "@/utils/parentingTips";

export type ShareableProgressCardProps = {
  open: boolean;
  onClose: () => void;
  childName?: string | null;
  stars: number;
  trophiesCount?: number;
  latestTrophyTitle?: string | null;
  accuracy: number;
  practiceMinutes: number;
  highlightText?: string;
  appUrl?: string;
  captionText?: string;
};

function slugifyName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  return cleaned || "little-champion";
}

/**
 * Branded 4:5 Kids Achievement & Progress Card for 1-Tap WhatsApp Status Sharing.
 * Renders strictly in-memory via html-to-image (zero Supabase storage load).
 */
export default function ShareableProgressCard({
  open,
  onClose,
  childName,
  stars,
  trophiesCount = 0,
  latestTrophyTitle,
  accuracy,
  highlightText,
  appUrl = "https://growvajunior.com",
  captionText,
}: ShareableProgressCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tip, setTip] = useState<string>("");
  const [busyAction, setBusyAction] = useState<"share" | "save" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const displayName = childName?.trim() || "Little Champion";
  const displayHighlight =
    highlightText?.trim() ||
    `Achieved ${accuracy}% accuracy with ${stars} stars earned!`;
  const cleanSite = appUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const fileName = `growva-champion-${slugifyName(displayName)}.png`;

  const shareCaption =
    captionText ||
    `🌟 Proud Parent Moment on Growva Junior! 🎉\n\n` +
      `My little learner *${displayName}* earned ⭐ ${stars} Stars` +
      (trophiesCount > 0 ? ` & 🏆 ${trophiesCount} ${trophiesCount === 1 ? "Trophy" : "Trophies"}` : "") +
      `!\n` +
      (latestTrophyTitle ? `Latest Milestone: ${latestTrophyTitle}\n` : "") +
      `${displayHighlight}\n\n` +
      `Try Growva Junior — Safe & Distraction-Free Early Learning: ${appUrl}`;

  // Pick a fresh random tip every time the share modal opens
  useEffect(() => {
    if (open) {
      setTip(getRandomParentingTip());
      setFeedback(null);
    }
  }, [open]);

  const renderCardToBlob = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    return blob;
  }, []);

  const triggerDownload = useCallback(
    (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    [fileName],
  );

  const handleShareToWhatsApp = async () => {
    setBusyAction("share");
    setFeedback(null);
    try {
      const blob = await renderCardToBlob();
      if (!blob) {
        setFeedback("Could not generate card image. Please try again.");
        return;
      }

      const pngFile = new File([blob], fileName, { type: "image/png" });
      const canNativeFileShare =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [pngFile] });

      if (canNativeFileShare) {
        await navigator.share({
          files: [pngFile],
          title: "Growva Junior Achievement",
          text: shareCaption,
        });
        setFeedback("Shared successfully! 🎉");
        return;
      }

      // Desktop / unsupported browser fallback: save PNG + open WhatsApp Web with caption
      triggerDownload(blob);
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareCaption)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      setFeedback(
        "Card image saved & WhatsApp Web opened! Attach the downloaded PNG to share.",
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setFeedback("Share cancelled.");
      } else {
        setFeedback("Could not share image. Try Save Image instead.");
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveImage = async () => {
    setBusyAction("save");
    setFeedback(null);
    try {
      const blob = await renderCardToBlob();
      if (!blob) {
        setFeedback("Could not generate card image.");
        return;
      }
      triggerDownload(blob);
      setFeedback(`Saved ${fileName} to your device!`);
    } catch {
      setFeedback("Could not save image. Please try again.");
    } finally {
      setBusyAction(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shareable-card-title"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-md rounded-3xl bg-white p-4 shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="shareable-card-title"
            className="flex items-center gap-1.5 text-base font-extrabold text-slate-800"
          >
            <Sparkles className="h-4 w-4 text-amber-500" aria-hidden />
            Share Achievement Card
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTip((cur) => getRandomParentingTip(cur))}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
              title="Pick another parenting tip"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              New Tip
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close share card modal"
              className="rounded-full bg-slate-100 p-1.5 text-slate-600 transition hover:bg-slate-200"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Captured 4:5 Vertical WhatsApp Status Card — Growva Business Brand Light Theme */}
        <div
          ref={cardRef}
          className="relative mx-auto flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white px-5 pb-4 pt-5 text-slate-900 shadow-xl"
        >
          {/* Top Signature Growva Business Gradient Bar (Cyan -> Royal Blue -> Deep Violet -> Magenta) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#00D4E8] via-[#2563EB] via-55% to-[#C026D3]"
          />

          {/* Soft Growva Business Brand Color Glow Behind Content */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-14 top-12 h-48 w-48 rounded-full bg-[#00D4E8]/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 top-16 h-48 w-48 rounded-full bg-[#C026D3]/18 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[48%] h-44 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#00D4E8]/15 via-[#2563EB]/15 to-[#C026D3]/15 blur-3xl"
          />

          {/* Top Brand Header with Growva Business Logo */}
          <div className="relative flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/growvajuniorstudio-logo-transparent.png"
                  alt="Growva Junior"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="bg-gradient-to-r from-[#0284C7] via-[#3B1E8A] to-[#A21CAF] bg-clip-text text-xs font-black tracking-wide text-transparent">
                  GROWVA JUNIOR
                </p>
                <p className="text-[10px] font-semibold text-slate-500">
                  by Growva Business
                </p>
              </div>
            </div>
            <span className="rounded-full bg-gradient-to-r from-[#00D4E8] via-[#2563EB] to-[#C026D3] px-3 py-1 text-[11px] font-extrabold text-white shadow-sm">
              Daily Champion ⭐
            </span>
          </div>

          {/* Center Mascot + Child Name + Real Report Highlight + Rewards */}
          <div className="relative my-auto space-y-2.5 py-1.5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#00D4E8] via-[#2563EB] to-[#C026D3] p-[2.5px] shadow-md">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-3xl">
                <span aria-hidden>🦉</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#2563EB]">
                Proud Parent Moment
              </p>
              <h3 className="mt-0.5 text-2xl font-black tracking-tight text-[#1E1B4B] sm:text-3xl">
                {displayName}
              </h3>
              <div
                aria-hidden
                className="mx-auto mt-1 h-1 w-14 rounded-full bg-gradient-to-r from-[#00D4E8] via-[#2563EB] to-[#C026D3]"
              />
            </div>

            <div className="rounded-2xl border border-[#2563EB]/20 bg-gradient-to-r from-[#00D4E8]/10 via-[#2563EB]/8 to-[#C026D3]/10 px-4 py-2.5">
              <p className="text-sm font-bold leading-snug text-[#1E1B4B]">
                {displayHighlight}
              </p>
            </div>

            {/* Latest Milestone Trophy Badge (when unlocked) */}
            {latestTrophyTitle ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C026D3]/30 bg-gradient-to-r from-[#3B1E8A]/10 to-[#C026D3]/12 px-3.5 py-1 text-xs font-black text-[#4C1D95]">
                <span>{latestTrophyTitle}</span>
              </div>
            ) : null}

            {/* Rewards Pill Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-black text-amber-900 shadow-xs sm:text-sm">
                🌟 {stars} Stars
              </span>
              <span className="rounded-full border border-[#C026D3]/30 bg-fuchsia-50 px-3.5 py-1.5 text-xs font-black text-[#701A75] shadow-xs sm:text-sm">
                🏆 {trophiesCount} {trophiesCount === 1 ? "Trophy" : "Trophies"}
              </span>
              <span className="rounded-full border border-[#00D4E8]/50 bg-cyan-50 px-3.5 py-1.5 text-xs font-extrabold text-[#0E7490] shadow-xs sm:text-sm">
                🎯 {accuracy}% Accuracy
              </span>
            </div>
          </div>

          {/* Daily Parent Tip Callout */}
          <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/90 p-3 text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#3B1E8A]">
              💡 Parent Tip of the Day
            </p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700">
              {tip}
            </p>
          </div>

          {/* Card Footer */}
          <div className="relative mt-2 flex items-center justify-between gap-2 border-t border-slate-200/80 pt-2 text-[10px]">
            <span className="truncate font-semibold text-slate-500">
              Growva Junior — Safe &amp; Distraction-Free Learning
            </span>
            <span className="shrink-0 font-extrabold text-[#2563EB]">{cleanSite}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => void handleShareToWhatsApp()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            {busyAction === "share" ? "Preparing Card…" : "Share to WhatsApp"}
          </button>

          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => void handleSaveImage()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden />
            {busyAction === "save" ? "Saving…" : "Save Image"}
          </button>
        </div>

        {feedback ? (
          <p
            role="status"
            className="mt-2.5 text-center text-xs font-semibold text-indigo-700"
          >
            {feedback}
          </p>
        ) : null}
      </div>
    </div>
  );
}
