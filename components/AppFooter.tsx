"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ABOUT_HREF,
  CONTACT_HREF,
  GROWVA_BRAND,
  PROGRESS_TRACKING_HREF,
  PROGRESS_TRACKING_LABEL,
  WHATSAPP_CHANNEL_URL,
} from "@/utils/siteLinks";

const FOOTER_LINKS = [
  { href: ABOUT_HREF, label: "About" },
  { href: CONTACT_HREF, label: "Contact" },
  { href: PROGRESS_TRACKING_HREF, label: PROGRESS_TRACKING_LABEL },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/settings", label: "Settings" },
] as const;

export default function AppFooter() {
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
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{GROWVA_BRAND}</p>
            <p className="text-xs text-slate-500">Kids Learning App</p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-slate-900 hover:underline"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 hover:underline"
            >
              WhatsApp
            </a>
          </nav>
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
            © {new Date().getFullYear()} {GROWVA_BRAND}
          </p>
        </div>
      </div>
    </footer>
  );
}
