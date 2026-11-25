"use client";

import { useEffect, useRef, useState } from "react";

type PhonicsTileProps = {
  videoSrc: string;
  rows: number;
  cols: number;
  row: number;
  col: number;
  /** Full frame guide uses opacity; pieces use 1 */
  opacity?: number;
  className?: string;
  muted?: boolean;
};

/** Shows one grid cell of a phonics looping video via CSS crop. */
export default function PhonicsTile({
  videoSrc,
  rows,
  cols,
  row,
  col,
  opacity = 1,
  className = "",
  muted = true,
}: PhonicsTileProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const video = ref.current;
    if (!video) return;
    video.load();
    void video.play().catch(() => setFailed(true));
  }, [videoSrc]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} style={{ opacity }}>
      {!failed ? (
        <video
          ref={ref}
          src={videoSrc}
          muted={muted}
          loop
          playsInline
          autoPlay
          aria-hidden
          onError={() => setFailed(true)}
          className="pointer-events-none absolute max-w-none"
          style={{
            width: `${cols * 100}%`,
            height: `${rows * 100}%`,
            left: `${-col * 100}%`,
            top: `${-row * 100}%`,
            objectFit: "cover",
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-sky-100 text-2xl">
          ?
        </div>
      )}
    </div>
  );
}
