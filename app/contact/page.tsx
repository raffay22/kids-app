"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Home, Mail, MessageCircle } from "lucide-react";
import {
  GROWVA_BRAND,
  WHATSAPP_CHANNEL_URL,
  WHATSAPP_FOLLOW_LINE,
} from "@/utils/siteLinks";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Kids Learning App — message from ${name || "parent"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:hello@growvabusiness.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-xl backdrop-blur-xl"
      >
        <Home className="h-4 w-4" aria-hidden />
        Home
      </Link>

      <section className="rounded-3xl border-4 border-white bg-white/95 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-wide text-violet-600">
          Contact
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-800">
          Talk with {GROWVA_BRAND}
        </h1>
        <p className="mt-2 text-base font-medium text-slate-600">
          Questions about the app, therapy tools, or parenting tips? Send a note
          — we&apos;re happy to help.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="contact-name" className="mb-1 block text-sm font-bold text-slate-700">
              Your name
            </label>
            <input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 px-4 py-3 font-semibold text-slate-800 outline-none focus:border-indigo-400"
              required
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1 block text-sm font-bold text-slate-700">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 px-4 py-3 font-semibold text-slate-800 outline-none focus:border-indigo-400"
              required
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1 block text-sm font-bold text-slate-700">
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 px-4 py-3 font-semibold text-slate-800 outline-none focus:border-indigo-400"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Send message
          </button>
          {sent && (
            <p className="text-sm font-bold text-emerald-700" role="status">
              Opening your email app…
            </p>
          )}
        </form>

        <div className="mt-8 rounded-2xl border-2 border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-sm font-extrabold text-emerald-950">
            {WHATSAPP_FOLLOW_LINE}
          </p>
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-md"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Follow on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
