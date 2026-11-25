"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Phone,
  Smartphone,
  Upload,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import type { PaymentSettingsPayload } from "@/app/api/payment-settings/route";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const DEFAULT_SETTINGS: PaymentSettingsPayload = {
  bankName: "Meezan Bank",
  accountTitle: "Growva Business",
  accountNumber: "",
  jazzcashNumber: "",
  easypaisaNumber: "",
  proPriceDisplay: "Rs. 1,500 / Month",
};

export default function ManualPaymentPage() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<PaymentSettingsPayload>(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [parentPhone, setParentPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payment-settings", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok && data.settings) {
          setSettings(data.settings as PaymentSettingsPayload);
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!parentName && profile?.child_nickname) {
      setParentName(profile.child_nickname);
    }
  }, [parentName, profile?.child_nickname]);

  const copyValue = async (key: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const picked = e.target.files?.[0] ?? null;
    if (!picked) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    const ext = (picked.name.split(".").pop() ?? "").toLowerCase();
    const validType =
      ["image/png", "image/jpeg", "image/jpg"].includes(picked.type) ||
      ["png", "jpg", "jpeg"].includes(ext);
    if (!validType) {
      setError("Please select a valid image file (.png, .jpg, or .jpeg).");
      e.target.value = "";
      return;
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      setError("Receipt screenshot must be under 5 MB.");
      e.target.value = "";
      return;
    }
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Please sign in first to upload your payment receipt.");
      return;
    }
    if (!file) {
      setError("Please attach your payment receipt or screenshot.");
      return;
    }
    if (!parentPhone.trim()) {
      setError("Please enter your phone / WhatsApp number.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("parentPhone", parentPhone.trim());
      fd.append("parentName", parentName.trim() || user.email || "Parent");
      fd.append("amount", settings.proPriceDisplay);

      const res = await fetch("/api/payment-submissions", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit payment proof.");
        return;
      }
      setSubmitted(true);
      setFile(null);
      setPreviewUrl(null);
    } catch {
      setError("Network error while submitting payment proof. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      {/* Header */}
      <section className="rounded-3xl border-4 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
          <Crown className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Growva Junior Pro Membership
        </h1>
        <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-4 py-1 text-base font-extrabold text-emerald-800">
          {settings.proPriceDisplay}
        </p>
      </section>

      {/* 1. Dynamic Bank Details Card */}
      <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-lg sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <Building2 className="h-5 w-5 text-indigo-600" aria-hidden />
          <h2 className="text-lg font-extrabold text-slate-800">
            Bank &amp; Mobile Wallet Details
          </h2>
        </div>

        {loadingSettings ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-12 rounded-2xl bg-slate-100" />
            <div className="h-12 rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                Bank Transfer
              </p>
              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Bank Name</span>
                  <p className="font-bold text-slate-800">{settings.bankName || "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">Account Title</span>
                  <p className="font-bold text-slate-800">{settings.accountTitle || "—"}</p>
                </div>
              </div>
              {settings.accountNumber ? (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-indigo-100">
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold text-slate-500">
                      Account Number / IBAN
                    </span>
                    <span className="block truncate font-mono text-sm font-extrabold text-slate-900">
                      {settings.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyValue("bank", settings.accountNumber)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-100 px-2.5 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-200"
                  >
                    {copiedKey === "bank" ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-amber-700">
                  Admin has not entered an account number yet.
                </p>
              )}
            </div>

            {(settings.jazzcashNumber || settings.easypaisaNumber) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {settings.jazzcashNumber && (
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5">
                    <div>
                      <p className="flex items-center gap-1 text-xs font-bold uppercase text-rose-700">
                        <Smartphone className="h-3.5 w-3.5" aria-hidden />
                        JazzCash
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-extrabold text-slate-900">
                        {settings.jazzcashNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyValue("jc", settings.jazzcashNumber)}
                      className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-200"
                    >
                      {copiedKey === "jc" ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}

                {settings.easypaisaNumber && (
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                    <div>
                      <p className="flex items-center gap-1 text-xs font-bold uppercase text-emerald-700">
                        <Smartphone className="h-3.5 w-3.5" aria-hidden />
                        EasyPaisa
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-extrabold text-slate-900">
                        {settings.easypaisaNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyValue("ep", settings.easypaisaNumber)}
                      className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                    >
                      {copiedKey === "ep" ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Bilingual Instructions Box (English & Urdu) */}
      <section className="space-y-3 rounded-3xl border-2 border-amber-200 bg-amber-50/70 p-5 shadow-md">
        <p className="text-sm font-semibold leading-relaxed text-slate-800">
          Please transfer the subscription amount to any of the accounts above and upload
          the payment receipt or screenshot below. Your Pro access will be activated as
          soon as possible, within 24 hours.
        </p>
        <hr className="border-amber-200/80" />
        <p
          dir="rtl"
          lang="ur"
          className="text-right text-base font-semibold leading-loose text-slate-900"
        >
          برائے مہربانی اوپر دیے گئے اکاؤنٹ پر فیس ٹرانسفر کریں اور ادائیگی کی رسید یا
          اسکرین شاٹ نیچے اپلوڈ کریں۔ آپ کا پرو ایکسس جلد از جلد 24 گھنٹوں کے اندر
          ایکٹیویٹ کر دیا جائے گا۔
        </p>
      </section>

      {/* 3. Success Banner or Proof Upload Form */}
      {submitted ? (
        <section
          role="status"
          className="rounded-3xl border-4 border-emerald-200 bg-emerald-50 p-6 text-center shadow-xl"
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
          <h2 className="mt-3 text-xl font-extrabold text-emerald-900">
            Payment proof submitted successfully! 🎉
          </h2>
          <p className="mt-2 text-sm font-semibold text-emerald-800">
            We are reviewing your receipt and will activate your Pro plan within 24 hours.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow hover:bg-emerald-700"
            >
              Back to Home
            </Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Submit Another Receipt
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-lg sm:p-6">
          <h2 className="text-lg font-extrabold text-slate-800">
            Upload Payment Receipt / Screenshot
          </h2>

          {!user ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Please sign in to submit your payment proof so we can activate Pro on your account.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-block rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow"
              >
                Sign In to Continue
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold uppercase text-slate-600">
                  Parent Name
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800"
                    placeholder="Your name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                  />
                </label>

                <label className="block text-xs font-bold uppercase text-slate-600">
                  Parent Contact / Phone Number *
                  <div className="relative mt-1">
                    <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden />
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800"
                      placeholder="e.g. 0300-1234567"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      required
                    />
                  </div>
                </label>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-600">
                  Receipt Image (.png, .jpg, .jpeg · max 5 MB) *
                </p>
                <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 p-6 text-center transition hover:bg-indigo-50">
                  <Upload className="h-7 w-7 text-indigo-600" aria-hidden />
                  <span className="text-sm font-bold text-slate-700">
                    {file ? file.name : "Tap to choose payment screenshot"}
                  </span>
                  <span className="text-xs text-slate-500">
                    PNG, JPG, or JPEG up to 5 MB
                  </span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                {previewUrl && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="mx-auto max-h-56 rounded-xl object-contain"
                    />
                  </div>
                )}
              </div>

              {error ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-600 px-5 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? "Uploading Receipt…" : "Submit Payment Proof"}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
