"use client";

import { useEffect, useRef, useState } from "react";

type SentenceMediaThumbProps = {
  imageSrc?: string | null;
  videoSrc?: string | null;
  alt: string;
  className?: string;
};

/** Small matched 3D still/video for sentence cards (keeps layout compact). */
export default function SentenceMediaThumb({
  imageSrc,
  videoSrc,
  alt,
  className = "",
}: SentenceMediaThumbProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }, [videoSrc, imageSrc]);

  return (
    <div
      className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-sky-50 shadow-md sm:h-28 sm:w-28 ${className}`}
    >
      {videoSrc && !failed ? (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          poster={imageSrc ?? undefined}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label={alt}
          onError={() => setFailed(true)}
        />
      ) : imageSrc && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={alt}
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-sky-100 px-1 text-center">
          <p className="text-xs font-extrabold text-sky-800">{alt}</p>
        </div>
      )}
    </div>
  );
}
