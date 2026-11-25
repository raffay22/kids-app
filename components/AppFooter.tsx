"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ParentalGate from "@/components/ParentalGate";
import { triggerHaptic } from "@/utils/haptics";
import {
  ABOUT_HREF,
  CONTACT_HREF,
  GROWVA_BRAND,
  GROWVA_BRAND_URL,
  PROGRESS_TRACKING_HREF,
  PROGRESS_TRACKING_LABEL,
  WHATSAPP_CHANNEL_URL,
  YOUTUBE_CHANNEL_URL,
} from "@/utils/siteLinks";

const FOOTER_LINKS = [
  {
    href: ABOUT_HREF,
    label: "About",
    className:
      "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-500 hover:text-white hover:ring-violet-500 hover:shadow-violet-200",
  },
  {
    href: CONTACT_HREF,
    label: "Contact",
    className:
      "bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-500 hover:text-white hover:ring-sky-500 hover:shadow-sky-200",
  },
  {
    href: PROGRESS_TRACKING_HREF,
    label: PROGRESS_TRACKING_LABEL,
    className:
      "bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-500 hover:text-white hover:ring-indigo-500 hover:shadow-indigo-200",
  },
  {
    href: "/shop",
    label: "Parent Shop",
    className:
      "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 hover:bg-fuchsia-500 hover:text-white hover:ring-fuchsia-500 hover:shadow-fuchsia-200",
  },
  {
    href: "/worksheets",
    label: "Activity Sheets",
    className:
      "bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-500 hover:text-white hover:ring-amber-500 hover:shadow-amber-200",
  },
  {
    href: "/signup",
    label: "Sign Up",
    className:
      "bg-teal-50 text-teal-700 ring-teal-200 hover:bg-teal-500 hover:text-white hover:ring-teal-500 hover:shadow-teal-200",
  },
  {
    href: "/privacy",
    label: "Privacy",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-500 hover:text-white hover:ring-emerald-500 hover:shadow-emerald-200",
  },
  {
    href: "/terms",
    label: "Terms",
    className:
      "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-500 hover:text-white hover:ring-rose-500 hover:shadow-rose-200",
  },
] as const;

const FOOTER_LINK_BASE =
  "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:translate-y-0 active:scale-100";

export default function AppFooter() {
  const router = useRouter();
  const [settingsGateOpen, setSettingsGateOpen] = useState(false);
  const [youtubeGateOpen, setYoutubeGateOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const onSubscribe = (event: FormEvent) => {
    event.preventDefault();
    const clean = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    if (!valid) {
      setStatus("error");
      return;
    }
    try {
      const key = "kids-app-newsletter-emails-v1";
      const prev = JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[];
      const next = Array.from(new Set([...prev, clean.toLowerCase()]));
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // local storage optional
    }
    setStatus("ok");
    setEmail("");
  };

  return (
    <footer className="mt-auto w-full max-w-full overflow-x-clip border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/growvajuniorstudio-logo-transparent.png"
              alt="Growva Junior Studio logo"
              className="h-16 w-auto shrink-0 object-contain sm:h-20"
            />
            <div className="min-w-0">
              <p className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-base font-extrabold text-transparent transition group-hover:from-violet-600 group-hover:via-fuchsia-500 group-hover:to-amber-500 sm:text-lg">
                Growva Junior
              </p>
              <a
                href={GROWVA_BRAND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-xs font-bold text-transparent transition hover:underline group-hover:from-emerald-500 group-hover:to-sky-500 sm:text-sm"
              >
                {GROWVA_BRAND}
              </a>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-2"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${FOOTER_LINK_BASE} ${link.className}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                setSettingsGateOpen(true);
              }}
              className={`${FOOTER_LINK_BASE} bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-800 hover:text-white hover:ring-slate-800 hover:shadow-slate-300`}
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                setYoutubeGateOpen(true);
              }}
              className={`${FOOTER_LINK_BASE} bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-600 hover:text-white hover:ring-rose-600 hover:shadow-rose-200`}
            >
              YouTube
            </button>
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${FOOTER_LINK_BASE} bg-green-50 text-green-700 ring-green-200 hover:bg-green-500 hover:text-white hover:ring-green-500 hover:shadow-green-200`}
            >
              WhatsApp
            </a>
          </nav>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-600">
          <p>
            Growva Junior is proudly built and backed by{" "}
            <a
              href={GROWVA_BRAND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-600 hover:underline"
            >
              {GROWVA_BRAND}
            </a>
            , dedicated to creating smart, purposeful digital products for modern families
            and early learners.
          </p>
          <p className="mt-1.5">
            We combine technology, sensory-friendly design, and research-backed learning
            tools to turn everyday screen time into meaningful growth for children
            worldwide.
          </p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            <p className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-800">Parent Entity:</span>
              <a
                href={GROWVA_BRAND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:underline"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/growvabusiness-logo.png"
                  alt="Growva Business logo"
                  className="h-5 w-auto shrink-0 object-contain"
                />
                <span>{GROWVA_BRAND}</span>
              </a>
            </p>
            <p>
              <span className="font-bold text-slate-800">Official Kids Platform:</span>{" "}
              <a
                href="https://growvajunior.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 hover:underline"
              >
                growvajunior.com
              </a>
            </p>
            <p>
              <span className="font-bold text-slate-800">YouTube Studio:</span>{" "}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  setYoutubeGateOpen(true);
                }}
                className="font-semibold text-rose-600 hover:underline"
              >
                Growva Junior Studio
              </button>
            </p>
            <p>
              <span className="font-bold text-slate-800">Parent &amp; Support Contact:</span>{" "}
              <a
                href="mailto:support@growvabusiness.com"
                className="font-semibold text-indigo-600 hover:underline"
              >
                support@growvabusiness.com
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            onSubmit={onSubscribe}
            className="flex max-w-md flex-1 items-center gap-2"
            aria-label="Newsletter signup"
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email for parenting tips
            </label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email for tips"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-400"
              required
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Subscribe
            </button>
            {status === "ok" && (
              <span className="sr-only" role="status">
                Subscribed
              </span>
            )}
            {status === "error" && (
              <span className="text-xs text-rose-600" role="status">
                Invalid email
              </span>
            )}
          </form>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()}{" "}
            <a
              href={GROWVA_BRAND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 hover:underline"
            >
              {GROWVA_BRAND}
            </a>
          </p>
        </div>
      </div>
      <ParentalGate
        open={settingsGateOpen}
        onClose={() => setSettingsGateOpen(false)}
        onSuccess={() => {
          setSettingsGateOpen(false);
          router.push("/settings");
        }}
        title="Parent Check — Settings"
      />
      <ParentalGate
        open={youtubeGateOpen}
        onClose={() => setYoutubeGateOpen(false)}
        onSuccess={() => {
          setYoutubeGateOpen(false);
          window.open(YOUTUBE_CHANNEL_URL, "_blank", "noopener,noreferrer");
        }}
        title="Parent Check — YouTube Channel"
      />
    </footer>
  );
}
