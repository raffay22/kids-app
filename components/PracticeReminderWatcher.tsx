"use client";

import { useEffect } from "react";
import { useActiveChild } from "@/hooks/useActiveChild";
import { maybeShowPracticeReminder } from "@/utils/notifications";

/** Checks local daily streak reminder on mount and when the tab becomes visible. */
export default function PracticeReminderWatcher() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id ?? null;

  useEffect(() => {
    void maybeShowPracticeReminder(childId);

    const onVis = () => {
      if (document.visibilityState === "visible") {
        void maybeShowPracticeReminder(childId);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [childId]);

  return null;
}
