"use client";

import { BADGE_CATALOG, TROPHY_CATALOG } from "@/utils/avatars";

type TrophyShowcaseProps = {
  unlockedTrophies: string[];
  unlockedBadges: string[];
};

export default function TrophyShowcase({
  unlockedTrophies,
  unlockedBadges,
}: TrophyShowcaseProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-800">Gold Accuracy Trophies 🏆</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {TROPHY_CATALOG.map((trophy) => {
            const unlocked = unlockedTrophies.includes(trophy.id);
            return (
              <div
                key={trophy.id}
                className={`rounded-2xl border-2 p-4 transition ${
                  unlocked
                    ? "border-amber-300 bg-amber-50/80 shadow-md"
                    : "border-slate-200 bg-slate-50/50 opacity-60 grayscale"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {trophy.emoji}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{trophy.label}</p>
                    <p className="text-xs text-slate-600">{trophy.description}</p>
                  </div>
                </div>
                {!unlocked && (
                  <p className="mt-2 text-xs font-medium text-slate-500">Locked</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-800">Milestone Badges 🎖️</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {BADGE_CATALOG.map((badge) => {
            const unlocked = unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border-2 p-4 transition ${
                  unlocked
                    ? "border-indigo-300 bg-indigo-50/80 shadow-md"
                    : "border-slate-200 bg-slate-50/50 opacity-60 grayscale"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {badge.emoji}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{badge.label}</p>
                    <p className="text-xs text-slate-600">{badge.description}</p>
                  </div>
                </div>
                {!unlocked && (
                  <p className="mt-2 text-xs font-medium text-slate-500">Locked</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
