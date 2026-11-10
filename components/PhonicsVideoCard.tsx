"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import Illustration from "@/components/Illustration";
import { triggerHaptic } from "@/utils/haptics";
import { playPhonicsVoice } from "@/utils/playPhonicsVoice";
import { PHONICS_VIDEO_LOOPS_UNTIL_VOICE_ENDS } from "@/utils/phonicsDuration";
import type { PhonicsCardMedia } from "@/utils/phonicsCatalog";

type PhonicsVideoCardProps = {
  media: PhonicsCardMedia | null;
  fallbackWord: string;
  lottieUrl?: string | null;
  title: string;
  subtitle?: string;
  onTap?: () => void;
  className?: string;
};

export type PhonicsVideoCardHandle = {
  play: () => void;
};

const springTransition = { type: "spring" as const, stiffness: 420, damping: 24 };

const PhonicsVideoCard = forwardRef<PhonicsVideoCardHandle, PhonicsVideoCardProps>(
  function PhonicsVideoCard(
    { media, fallbackWord, lottieUrl, title, subtitle, onTap, className = "" },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);
    const videoSrc = media?.localVideoSrc ?? null;
    const showVideo = Boolean(videoSrc) && !videoFailed;

    useEffect(() => {
      setVideoFailed(false);
    }, [videoSrc]);

    const playCard = () => {
      triggerHaptic(30);
      const video = videoRef.current;

      if (PHONICS_VIDEO_LOOPS_UNTIL_VOICE_ENDS && video) {
        video.loop = true;
        video.currentTime = 0;
        void video.play();
      }

      playPhonicsVoice(media, {
        onEnded: () => {
          if (!video) return;
          video.loop = false;
          video.pause();
        },
      });
      onTap?.();
    };

    useImperativeHandle(ref, () => ({ play: playCard }));

    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={springTransition}
        onClick={playCard}
        aria-label={`Play ${media?.variation.elevenlabs_script ?? subtitle ?? title}`}
        className={`relative w-full overflow-hidden rounded-3xl border-4 border-white/90 bg-white/80 p-4 text-center shadow-2xl backdrop-blur-xl ${className}`}
      >
        <div className="relative mx-auto aspect-video w-full max-w-lg overflow-hidden rounded-2xl bg-violet-100">
          {showVideo ? (
            <video
              ref={videoRef}
              src={videoSrc!}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              className="h-full w-full object-cover"
              onError={() => {
                const code = videoRef.current?.error?.code;
                if (code === MediaError.MEDIA_ERR_ABORTED) return;
                setVideoFailed(true);
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Illustration word={fallbackWord} lottieUrl={lottieUrl} size="lg" />
            </div>
          )}

          <p
            className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 select-none text-5xl font-black tracking-wide text-yellow-300 sm:text-6xl"
            style={{
              WebkitTextStroke: "4px #111827",
              paintOrder: "stroke fill",
              textShadow: "0 2px 0 #111827",
            }}
            aria-hidden
          >
            {title}
          </p>
        </div>

        {subtitle && (
          <p className="mt-3 text-2xl font-bold text-purple-700">{subtitle}</p>
        )}
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Tap to hear the sound
        </p>
      </motion.button>
    );
  },
);

export default PhonicsVideoCard;
