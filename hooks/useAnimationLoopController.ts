"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAnimationLoopCap } from "@/utils/sensoryPrefs";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";

/**
 * Caps video/Lottie loops:
 * - reduced motion OFF → max 3 loops, then freeze on a calm frame
 * - reduced motion ON → loopCount = 0 (static only, never play)
 */
export function useAnimationLoopController(mediaKey?: string) {
  const { prefs } = useSensoryPrefs();
  const loopCap = getAnimationLoopCap(prefs);
  const loopsRef = useRef(0);
  const [frozen, setFrozen] = useState(loopCap === 0);
  const [shouldAutoplay, setShouldAutoplay] = useState(loopCap > 0);

  useEffect(() => {
    loopsRef.current = 0;
    const cap = getAnimationLoopCap(prefs);
    setFrozen(cap === 0);
    setShouldAutoplay(cap > 0);
  }, [mediaKey, prefs.reducedMotion, prefs]);

  const onLoopOrEnded = useCallback(
    (video: HTMLVideoElement | null) => {
      const cap = getAnimationLoopCap();
      if (!video || cap === 0) {
        video?.pause();
        setFrozen(true);
        return;
      }

      loopsRef.current += 1;
      if (loopsRef.current >= cap) {
        video.pause();
        // Freeze near the end for a calm static frame.
        try {
          if (Number.isFinite(video.duration) && video.duration > 0.05) {
            video.currentTime = Math.max(0, video.duration - 0.05);
          }
        } catch {
          // ignore seek errors
        }
        setFrozen(true);
        setShouldAutoplay(false);
      }
    },
    [],
  );

  const bindVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) return;
      const cap = getAnimationLoopCap();
      if (cap === 0) {
        video.loop = false;
        video.autoplay = false;
        video.pause();
        try {
          video.currentTime = 0;
        } catch {
          // ignore
        }
        setFrozen(true);
        return;
      }

      video.loop = false;
      video.autoplay = true;
      const handleEnded = () => onLoopOrEnded(video);
      video.addEventListener("ended", handleEnded);
      void video.play().catch(() => undefined);

      return () => {
        video.removeEventListener("ended", handleEnded);
      };
    },
    [onLoopOrEnded],
  );

  return {
    loopCap,
    reducedMotion: prefs.reducedMotion,
    frozen,
    shouldAutoplay,
    bindVideo,
    onLoopOrEnded,
  };
}
