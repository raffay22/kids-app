"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Lock, Sparkles } from "lucide-react";
import { useProAccess } from "@/hooks/useProAccess";

type ProGameGuardProps = {
  gameTitle: string;
  children: React.ReactNode;
};

/**
 * Protects 100%-paid game routes from direct URL navigation by free users.
 */
export default function ProGameGuard({ gameTitle, children }: ProGameGuardProps) {
  const router = useRouter();
  const { isPro, loading } = useProAccess();

  if (loading) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-4 border-white bg-white/95 p-8 text-center shadow-xl">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <p className="mt-3 text-sm font-bold text-slate-600">Checking access…</p>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="mx-auto my-8 max-w-md rounded-[2rem] border-4 border-amber-200 bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 text-white shadow-lg">
          <Crown className="h-8 w-8" aria-hidden />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-800">
          <Lock className="h-3 w-3" aria-hidden />
          Pro Exclusive Game
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-800">
          Unlock Pro to Play {gameTitle}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          {gameTitle} is part of Growva Junior Pro. Upgrade your membership to unlock full unlimited play!
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/upgrade")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-5 py-3.5 text-base font-extrabold text-white shadow-lg"
          >
            <Sparkles className="h-5 w-5" aria-hidden />
            Unlock Pro Membership
          </button>
          <button
            type="button"
            onClick={() => router.push("/games")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
