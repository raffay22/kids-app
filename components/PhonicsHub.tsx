"use client";

import { useCallback, useState } from "react";
import { Trophy, Volume2 } from "lucide-react";
import PhonicsSoundBreakdown from "@/components/PhonicsSoundBreakdown";
import AlphabetTracingCanvas from "@/components/AlphabetTracingCanvas";
import SlowSpeedControl from "@/components/SlowSpeedControl";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { createClient } from "@/utils/supabase/client";
import { handleGuestAward } from "@/utils/awardProgress";
import { logProgress } from "@/utils/logProgress";
import { playDing, starShower } from "@/utils/celebrate";
import { recordPhonicsLetterCompleted } from "@/utils/trophies";
import type { PhonicsBlend } from "@/utils/phonics";

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
    const completedLetters = await recordPhonicsLetterCompleted(activeBlend.letter, {
      userId: user?.id,
      childId: activeChild?.id,
      existingTrophies: activeChild?.unlocked_trophies,
    });
    setCompletionMsg(
      completedLetters >= 26
        ? `Phonics Mastery (26/26 A–Z)! +${STARS_AWARD} stars`
        : `Great tracing ${activeBlend.letter}! (${completedLetters}/26 A–Z) · +${STARS_AWARD} stars`,
    );

    if (
      handleGuestAward({
        userId: user?.id,
        childId: activeChild?.id,
        deltaStars: STARS_AWARD,
      })
    ) {
      return;
    }

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

        await supabase
          .from("children")
          .update({
            stars: newStars,
          })
          .eq("id", activeChild.id);

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
          Tap cards to hear blends, pick any A–Z letter to jump ahead, then trace to unlock the Phonics Champion trophy!
        </p>
      </section>

      <SlowSpeedControl label="Phonics voice speed" />

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
