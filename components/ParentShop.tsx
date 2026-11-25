"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Gift,
  Lock,
  Mail,
  MessageCircle,
  Share2,
  ShoppingBag,
} from "lucide-react";
import ParentalGate from "@/components/ParentalGate";
import { useAuth } from "@/components/AuthProvider";
import {
  getReferralShareUrl,
  getWhatsAppOrderUrl,
  getWhatsAppShareReferralUrl,
  PARENT_EMAIL_GROUP,
  SHOP_CATEGORIES,
  SHOP_PRODUCTS,
  WHATSAPP_CHANNEL_URL,
  type ShopCategory,
} from "@/utils/parentShop";
import { triggerHaptic } from "@/utils/haptics";

/**
 * Prompt D — Parent Shop & WhatsApp community (behind Parental Gate).
 */
export default function ParentShop() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(true);
  const [tab, setTab] = useState<ShopCategory | "all">("all");
  const [copied, setCopied] = useState(false);

  const referralLink = useMemo(
    () => getReferralShareUrl(user?.id),
    [user?.id],
  );

  const products = SHOP_PRODUCTS.filter(
    (p) => tab === "all" || p.category === tab,
  );

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      triggerHaptic(20);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl border-4 border-white bg-white/95 p-6 text-center shadow-xl">
        <Lock className="mx-auto h-10 w-10 text-indigo-500" aria-hidden />
        <h1 className="text-2xl font-extrabold text-slate-800">Parent Shop</h1>
        <p className="text-sm font-medium text-slate-600">
          Grown-ups only — solve a tiny math check to open community &amp; merch.
        </p>
        <button
          type="button"
          onClick={() => setGateOpen(true)}
          className="rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg"
        >
          Unlock Parent Shop
        </button>
        <Link
          href="/games/coin-shop"
          className="block text-sm font-bold text-emerald-700 underline"
        >
          Kids: open Tap-to-Fill Color Shop instead
        </Link>
        <ParentalGate
          open={gateOpen}
          onClose={() => setGateOpen(false)}
          onSuccess={() => {
            setUnlocked(true);
            setGateOpen(false);
          }}
          title="Parent Check — Shop"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-md"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Home
        </Link>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase text-emerald-800">
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
          Parent shop
        </p>
      </div>

      {/* Community + referral */}
      <section className="rounded-3xl border-4 border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-xl sm:p-6">
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Join Parent Community
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Soft tips, calm routines, and shop updates for families.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp Channel
          </a>
          <a
            href={PARENT_EMAIL_GROUP}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Parent Email Group
          </a>
        </div>
      </section>

      <section className="rounded-3xl border-4 border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow">
            <Gift className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-slate-800">
              Invite Friends &amp; Earn PDF Credits
            </h2>
            <p className="mt-1 rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-amber-800 ring-1 ring-amber-200">
              Invite 3 Parent Friends → Get 1 FREE 50-Page PDF Bundle!
            </p>
            <p className="mt-3 break-all rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              {referralLink}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void copyReferral()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow"
              >
                <Copy className="h-4 w-4" aria-hidden />
                {copied ? "Copied!" : "Copy link"}
              </button>
              <a
                href={getWhatsAppShareReferralUrl(referralLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                Share via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Merch */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-800">
          Educational Merchandise
        </h2>
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Shop categories"
        >
          {SHOP_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={tab === c.id}
              onClick={() => setTab(c.id)}
              className={`rounded-full border-2 px-3 py-1.5 text-xs font-extrabold shadow-sm ${
                tab === c.id
                  ? "border-indigo-400 bg-indigo-100 text-indigo-900"
                  : "border-white bg-white/90 text-slate-600"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((p) => {
            const Icon = p.Icon;
            return (
              <article
                key={p.id}
                className={`flex flex-col rounded-3xl border-4 bg-gradient-to-br p-4 shadow-lg ${p.accentClass}`}
              >
                <div
                  className={`mb-3 flex h-28 items-center justify-center rounded-2xl border-4 border-white shadow-inner ${p.iconClass}`}
                >
                  <Icon className="h-14 w-14" strokeWidth={1.6} aria-hidden />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {p.blurb}
                </p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  PKR {p.pricePkr.toLocaleString()}
                </p>
                <a
                  href={getWhatsAppOrderUrl(p.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Buy on WhatsApp / Order Now
                </a>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
