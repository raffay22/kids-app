"use client";

import { useRouter } from "next/navigation";
import { Crown, Lock, Sparkles, X } from "lucide-react";

type ProUpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

/**
 * Reusable child/parent-friendly Pro Membership upgrade modal.
 */
export default function ProUpgradeModal({
  open,
  onClose,
  title = "Unlock Pro to Play",
  description = "Upgrade to Growva Junior Pro to unlock all games, Pro challenge levels, unlimited coloring, printable PDF worksheets, grammar flashcards, and full story libraries!",
  ctaLabel = "Unlock Pro Membership",
}: ProUpgradeModalProps) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border-4 border-amber-200 bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close upgrade modal"
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 text-white shadow-lg">
          <Crown className="h-8 w-8" aria-hidden />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-800">
          <Lock className="h-3 w-3" aria-hidden />
          Growva Junior Pro
        </span>

        <h2
          id="pro-upgrade-modal-title"
          className="mt-3 text-2xl font-extrabold text-slate-800"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          {description}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/upgrade");
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-5 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:translate-y-0.5"
          >
            <Sparkles className="h-5 w-5" aria-hidden />
            {ctaLabel}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
