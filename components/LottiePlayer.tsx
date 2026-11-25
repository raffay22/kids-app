"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type LottiePlayerProps = {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  onFail?: () => void;
};

/**
 * Loads a Lottie JSON from /public (or any URL) and plays it.
 * Falls back via onFail so the parent can swap to an SVG scene.
 */
export default function LottiePlayer({
  src,
  className = "",
  loop = true,
  autoplay = true,
  onFail,
}: LottiePlayerProps) {
  const [data, setData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setFailed(false);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          onFail?.();
        }
      });

    return () => {
      cancelled = true;
    };
    // intentionally omit onFail from deps to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (failed || !data) {
    return (
      <div className={`flex items-center justify-center ${className}`} aria-hidden>
        <div className="h-10 w-10 animate-pulse rounded-full bg-amber-200/70" />
      </div>
    );
  }

  return (
    <Lottie
      animationData={data}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
