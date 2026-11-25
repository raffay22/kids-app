"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Moon,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BookOpen,
  Play,
  Pause,
} from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import type { BedtimeStory } from "@/utils/bedtimeStories";
import { triggerHaptic } from "@/utils/haptics";
import { stopKidsSpeech } from "@/utils/speech";

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[];
  destroy: () => void;
}

interface YTPlayerEvent {
  target: YTPlayerInstance;
  data: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementOrId: HTMLElement | string,
        options: {
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: YTPlayerEvent) => void;
            onStateChange?: (event: YTPlayerEvent) => void;
          };
        },
      ) => YTPlayerInstance;
    };
    onYouTubeIframeAPIReady: (() => void) | undefined;
    __ytApiLoadingPromise?: Promise<void>;
  }
}

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();

  if (window.__ytApiLoadingPromise) {
    return window.__ytApiLoadingPromise;
  }

  window.__ytApiLoadingPromise = new Promise<void>((resolve) => {
    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    const prevOnReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevOnReady === "function") prevOnReady();
      resolve();
    };

    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }
  });

  return window.__ytApiLoadingPromise;
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

type BedtimeYouTubePlayerProps = {
  videoId: string;
  story: BedtimeStory;
  nextStoryId?: string | null;
  onStoryComplete?: () => void;
};

// Cut 7.5 seconds before total duration so the story plays out fully while stopping right before the promo animation
const END_SUPPRESSION_SECONDS = 7.5;
const TARGET_PLAYBACK_RATE = 0.8;
const FALLBACK_PLAYBACK_RATE = 0.8;

