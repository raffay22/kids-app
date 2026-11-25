"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Settings, ShieldCheck, Sparkles, User } from "lucide-react";
import ParentalGate from "@/components/ParentalGate";
import ProfilePeekModal from "@/components/ProfilePeekModal";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useStreak } from "@/hooks/useStreak";
import { getAvatarById } from "@/utils/avatars";
import { triggerHaptic } from "@/utils/haptics";
import { speakEnglish } from "@/utils/speech";

const springTransition = { type: "spring" as const, stiffness: 400, damping: 22 };

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();
  const { activeChild } = useActiveChild();
  const { currentStreak, refresh: refreshStreak } = useStreak();
  const stars = activeChild?.stars ?? 0;
  const trophiesCount = activeChild?.unlocked_trophies?.length ?? 0;
  const avatar = getAvatarById(activeChild?.avatar_id);
  const AvatarIcon = avatar.icon;
  const isHome = pathname === "/";
  const isSettings = pathname === "/settings";
  const isUpgrade = pathname === "/upgrade";

  // Avoid SSR/client nickname mismatch hydration overlay blocking taps.
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsGateOpen, setSettingsGateOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  const helloName = mounted ? (activeChild?.nickname ?? "Friend") : "Friend";

  return (
    <>
    <header className="sticky top-0 z-20 w-full max-w-full overflow-x-clip border-b border-white/70 bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur-xl sm:px-6 sm:py-3">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:flex-1 sm:gap-3">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/"
            onClick={() => {
              if (!isHome) triggerHaptic(20);
            }}
            className="flex shrink-0 items-center rounded-xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-400"
            title="Growva Junior Studio"
            aria-label="Growva Junior Studio Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/growvajuniorstudio-logo-transparent.png"
              alt="Growva Junior Studio"
              className="h-9 w-auto object-contain sm:h-12"
            />
          </Link>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setProfileOpen(true);
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-indigo-200 bg-white/95 p-0.5 shadow-sm outline-none ring-indigo-100 transition hover:border-indigo-400 hover:ring-2 focus-visible:ring-2 focus-visible:ring-indigo-400 sm:rounded-2xl sm:py-1 sm:pl-1 sm:pr-2.5"
            title="Open profile"
            aria-label="Open profile"
          >
            <span
              className={`relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br shadow-sm sm:h-8 sm:w-8 sm:rounded-xl ${avatar.bgClass}`}
            >
              {avatar.initial ? (
                <span className={`text-xs font-bold sm:text-sm ${avatar.iconClass}`}>
                  {avatar.initial}
                </span>
              ) : (
                <AvatarIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${avatar.iconClass}`} aria-hidden />
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-indigo-500 text-white shadow sm:h-4 sm:w-4">
                <User className="h-2 w-2 sm:h-2.5 sm:w-2.5" aria-hidden />
              </span>
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block text-[9px] font-extrabold uppercase tracking-wide text-indigo-600">
                Profile
              </span>
              <span className="block max-w-[6.5rem] truncate text-xs font-bold text-slate-800">
                {helloName}
              </span>
            </span>
          </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/"
            onClick={() => {
              if (!isHome) triggerHaptic(20);
            }}
            aria-label="Go to dashboard home"
            title="Home"
            className={`inline-flex h-8 w-8 items-center justify-center gap-1 rounded-xl border-b-2 p-0 text-xs font-extrabold shadow-sm transition active:translate-y-0.5 sm:h-auto sm:w-auto sm:gap-1.5 sm:rounded-2xl sm:border-b-4 sm:px-4 sm:py-2 sm:text-sm sm:shadow-md ${
              isHome
                ? "border-sky-300 bg-sky-500 text-white"
                : "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"
            }`}
          >
            <Home className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setSettingsGateOpen(true);
            }}
            aria-label="Parent settings"
            title="Settings"
            className={`inline-flex h-8 w-8 items-center justify-center gap-1 rounded-xl border-b-2 p-0 text-xs font-extrabold shadow-sm transition active:translate-y-0.5 sm:h-auto sm:w-auto sm:gap-1.5 sm:rounded-2xl sm:border-b-4 sm:px-3 sm:py-2 sm:text-sm sm:shadow-md ${
              isSettings
                ? "border-violet-300 bg-violet-600 text-white"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Settings className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {profile?.is_admin ? (
            <Link
              href="/admin"
              onClick={() => triggerHaptic(20)}
              aria-label="Admin Dashboard"
              title="Admin Portal"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border-b-2 border-rose-400 bg-rose-500 px-2.5 text-xs font-black text-white shadow-sm transition active:translate-y-0.5 hover:bg-rose-600 sm:h-auto sm:rounded-2xl sm:border-b-4 sm:px-3.5 sm:py-2 sm:text-sm sm:shadow-md"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          ) : (
            <Link
              href="/upgrade"
              onClick={() => triggerHaptic(20)}
              aria-label="Upgrade to Pro"
              title="Upgrade to Pro"
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border-b-2 px-2.5 text-xs font-black shadow-sm transition active:translate-y-0.5 sm:h-auto sm:rounded-2xl sm:border-b-4 sm:px-3.5 sm:py-2 sm:text-sm sm:shadow-md ${
                isUpgrade
                  ? "border-amber-600 bg-amber-500 text-white"
                  : "border-amber-400 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-200"
              }`}
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Upgrade</span>
            </Link>
          )}
          </div>
        </div>

        {/* Streak, Stars & Trophies — side-by-side 3-column grid on mobile, inline on desktop */}
        <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:w-auto sm:shrink-0 sm:items-center sm:gap-2.5">
          <motion.button
            type="button"
            key={mounted ? `streak-${currentStreak}` : "streak-ssr"}
            initial={false}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 0.45, times: [0, 0.4, 1], ease: "easeOut" }}
            onClick={() => {
              triggerHaptic(25);
              void refreshStreak();
              const n = Math.max(0, currentStreak);
              speakEnglish(
                n <= 0
                  ? "Start your streak today! Keep going!"
                  : `${n} Day Streak! Keep going!`,
              );
            }}
            className="flex items-center justify-center gap-1 rounded-full border-2 border-orange-300 bg-gradient-to-r from-orange-100 to-amber-100 px-2.5 py-1 text-xs font-extrabold text-orange-700 shadow-sm sm:px-3 sm:py-2 sm:text-sm sm:shadow-md"
            aria-label={`${currentStreak} day streak`}
            title="Practice streak"
          >
            <span aria-hidden className="text-sm drop-shadow sm:text-base">
              🔥
            </span>
            <span suppressHydrationWarning>{currentStreak}</span>
          </motion.button>

          <motion.div
            key={mounted ? stars : "stars-ssr"}
            initial={false}
            animate={{ scale: 1 }}
            transition={springTransition}
            className="flex items-center justify-center gap-1 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm sm:gap-1.5 sm:px-3.5 sm:py-2 sm:text-base sm:shadow-md"
            aria-label={`${stars} stars`}
          >
            <span aria-hidden className="text-sm sm:text-base">⭐️</span>
            <span suppressHydrationWarning>{stars}</span>
          </motion.div>

          <motion.button
            type="button"
            key={mounted ? `trophies-${trophiesCount}` : "trophies-ssr"}
            initial={false}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 0.45, times: [0, 0.4, 1], ease: "easeOut" }}
            onClick={() => {
              triggerHaptic(25);
              speakEnglish(
                trophiesCount <= 0
                  ? "Keep up your streak and milestones to earn your first trophy!"
                  : `${trophiesCount} ${trophiesCount === 1 ? "trophy" : "trophies"} earned! Amazing job!`,
              );
            }}
            className="flex items-center justify-center gap-1 rounded-full border-2 border-yellow-400 bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-200 px-2.5 py-1 text-xs font-extrabold text-amber-800 shadow-sm sm:gap-1.5 sm:px-3.5 sm:py-2 sm:text-base sm:shadow-md"
            aria-label={`${trophiesCount} trophies`}
            title="Milestone Trophies"
          >
            <span aria-hidden className="text-sm drop-shadow sm:text-base">
              🏆
            </span>
            <span suppressHydrationWarning>{trophiesCount}</span>
          </motion.button>
        </div>
      </div>
    </header>
    <ProfilePeekModal
      open={profileOpen}
      onClose={() => setProfileOpen(false)}
      requireGate
    />
    <ParentalGate
      open={settingsGateOpen}
      onClose={() => setSettingsGateOpen(false)}
      onSuccess={() => {
        setSettingsGateOpen(false);
        router.push("/settings");
      }}
      title="Parent Check — Settings"
    />
    </>
  );
}
