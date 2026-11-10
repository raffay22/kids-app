"use client";

import { useCallback, useState } from "react";
import { Trophy, Volume2 } from "lucide-react";
import PhonicsSoundBreakdown from "@/components/PhonicsSoundBreakdown";
import AlphabetTracingCanvas from "@/components/AlphabetTracingCanvas";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { createClient } from "@/utils/supabase/client";
import { logProgress } from "@/utils/logProgress";
import { playDing, starShower } from "@/utils/celebrate";
import type { PhonicsBlend } from "@/utils/phonics";

const PHONICS_CHAMPION_TROPHY = "phonics-champion";
const STARS_AWARD = 10;

export default function PhonicsHub() {
  const { user, profile, refreshProfile } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const [activeBlend, setActiveBlend] = useState<PhonicsBlend | null>(null);
  const [completionMsg, setCompletionMsg] = useState<string | null>(null);

  const handleTracingComplete = useCallback(async () => {
    if (!activeBlend) return;

    starShower();
    playDing();
    setCompletionMsg(`Phonics Champion! +${STARS_AWARD} stars`);

    if (user && activeChild) {
      await logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/phonics",
        attempt_type: "tap",
        target_word: `trace-${activeBlend.letter}`,
        is_correct: true,
      });

      try {
        const supabase = createClient();
        const newStars = (activeChild.stars ?? 0) + STARS_AWARD;
        const trophies = activeChild.unlocked_trophies ?? [];

        await supabase
          .from("children")
          .update({
            stars: newStars,
            unlocked_trophies: trophies.includes(PHONICS_CHAMPION_TROPHY)
              ? trophies
              : [...trophies, PHONICS_CHAMPION_TROPHY],
          })
          .eq("id", activeChild.id);

        const profileTrophies = profile?.unlocked_trophies ?? [];
        if (!profileTrophies.includes(PHONICS_CHAMPION_TROPHY)) {
          await supabase
            .from("profiles")
            .update({ unlocked_trophies: [...profileTrophies, PHONICS_CHAMPION_TROPHY] })
            .eq("id", user.id);
        }

        await refreshChildren();
        await refreshProfile();
      } catch {
        // offline — stars sync on refresh
      }
    }
  }, [user, activeChild, activeBlend, profile, refreshChildren, refreshProfile]);

  return (
    <div className="space-y-6">
      <section className="kid-card border-purple-200 bg-gradient-to-r from-purple-50 via-white to-pink-50 p-5 sm:p-7">
        <p className="flex items-center gap-1.5 text-base font-semibold text-purple-500">
          <Volume2 className="h-4 w-4" aria-hidden />
          Ages 1–3 · Phonics Blends
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">Sound, Speak & Trace</h2>
        <p className="mt-1.5 text-base text-slate-600">
          Tap cards to hear blends at a gentle pace. Trace letters to unlock the Phonics Champion trophy!
        </p>
      </section>

      <PhonicsSoundBreakdown onBlendChange={setActiveBlend} />

      {activeBlend && (
        <AlphabetTracingCanvas
          letter={activeBlend.letter}
          blend={activeBlend.blend}
          exampleWord={activeBlend.example_word}
          onComplete={() => void handleTracingComplete()}
        />
      )}

      {completionMsg && (
        <p className="flex items-center justify-center gap-2 text-center text-lg font-bold text-amber-700">
          <Trophy className="h-5 w-5" aria-hidden />
          {completionMsg}
        </p>
      )}
    </div>
  );
}