export default function BedtimeYouTubePlayer({
  videoId,
  story,
  nextStoryId,
  onStoryComplete,
}: BedtimeYouTubePlayerProps) {
  const router = useRouter();
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const elementId = `bedtime-yt-${videoId}`;

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isEndedEarly, setIsEndedEarly] = useState(false);
  const completedFiredRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentRate, setCurrentRate] = useState<number>(TARGET_PLAYBACK_RATE);

  useEffect(() => {
    completedFiredRef.current = false;
  }, [videoId]);

  useEffect(() => {
    if (isEndedEarly && !completedFiredRef.current) {
      completedFiredRef.current = true;
      onStoryComplete?.();
    }
  }, [isEndedEarly, onStoryComplete]);

  const effectiveDuration = Math.max(0, duration - END_SUPPRESSION_SECONDS);

  const enforcePlaybackRate = useCallback((player: YTPlayerInstance) => {
    try {
      const available: number[] = player.getAvailablePlaybackRates?.() || [];
      const rateToApply = available.includes(TARGET_PLAYBACK_RATE)
        ? TARGET_PLAYBACK_RATE
        : available.includes(FALLBACK_PLAYBACK_RATE)
          ? FALLBACK_PLAYBACK_RATE
          : TARGET_PLAYBACK_RATE;

      player.setPlaybackRate(rateToApply);
      setCurrentRate(rateToApply);
    } catch {
      // ignore
    }
  }, []);

  const togglePlayPause = () => {
    triggerHaptic(20);
    const player = playerRef.current;
    if (!player) return;

    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        setHasStarted(true);
        enforcePlaybackRate(player);
        player.playVideo();
      }
    } catch {
      // ignore
    }
  };

  const handleSeek = (newTime: number) => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const clamped = Math.max(0, Math.min(newTime, effectiveDuration - 1));
      player.seekTo(clamped, true);
      setCurrentTime(clamped);
      if (isEndedEarly) {
        setIsEndedEarly(false);
        player.playVideo();
      }
    } catch {
      // ignore
    }
  };

  const handleRewind10 = () => {
    triggerHaptic(15);
    handleSeek(currentTime - 10);
  };

  const handleReplay = () => {
    triggerHaptic(25);
    setIsEndedEarly(false);
    setCurrentTime(0);
    const player = playerRef.current;
    if (player) {
      try {
        player.seekTo(0, true);
        enforcePlaybackRate(player);
        player.playVideo();
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    stopKidsSpeech();
    let isCancelled = false;

    const safetyTimer = setTimeout(() => {
      if (!isCancelled) setIsReady(true);
    }, 1500);

    loadYouTubeIframeApi().then(() => {
      if (isCancelled) return;

      const targetEl =
        playerContainerRef.current || document.getElementById(elementId);
      if (!targetEl) return;

      try {
        playerRef.current = new window.YT.Player(targetEl, {
          videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            controls: 0, // Disabled YouTube native controls: we use our safe custom in-app controls
            fs: 0, // Child Lock: no fullscreen YouTube links
            playsinline: 1,
            disablekb: 1,
            iv_load_policy: 3, // Disable annotations/subscribe buttons
            cc_load_policy: 0,
            origin: typeof window !== "undefined" ? window.location.origin : "",
          },
          events: {
            onReady: (event: YTPlayerEvent) => {
              if (isCancelled) return;
              setIsReady(true);
              enforcePlaybackRate(event.target);
              try {
                const total = event.target.getDuration?.() ?? 0;
                setDuration(total);
              } catch {
                // ignore
              }
            },
            onStateChange: (event: YTPlayerEvent) => {
              if (isCancelled) return;
              const state = event.data;
              // YT.PlayerState.PLAYING = 1
              if (state === 1) {
                setIsPlaying(true);
                setHasStarted(true);
                setIsReady(true);
                stopKidsSpeech();
                enforcePlaybackRate(event.target);
              } else {
                setIsPlaying(false);
              }

              // YT.PlayerState.ENDED = 0
              if (state === 0) {
                setIsEndedEarly(true);
              }
            },
          },
        });
      } catch (err) {
        console.error("YouTube Player init error:", err);
        setIsReady(true);
      }
    });

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [videoId, elementId, enforcePlaybackRate]);

  // High-frequency active monitor (every 100ms): Cut before promo animation
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      try {
        const totalDuration = player.getDuration?.() ?? duration;
        const cur = player.getCurrentTime?.() ?? 0;

        if (totalDuration > 0 && totalDuration !== duration) {
          setDuration(totalDuration);
        }
        setCurrentTime(cur);

        // Strict cut: pause and trigger end card before the 7-second promo
        if (
          totalDuration > END_SUPPRESSION_SECONDS &&
          cur >= totalDuration - END_SUPPRESSION_SECONDS
        ) {
          player.pauseVideo();
          setIsEndedEarly(true);
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch {
        // ignore
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, duration]);

  const progressPercent =
    effectiveDuration > 0
      ? Math.min(100, (currentTime / effectiveDuration) * 100)
      : 0;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border-4 border-indigo-200 bg-slate-950 shadow-2xl">
      {/* 16:9 Video Canvas Frame */}
      <div className="relative aspect-video w-full overflow-hidden bg-black select-none">
        {/* =================================================================== */}
        {/* IMPENETRABLE CHILD LOCK: `pointer-events-none` on YouTube iframe    */}
        {/* It is physically impossible to click ANY YouTube link, logo, or UI */}
        {/* =================================================================== */}
        <div
          ref={playerContainerRef}
          id={elementId}
          className="pointer-events-none h-full w-full"
        />

        {/* =================================================================== */}
        {/* CUSTOM TOUCH & CLICK SHIELD: captures all taps safely in our app    */}
        {/* =================================================================== */}
        <div
          onClick={togglePlayPause}
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-transparent pointer-events-auto"
          aria-label={isPlaying ? "Pause bedtime story" : "Play bedtime story"}
        >
          {/* Big Center Play Button when paused */}
          {(!isPlaying || !hasStarted) && !isEndedEarly && (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-300 bg-amber-400 text-slate-900 shadow-2xl transition-transform hover:scale-105 active:scale-95">
                <Play className="ml-1 h-10 w-10 fill-slate-900" />
              </div>
              <p className="rounded-full bg-slate-900/85 px-4 py-1.5 text-sm font-bold text-white shadow-md backdrop-blur-sm">
                {hasStarted ? "Paused · Tap to Play" : "Tap to Watch Story 🌙"}
              </p>
            </div>
          )}
        </div>

        {/* Loading overlay (fades out quickly) */}
        {!isReady && !hasStarted && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
            <Moon className="h-10 w-10 animate-pulse text-indigo-400" />
            <p className="mt-2 text-base font-bold">Setting up bedtime film…</p>
          </div>
        )}

        {/* =================================================================== */}
        {/* IN-APP "STORY FINISHED / REPLAY" CARD (Zero Promo Animation Seen)   */}
        {/* =================================================================== */}
        {isEndedEarly && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-white select-auto pointer-events-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-indigo-400 bg-indigo-500/30 text-amber-300 shadow-lg">
              <Moon className="h-9 w-9 fill-amber-300" />
            </div>

            <h2 className="mt-4 text-2xl font-black text-amber-200 sm:text-3xl">
              Sweet Dreams!
            </h2>
            <p className="mt-1 text-base font-semibold text-indigo-100">
              You finished <span className="text-white">&ldquo;{story.title}&rdquo;</span>
            </p>

            {story.moral && (
              <div className="mt-3 max-w-md rounded-2xl border border-indigo-500/40 bg-indigo-950/70 p-3 text-sm font-medium text-indigo-200">
                <span className="font-bold text-amber-300">Tonight&apos;s Moral: </span>
                {story.moral}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <MotionPressable
                onClick={handleReplay}
                ariaLabel="Watch story again"
                className="flex items-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-5 py-3 text-base font-black text-slate-900 shadow-lg active:translate-y-0.5"
              >
                <RotateCcw className="h-5 w-5" />
                Watch Again
              </MotionPressable>

              {nextStoryId ? (
                <MotionPressable
                  onClick={() => {
                    triggerHaptic(20);
                    router.push(`/games/stories/bedtime/${nextStoryId}`);
                  }}
                  ariaLabel="Play next bedtime story"
                  className="flex items-center gap-2 rounded-2xl border-b-4 border-indigo-700 bg-indigo-600 px-5 py-3 text-base font-black text-white shadow-lg active:translate-y-0.5"
                >
                  <span>Next Story</span>
                  <ChevronRight className="h-5 w-5" />
                </MotionPressable>
              ) : (
                <MotionPressable
                  onClick={() => {
                    triggerHaptic(20);
                    router.push("/games/stories/bedtime");
                  }}
                  ariaLabel="All bedtime stories"
                  className="flex items-center gap-2 rounded-2xl border-b-4 border-slate-700 bg-slate-800 px-5 py-3 text-base font-bold text-white shadow-lg"
                >
                  <BookOpen className="h-5 w-5" />
                  All Stories
                </MotionPressable>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 100% IN-APP CHILD-FRIENDLY CONTROLS (Safe & Simple for Toddlers)     */}
      {/* =================================================================== */}
      <div className="border-t border-indigo-900 bg-slate-900 p-3 sm:px-5">
        {/* Visual Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-indigo-300">
            {formatTime(currentTime)}
          </span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              handleSeek(ratio * effectiveDuration);
            }}
            className="relative h-3 flex-1 cursor-pointer overflow-hidden rounded-full bg-slate-800"
          >
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-100"
            />
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300">
            {formatTime(effectiveDuration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayPause}
              className="flex h-11 items-center gap-2 rounded-2xl border-b-2 border-indigo-700 bg-indigo-600 px-4 text-sm font-bold text-white shadow transition hover:bg-indigo-500 active:translate-y-0.5"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRewind10}
              title="Rewind 10 seconds"
              className="flex h-11 items-center gap-1.5 rounded-2xl border-b-2 border-slate-700 bg-slate-800 px-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              <span>10s</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-indigo-950/80 px-3 py-1.5 text-xs font-bold text-indigo-200 border border-indigo-800">
              <Moon className="h-3.5 w-3.5 fill-indigo-400 text-indigo-400" />
              <span>Calm Pace ({currentRate}x)</span>
            </span>

            <span className="flex items-center gap-1 rounded-full bg-emerald-950/80 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/40">
              <Sparkles className="h-3 w-3" />
              Child Lock Shield
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
