"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";

const BYPASS_ROUTES = [
  "/login",
  "/signup",
  "/sign-up",
  "/forgot-password",
  "/onboarding",
  "/terms",
  "/privacy",
  "/about",
  "/contact",
  "/settings",
  "/payment",
  "/checkout",
  "/upgrade",
];

const BYPASS_PREFIXES = ["/admin", "/brand-stats"];

export function onboardingSkipKey(userId: string): string {
  return `growva_onboarding_skipped_${userId}`;
}

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading } = useAuth();
  const { children: childList, loading: childLoading } = useActiveChild();

  const isBypassedRoute =
    BYPASS_ROUTES.includes(pathname) ||
    BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  const needsOnboarding = useMemo(() => {
    if (!user) return false;
    // Admins never get trapped in child onboarding
    if (profile?.is_admin) return false;
    // Respect explicit "Skip for now" choice so user can never get stuck in a redirect loop
    if (typeof window !== "undefined") {
      try {
        if (window.localStorage.getItem(onboardingSkipKey(user.id)) === "true") {
          return false;
        }
      } catch {
        // ignore storage errors
      }
    }
    if (childList.length === 0) return true;
    return childList.every((c) => !c.onboarding_completed);
  }, [user, profile?.is_admin, childList]);

  useEffect(() => {
    if (authLoading || childLoading) return;
    if (isBypassedRoute) return;
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [authLoading, childLoading, isBypassedRoute, needsOnboarding, router]);

  return <>{children}</>;
}
