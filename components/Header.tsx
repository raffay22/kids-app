"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import ProfilePeekModal from "@/components/ProfilePeekModal";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getAvatarById } from "@/utils/avatars";
import { triggerHaptic } from "@/utils/haptics";

const HOLD_MS = 3000;
const springTransition = { type: "spring" as const, stiffness: 400, damping: 22 };

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeChild } = useActiveChild();
  const stars = activeChild?.stars ?? 0;
  const avatar = getAvatarById(activeChild?.avatar_id);
  const AvatarIcon = avatar.icon;
  const isHome = pathname === "/";

  // Avoid SSR/client nickname mismatch hydration overlay blocking taps.
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  const helloName = mounted ? (activeChild?.nickname ?? "Friend") : "Friend";

  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const unlockedRef = useRef(false);

  const clearHold = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    startRef.current = null;
    unlockedRef.current = false;
    setHolding(false);
    setHoldProgress(0);
  }, []);

  const tickHold = useCallback(() => {
    if (startRef.current == null) return;
    const elapsed = performance.now() - startRef.current;
    const next = Math.min(1, elapsed / HOLD_MS);
    setHoldProgress(next);

    if (next >= 1 && !unlockedRef.current) {
      unlockedRef.current = true;
      triggerHaptic(40);
      clearHold();
      router.push("/settings");
      return;
    }

    frameRef.current = requestAnimationFrame(tickHold);
  }, [clearHold, router]);

  const beginHold = () => {
    unlockedRef.current = false;
    startRef.current = performance.now();
    setHolding(true);
    setHoldProgress(0);
    triggerHaptic(20);
    frameRef.current = requestAnimationFrame(tickHold);
  };

  useEffect(() => () => clearHold(), [clearHold]);

  return (
    <>
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setProfileOpen(true);
            }}
            className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white/95 py-1 pl-1 pr-2.5 shadow-md outline-none ring-indigo-100 transition hover:border-indigo-400 hover:ring-2 focus-visible:ring-2 focus-visible:ring-indigo-400 sm:pr-3"
            title="Open profile"
            aria-label="Open profile"
          >
            <span
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm sm:h-11 sm:w-11 ${avatar.bgClass}`}
            >
              {avatar.initial ? (
                <span className={`text-base font-bold sm:text-lg ${avatar.iconClass}`}>
                  {avatar.initial}
                </span>
              ) : (
                <AvatarIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${avatar.iconClass}`} aria-hidden />
              )}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-white shadow">
                <User className="h-3 w-3" aria-hidden />
              </span>
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-indigo-600">
                Profile
              </span>
              <span className="block max-w-[7rem] truncate text-sm font-bold text-slate-800">
                {helloName}
              </span>
            </span>
          </button>
          <Link
            href="/"
            onClick={() => {
              if (!isHome) triggerHaptic(20);
            }}
            className="min-w-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:hidden"
            aria-label={isHome ? "Home" : "Back to home"}
          >
            <p className="truncate text-sm font-semibold text-slate-500">Hello</p>
            <p className="truncate text-lg font-bold text-slate-800">
              {helloName}
            </p>
          </Link>
          <Link
            href="/"
            onClick={() => {
              if (!isHome) triggerHaptic(20);
            }}
            className="hidden min-w-0 rounded-2xl px-1 outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:block"
            aria-label={isHome ? "Home" : "Back to home"}
          >
            <p className="text-xs font-semibold text-slate-500">Home</p>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <motion.div
            key={mounted ? stars : "stars-ssr"}
            initial={false}
            animate={{ scale: 1 }}
            transition={springTransition}
            className="flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-2 text-base font-bold text-amber-700 shadow-md sm:px-4"
            aria-label={`${stars} stars`}
          >
            <span aria-hidden>⭐️</span>
            <span suppressHydrationWarning>{stars}</span>
          </motion.div>

          <motion.button
            type="button"
            aria-label="Hold for 3 seconds to open parent settings"
            whileTap={{ scale: 0.92 }}
            transition={springTransition}
            onPointerDown={(event) => {
              event.preventDefault();
              beginHold();
            }}
            onPointerUp={clearHold}
            onPointerLeave={clearHold}
            onPointerCancel={clearHold}
            onContextMenu={(event) => event.preventDefault()}
            className="relative flex h-12 w-12 touch-none items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-white/90 text-slate-600 shadow-md"
          >
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 48 48"
              aria-hidden
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-indigo-500/20"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-indigo-500 transition-[stroke-dashoffset]"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - holdProgress)}`}
              />
            </svg>
            <Lock
              className={`relative h-5 w-5 ${holding ? "text-indigo-600" : "text-slate-600"}`}
              aria-hidden
            />
          </motion.button>
        </div>
      </div>
    </header>
    <ProfilePeekModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
