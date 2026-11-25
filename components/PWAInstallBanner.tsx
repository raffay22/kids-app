"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STORAGE_KEY = "growva_pwa_banner_dismissed_v1";

export default function PWAInstallBanner() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);

    // 1. Check if already installed / standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Check localStorage dismissal
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed === "true") {
        return;
      }
    } catch {
      /* ignore storage errors */
    }

    setIsDismissed(false);

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // 4. Listen for beforeinstallprompt event on Android / Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsDismissed(true);
          try {
            localStorage.setItem(STORAGE_KEY, "true");
          } catch {
            /* ignore */
          }
        }
        setDeferredPrompt(null);
      } catch {
        /* fallback to guide */
      }
      return;
    }

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    // General fallback instructions for non-prompted browsers
    setShowIOSModal(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
  };

  if (!mounted || isDismissed) {
    return null;
  }

  return (
    <>
      <section
        aria-label="App installation promo"
        className="relative overflow-hidden rounded-3xl border-2 border-indigo-200/80 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-4 sm:p-5 text-white shadow-xl transition-all"
      >
        {/* Playful background decorative glow */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-indigo-500/30 blur-2xl" />

        <div className="relative flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          {/* App Branding & Copy */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 p-1 shadow-md sm:h-14 sm:w-14">
              <Image
                src="/icons/pwa-192.png"
                alt="Growva Junior Logo"
                width={56}
                height={56}
                className="h-full w-full object-cover rounded-xl"
                priority
              />
            </div>
            <div className="min-w-0 pr-6 sm:pr-0">
              <h2 className="flex items-center gap-1.5 text-base font-extrabold sm:text-lg tracking-tight">
                <span>📲 Install Growva Junior on Mobile</span>
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-indigo-100/90 leading-snug">
                Play Store ke baghair 1-Tap install • Super fast &amp; distraction-free full screen!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-600 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-black text-white shadow-lg transition active:scale-95 hover:from-emerald-400 hover:to-teal-400"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>Install Now / انسٹال کریں</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="absolute top-2.5 right-2.5 sm:static flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-indigo-200 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Gentle Instructions Modal (Especially for iOS/Safari or manual add) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl border-2 border-indigo-100 bg-white p-6 text-center text-slate-800 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Share className="h-7 w-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Install to Home Screen 📲
            </h3>

            <div className="mt-3 space-y-2.5 rounded-2xl bg-indigo-50/70 p-3.5 text-left text-xs sm:text-sm font-semibold text-indigo-950">
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  1
                </span>
                <span>
                  Tap the browser <strong className="font-extrabold text-indigo-700">Share button</strong> (at the bottom or top bar).
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  2
                </span>
                <span>
                  Scroll and select <strong className="font-extrabold text-indigo-700">&apos;Add to Home Screen&apos;</strong>.
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                  3
                </span>
                <span>
                  Tap <strong className="font-extrabold text-emerald-700">&apos;Add&apos;</strong> to launch anytime with zero distractions!
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full rounded-2xl border-b-4 border-indigo-700 bg-indigo-600 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
            >
              Got it! / سمجھ گیا
            </button>
          </div>
        </div>
      )}
    </>
  );
}
