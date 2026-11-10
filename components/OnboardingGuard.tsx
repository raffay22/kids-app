"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";

const BYPASS_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/onboarding",
  "/terms",
  "/privacy",
];

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { children: childList, loading: childLoading } = useActiveChild();

  const needsOnboarding = useMemo(() => {
    if (!user) return false;
    if (childList.length === 0) return true;
    return childList.every((c) => !c.onboarding_completed);
  }, [user, childList]);

  useEffect(() => {
    if (authLoading || childLoading) return;
    if (BYPASS_ROUTES.includes(pathname)) return;
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [authLoading, childLoading, needsOnboarding, pathname, router]);

  return <>{children}</>;
}
