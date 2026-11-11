"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import Illustration from "@/components/Illustration";
import IQPuzzleRenderer from "@/components/IQPuzzleRenderer";
import MotionPressable from "@/components/MotionPressable";
import { useTTS } from "@/hooks/useTTS";
import {
  getSceneLottieUrl,
  getSceneVisualWord,
  type StoryRecord,
  type StorySceneData,
} from "@/utils/iqStories";
import { resolveLottieUrl } from "@/utils/lottieUrl";
import { triggerHaptic } from "@/utils/haptics";
import { playBoop, playDing } from "@/utils/celebrate";

type StorySceneProps = {
  story: StoryRecord;
  scene: StorySceneData;
  sceneIndex: number;
  totalScenes: number;
  /** Fired once when this scene’s IQ action succeeds. */
  onSceneComplete?: () => void;
  showContinueAction?: boolean;
  autoPlayNarration?: boolean;
};

const HOLD_MS = 2000;

export default function StoryScene({
  story,
  scene,
  sceneIndex,
  totalScenes,
  onSceneComplete,
  showContinueAction = false,
  autoPlayNarration = true,
}: StorySceneProps) {
  const { speak } = useTTS();
  const visualWord = getSceneVisualWord(scene);
  const lottieSrc = resolveLottieUrl(getSceneLottieUrl(scene));
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const [videoSrc, setVideoSrc] = useState(scene.video_url ?? null);
  const [waking, setWaking] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);

  const hasProducedMedia = Boolean(scene.video_url || scene.audio_url);
  const isTapWake = scene.interaction_type === "tap_wake" && Boolean(scene.wake_video_url);
  const isHoldBreath = scene.interaction_type === "hold_breath";
  const successVideo = scene.wake_video_url;
  const targetColor = scene.puzzle?.target_color ?? scene.tap_target?.color;

  useEffect(() => {
    setVideoSrc(scene.video_url ?? null);
    setWaking(false);
    setActionDone(false);
    setHint(null);
    setHoldProgress(0);
    setHolding(false);
    completedRef.current = false;
  }, [scene.scene_number, scene.video_url, story.story_id]);

  const playNarration = useCallback(() => {
    const audio = audioRef.current;
    if (audio && scene.audio_url) {
      audio.currentTime = 0;
      void audio.play().catch(() => {
        speak(scene.audio_prompt || scene.narrative_text, 0.9);
      });
      return;
    }
    speak(scene.audio_prompt || scene.narrative_text, 0.9);
  }, [scene, speak]);

  useEffect(() => {
    if (!hasProducedMedia || !autoPlayNarration) return;
    const delay = sceneIndex === 0 ? 350 : 900;
    const t = window.setTimeout(() => playNarration(), delay);
    return () => window.clearTimeout(t);
  }, [hasProducedMedia, autoPlayNarration, playNarration, scene.scene_number, sceneIndex, story.story_id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.loop = !(waking || actionDone);
    video.load();
    void video.play().catch(() => undefined);
  }, [videoSrc, waking, actionDone]);

  const finishAction = useCallback(
    (praise: string) => {
      if (completedRef.current) return;
      completedRef.current = true;
      triggerHaptic(40);
      playDing();
      setHint(null);
      setHolding(false);
      setHoldProgress(100);
      speak(praise, 0.95);

      if (successVideo) {
        setWaking(true);
        setVideoSrc(successVideo);
      } else {
        setActionDone(true);
        onSceneComplete?.();
      }
    },
    [onSceneComplete, speak, successVideo],
  );

  const handleSuccessVideoEnded = () => {
    if (!waking) return;
    setWaking(false);
    setActionDone(true);
    onSceneComplete?.();
  };

  const handleNarrationEnded = () => {
    if (actionDone) return;
    if (isTapWake) setHint(`Tap the ${targetColor ?? "red"} ${scene.tap_target?.label ?? "target"}!`);
    if (isHoldBreath) setHint("Touch and hold to help Bear breathe!");
    if (scene.puzzle?.type === "color_match" && !isTapWake) {
      setHint(`Find the ${scene.puzzle.target_color} one!`);
    }
  };

  const wakeOrSuccessTap = () => {
    if (waking || actionDone) return;
    if (isTapWake) {
      finishAction("Good morning!");
      return;
    }
    if (scene.puzzle?.type === "color_match" && hotspot) {
      finishAction(`Yes! The ${targetColor ?? "right"} one is perfect!`);
    }
  };

  const handlePuzzleCorrect = () => {
    if (isTapWake) {
      wakeOrSuccessTap();
      return;
    }
    const color = scene.puzzle?.target_color ?? "right";
    finishAction(`Yes! The ${color} one is perfect!`);
  };

  const handlePuzzleWrong = () => {
    playBoop();
    const color = scene.puzzle?.target_color?.toUpperCase() ?? "correct";
    speak(`Try again! Find the ${color} one!`, 0.9);
    setHint(`Try the ${scene.puzzle?.target_color} one`);
  };

  const clearHold = () => {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdStartRef.current = null;
    setHolding(false);
    if (!actionDone) setHoldProgress(0);
  };

  const startHold = () => {
    if (!isHoldBreath || actionDone || waking) return;
    setHolding(true);
    holdStartRef.current = Date.now();
    holdTimerRef.current = window.setInterval(() => {
      const start = holdStartRef.current;
      if (!start) return;
      const pct = Math.min(100, ((Date.now() - start) / HOLD_MS) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        clearHold();
        finishAction("Soft breaths… Bear feels calm!");
      }
    }, 40);
  };

  useEffect(() => () => clearHold(), []);

  const handleHelpGlide = () => {
    if (actionDone) return;
    finishAction("Good job! Sammy is gliding!");
  };

  const hotspot = scene.tap_target?.hotspot;
  const successBadge =
    scene.interaction_type === "tap_wake"
      ? "Starfish is awake!"
      : scene.interaction_type === "hold_breath"
        ? "Bear is calm!"
        : scene.puzzle?.target_color === "blue"
          ? "Blue blanket!"
          : "Great job!";

  return (
    <motion.article
      key={`${story.story_id}-${scene.scene_number}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="kid-card h-full space-y-4 border-sky-200 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/70 p-5"
    >
      <div className="flex items-center justify-between text-sm font-semibold text-sky-700">
        <span>Part {sceneIndex + 1}</span>
        <span>
          {sceneIndex + 1}/{totalScenes}
        </span>
      </div>

      {scene.audio_url && (
        <audio
          ref={audioRef}
          src={scene.audio_url}
          preload="auto"
          onEnded={handleNarrationEnded}
        />
      )}

      {videoSrc ? (
        <div
          className={`relative mx-auto w-full overflow-hidden rounded-3xl bg-sky-900 shadow-lg ${
            isHoldBreath && !actionDone ? "touch-none select-none" : ""
          }`}
          onPointerDown={isHoldBreath ? startHold : undefined}
          onPointerUp={isHoldBreath ? clearHold : undefined}
          onPointerLeave={isHoldBreath ? clearHold : undefined}
          onPointerCancel={isHoldBreath ? clearHold : undefined}
        >
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            className="aspect-video w-full object-cover"
            playsInline
            muted
            autoPlay
            loop={!waking && !actionDone}
            onEnded={handleSuccessVideoEnded}
          />

          {!actionDone && hotspot && (isTapWake || scene.puzzle?.type === "color_match") && (
            <button
              type="button"
              aria-label={`Tap the ${scene.tap_target?.label ?? "target"}`}
              onClick={wakeOrSuccessTap}
              className={`absolute z-10 rounded-full border-2 border-dashed transition focus:outline-none focus:ring-4 ${
                targetColor === "blue"
                  ? "border-blue-400/90 bg-blue-400/15 hover:bg-blue-400/30 focus:ring-blue-300"
                  : "border-red-400/90 bg-red-400/15 hover:bg-red-400/30 focus:ring-red-300"
              }`}
              style={{
                left: `${hotspot.left}%`,
                top: `${hotspot.top}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
              }}
            />
          )}

          {isHoldBreath && !actionDone && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-end bg-gradient-to-t from-black/35 via-transparent to-transparent pb-4">
              <div className="mb-2 h-3 w-2/3 overflow-hidden rounded-full bg-white/40">
                <div
                  className="h-full rounded-full bg-sky-300 transition-[width] duration-75"
                  style={{ width: `${holdProgress}%` }}
                />
              </div>
              <p className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-sky-800 shadow">
                {holding ? "Breathe… keep holding" : "Touch & hold to help Bear breathe"}
              </p>
            </div>
          )}

          {hint && !isHoldBreath && (
            <p className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-red-600 shadow">
              {hint}
            </p>
          )}

          {actionDone && (
            <p className="absolute inset-x-0 top-3 mx-auto w-fit rounded-full bg-amber-300 px-4 py-1.5 text-sm font-bold text-amber-900 shadow">
              {successBadge}
            </p>
          )}
        </div>
      ) : (
        <Illustration word={visualWord} lottieUrl={lottieSrc} size="lg" className="mx-auto" />
      )}

      <p className="text-center text-base font-medium leading-relaxed text-slate-800 sm:text-lg">
        {scene.narrative_text}
      </p>

      <MotionPressable
        onClick={playNarration}
        ariaLabel="Hear the story"
        className="mx-auto flex items-center gap-2 rounded-2xl border-b-4 border-sky-200 bg-white px-4 py-2 text-sm font-bold text-sky-700 shadow-lg"
      >
        <Volume2 className="h-4 w-4" aria-hidden />
        Hear story
      </MotionPressable>

      {isTapWake && scene.puzzle ? (
        <div className="space-y-2">
          <p className="text-center text-base font-bold text-slate-700">
            Which one should we tap?
          </p>
          <IQPuzzleRenderer
            puzzle={scene.puzzle}
            hideTypeLabel
            onCorrect={handlePuzzleCorrect}
            onWrong={handlePuzzleWrong}
          />
        </div>
      ) : scene.puzzle ? (
        <div className="space-y-2">
          <p className="text-center text-base font-bold text-slate-700">
            Pick the soft {scene.puzzle.target_color?.toUpperCase()} blanket
          </p>
          <IQPuzzleRenderer
            puzzle={scene.puzzle}
            hideTypeLabel
            onCorrect={handlePuzzleCorrect}
            onWrong={handlePuzzleWrong}
          />
        </div>
      ) : scene.interaction_type === "slow_trace" ? (
        <MotionPressable
          onClick={handleHelpGlide}
          ariaLabel="Help Sammy glide"
          className="btn-3d-primary mx-auto flex items-center justify-center gap-2 py-3 text-base"
        >
          Help Sammy glide
        </MotionPressable>
      ) : showContinueAction ? (
        <MotionPressable
          onClick={() => finishAction("Great!")}
          ariaLabel="Continue story"
          className="btn-3d-primary mx-auto flex items-center justify-center gap-2 py-3 text-base"
        >
          Tap to continue
        </MotionPressable>
      ) : null}
    </motion.article>
  );
}
