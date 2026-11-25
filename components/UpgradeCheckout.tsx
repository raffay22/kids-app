"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe, GraduationCap, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { isProUser, TIER_PRICING } from "@/lib/membership";
import {
  COUNTRIES,
  detectCountrySilently,
  isPakistanCountry,
  saveCountryOverride,
  saveProfileCountrySafe,
} from "@/utils/country";
import { createClient } from "@/utils/supabase/client";

type SchoolPreview = {
  school_name: string;
  monthly_price_pkr: number;
  granted_basic_pro: boolean;
  discount_type: string;
};

/**
 * Checkout: standard Basic Pro / Full, or school-partner discounted Basic Pro.
 */
export default function UpgradeCheckout() {
  const { user, profile, refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("school_token")?.trim() || "";

  const [schoolToken, setSchoolToken] = useState(tokenFromUrl);
  const [school, setSchool] = useState<SchoolPreview | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [country, setCountry] = useState<string>("PK");

  useEffect(() => {
    const metaCountry =
      typeof user?.user_metadata?.country === "string"
        ? user.user_metadata.country
        : null;
    setCountry(detectCountrySilently(profile?.country, metaCountry));
  }, [profile?.country, user?.user_metadata?.country]);

  const handleCountryChange = (nextCode: string) => {
    setCountry(nextCode);
    saveCountryOverride(nextCode);
    if (user) {
      try {
        const supabase = createClient();
        void saveProfileCountrySafe(supabase, user.id, nextCode);
      } catch {
        /* ignore */
      }
    }
  };

  const isPK = isPakistanCountry(country);
  const alreadyPro = isProUser(profile);

  useEffect(() => {
    if (tokenFromUrl) {
      setSchoolToken(tokenFromUrl);
      return;
    }
    try {
      const stored = sessionStorage.getItem("school_token");
      if (stored) setSchoolToken(stored);
    } catch {
      /* ignore */
    }
  }, [tokenFromUrl]);

  useEffect(() => {
    if (!schoolToken) {
      setSchool(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch(
        `/api/schools/by-token?school_token=${encodeURIComponent(schoolToken)}`,
      );
      const data = await res.json();
      if (cancelled) return;
      if (res.ok) setSchool(data.school as SchoolPreview);
      else setSchool(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [schoolToken]);

  const listPricePkr = TIER_PRICING.basic_pro.pkr;
  const schoolPrice = school?.monthly_price_pkr;
  const payPricePkr =
    schoolPrice != null && !school?.granted_basic_pro ? schoolPrice : listPricePkr;

  const schoolBanner = useMemo(() => {
    if (!school) return null;
    if (school.granted_basic_pro) {
      return `${school.school_name}: 100% Free Basic Pro already applied.`;
    }
    return `School Partner Discount: Rs. ${school.monthly_price_pkr}/month (was Rs. ${listPricePkr})`;
  }, [school, listPricePkr]);

  const submitPaymentRequest = async (plan: "basic_pro" | "full_member") => {
    if (!user) {
      setStatus("Please sign in or create an account first.");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const supabase = createClient();
      const currency = isPK ? "PKR" : "USD";
      const amount = isPK
        ? plan === "full_member"
          ? TIER_PRICING.full_member.pkr
          : school && !school.granted_basic_pro
            ? payPricePkr
            : TIER_PRICING.basic_pro.pkr
        : plan === "full_member"
          ? TIER_PRICING.full_member.usd
          : TIER_PRICING.basic_pro.usd;

      await saveProfileCountrySafe(supabase, user.id, country);

      const { error } = await supabase.from("payment_requests").insert({
        user_id: user.id,
        status: "pending",
        payment_method: "manual",
        plan_type: "monthly",
        amount,
        currency,
      });

      if (error) {
        setStatus(error.message);
      } else {
        if (schoolToken) {
          await fetch("/api/schools/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ school_token: schoolToken }),
          });
          await refreshProfile();
        }
        const priceLabel = isPK ? `Rs. ${amount}/month` : `$${amount}/month`;
        setStatus(
          `Payment request submitted for ${priceLabel}. Admin will verify your receipt.`,
        );
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {alreadyPro && (
        <section className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center shadow-md">
          <p className="text-lg font-extrabold text-emerald-900">
            🎉 Your Growva Junior Pro Access is Active!
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-800">
            {profile?.school_code
              ? `100% Free Partner Access (${profile.school_code}) — all games, stories, flashcards & worksheets are unlocked.`
              : "All Pro games, stories, flashcards, and worksheets are already unlocked for your account."}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-emerald-700"
          >
            Go to Learning Home
          </Link>
        </section>
      )}
      <section className="rounded-3xl border-4 border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-800">
              <Sparkles className="h-6 w-6 text-indigo-500" aria-hidden />
              Upgrade
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Unlock Basic Pro or Full Membership. School partners use a secure invite link only.
            </p>
          </div>

          <label className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
            <Globe className="h-4 w-4 text-indigo-500" aria-hidden />
            <span className="sr-only">Billing Country</span>
            <select
              aria-label="Billing Country"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 outline-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-2 text-xs font-semibold text-indigo-700">
          {isPK
            ? "🇵🇰 Pakistan pricing selected — shown in PKR (Rs.)"
            : "🌍 International pricing selected — shown in USD ($)"}
        </p>

        {schoolBanner && (
          <p className="mt-3 flex items-start gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {schoolBanner}
          </p>
        )}
        {profile?.school_code && (
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Linked school code: {profile.school_code}
            {profile.school_monthly_price_pkr != null
              ? ` · stored price Rs. ${profile.school_monthly_price_pkr}/mo`
              : ""}
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl border-4 border-white bg-white/95 p-5 shadow-lg">
          <h2 className="text-lg font-extrabold text-slate-800">
            {TIER_PRICING.basic_pro.label}
          </h2>
          <p className="mt-2 text-3xl font-black text-indigo-700">
            {isPK
              ? `Rs. ${school && !school.granted_basic_pro ? payPricePkr : listPricePkr}`
              : `$${TIER_PRICING.basic_pro.usd}`}
            <span className="text-sm font-bold text-slate-500"> / month</span>
          </p>
          {isPK && school && !school.granted_basic_pro && payPricePkr < listPricePkr && (
            <p className="text-xs font-semibold text-emerald-700">
              Partner price (list Rs. {listPricePkr})
            </p>
          )}
          <ul className="mt-3 space-y-1 text-sm font-medium text-slate-600">
            <li>Ad-free learning</li>
            <li>Up to 3 child profiles</li>
            <li>1 worksheet PDF / month</li>
          </ul>
          <button
            type="button"
            disabled={busy || !user || Boolean(school?.granted_basic_pro)}
            onClick={() => void submitPaymentRequest("basic_pro")}
            className="mt-4 w-full rounded-2xl bg-indigo-500 py-3 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {school?.granted_basic_pro
              ? "Already included (school free)"
              : busy
                ? "Submitting…"
                : "Request Basic Pro"}
          </button>
        </article>

        <article className="rounded-3xl border-4 border-white bg-white/95 p-5 shadow-lg">
          <h2 className="text-lg font-extrabold text-slate-800">
            {TIER_PRICING.full_member.label}
          </h2>
          <p className="mt-2 text-3xl font-black text-violet-700">
            {isPK
              ? `Rs. ${TIER_PRICING.full_member.pkr}`
              : `$${TIER_PRICING.full_member.usd}`}
            <span className="text-sm font-bold text-slate-500"> / month</span>
          </p>
          <ul className="mt-3 space-y-1 text-sm font-medium text-slate-600">
            <li>Everything in Basic Pro</li>
            <li>Up to 6 child profiles</li>
            <li>6 worksheet PDFs / month</li>
          </ul>
          <button
            type="button"
            disabled={busy || !user}
            onClick={() => void submitPaymentRequest("full_member")}
            className="mt-4 w-full rounded-2xl bg-violet-500 py-3 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Request Full Membership"}
          </button>
        </article>
      </div>

      {!user && (
        <p className="text-center text-sm font-semibold text-slate-600">
          <Link href="/signup" className="text-indigo-600 underline">
            Create an account
          </Link>{" "}
          or{" "}
          <Link href="/login" className="text-indigo-600 underline">
            Sign in
          </Link>{" "}
          to save your child&apos;s stars &amp; submit a payment request.
        </p>
      )}
      {status && (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
