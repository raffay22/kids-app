"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import OnboardingWizard from "@/components/OnboardingWizard";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { createClient } from "@/utils/supabase/client";
import type { AgeGroup } from "@/types/database";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshChildren } = useActiveChild();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center canvas-bg p-4">
        <p className="text-slate-600">Please sign in first.</p>
      </div>
    );
  }

  const createChild = async (payload: {
    nickname: string;
    avatarId: string | null;
    ageGroup: AgeGroup | null;
  }) => {
    if (!supabase) return;

    await supabase.from("children").insert({
      parent_user_id: user.id,
      nickname: payload.nickname,
      avatar_id: payload.avatarId,
      age_group: payload.ageGroup,
      onboarding_completed: true,
    });

    await refreshChildren();
    router.push("/");
    router.refresh();
  };

  const handleComplete = async (data: {
    nickname: string;
    avatarId: string;
    ageGroup: AgeGroup;
  }) => {
    await createChild({
      nickname: data.nickname,
      avatarId: data.avatarId,
      ageGroup: data.ageGroup,
    });
  };

  const handleSkip = async () => {
    await createChild({
      nickname: "Explorer",
      avatarId: "cat-indigo",
      ageGroup: null,
    });
  };

  return (
    <OnboardingWizard
      onComplete={async (data) => {
        if (data.skipped) {
          await handleSkip();
        } else {
          await handleComplete(data);
        }
      }}
      onSkip={handleSkip}
    />
  );
}
