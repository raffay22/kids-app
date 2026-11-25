"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OnboardingWizard from "@/components/OnboardingWizard";
import { onboardingSkipKey } from "@/components/OnboardingGuard";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { mergeGuestProgressToAccount } from "@/utils/guestProgress";
import { createClient } from "@/utils/supabase/client";
import type { AgeGroup } from "@/types/database";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { children: existingChildren, refreshChildren } = useActiveChild();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center canvas-bg p-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-slate-600">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center canvas-bg p-4 text-center">
        <div className="w-full max-w-md rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-slate-800">Please Sign In First</h2>
          <p className="mt-2 text-sm text-slate-600">
            You need to be signed in to set up your child&apos;s learning profile. If you recently signed up, please check your email to confirm your account or sign in below.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const markSkippedLocally = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(onboardingSkipKey(user.id), "true");
      } catch {
        // ignore storage errors
      }
    }
  };

  const createChild = async (payload: {
    nickname: string;
    avatarId: string | null;
    ageGroup: AgeGroup | null;
  }) => {
    // Always mark skipped locally first so OnboardingGuard never bounces the user back here
    markSkippedLocally();

    const targetRoute = profile?.is_admin ? "/admin" : "/";

    if (!supabase) {
      router.replace(targetRoute);
      return;
    }

    try {
      // Ensure parent profile row exists before inserting into children (prevents FK errors)
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          parent_email: user.email ?? null,
        },
        { onConflict: "id" },
      );

      // If a child already exists, mark it completed instead of creating duplicates on skip
      if (existingChildren.length > 0 && payload.nickname === "Explorer") {
        await supabase
          .from("children")
          .update({ onboarding_completed: true })
          .eq("id", existingChildren[0].id);
      } else {
        const { data: inserted } = await supabase
          .from("children")
          .insert({
            parent_user_id: user.id,
            nickname: payload.nickname,
            avatar_id: payload.avatarId,
            age_group: payload.ageGroup,
            onboarding_completed: true,
          })
          .select("id")
          .single();

        if (inserted?.id) {
          await mergeGuestProgressToAccount(supabase, user.id, inserted.id as string);
        }
      }

      await refreshChildren();
    } catch {
      // Never block navigation or crash if Supabase insert/refresh fails transiently
    }

    router.replace(targetRoute);
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
