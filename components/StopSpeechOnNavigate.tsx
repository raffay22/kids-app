"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { stopKidsSpeech } from "@/utils/speech";

/**
 * Stops Web Speech immediately when the child leaves a page,
 * even if the current sentence is unfinished.
 * Skips the first mount so the new page can still greet.
 */
export default function StopSpeechOnNavigate() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (previousPath.current === null) {
      previousPath.current = pathname;
      return;
    }
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    stopKidsSpeech();
  }, [pathname]);

  useEffect(() => {
    const stop = () => stopKidsSpeech();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
    };
    window.addEventListener("pagehide", stop);
    window.addEventListener("beforeunload", stop);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", stop);
      window.removeEventListener("beforeunload", stop);
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  return null;
}
