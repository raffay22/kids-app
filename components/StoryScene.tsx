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
import { applyKidsMediaPlaybackRate, KIDS_SPEECH_RATE } from "@/utils/speech";

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
      applyKidsMediaPlaybackRate(audio);
      audio.currentTime = 0;
      void audio.play().catch(() => {
        speak(scene.audio_prompt || scene.narrative_text, KIDS_SPEECH_RATE);
      });
      return;
    }
    speak(scene.audio_prompt || scene.narrative_text, KIDS_SPEECH_RATE);
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
    applyKidsMediaPlaybackRate(video);
    video.load();
    applyKidsMediaPlaybackRate(video);
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
      speak(praise, KIDS_SPEECH_RATE);

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
    if (isHoldBreath) {
      setHint(
        story.story_id === "story_toddler_20"
          ? "Touch and hold to let Iggy's sun shine!"
          : story.story_id === "story_toddler_18"
            ? "Touch and hold to blow Gideon's bubble!"
            : story.story_id === "story_toddler_16"
              ? "Touch and hold to help Wally spout!"
              : story.story_id === "story_toddler_13"
                ? "Touch and hold to pat Sammie's soft wool!"
                : story.story_id === "story_toddler_12"
                  ? "Touch and hold to help Penny eat!"
                  : story.story_id === "story_toddler_09"
                    ? "Touch and hold to pull Benny's carrot!"
                    : story.story_id === "story_toddler_06"
                      ? "Touch and hold to stretch with Leo!"
                      : story.story_id === "story_toddler_04"
                        ? "Touch and hold so Bella can land!"
                        : "Touch and hold to help Bear breathe!",
      );
    }
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
        finishAction(
          story.story_id === "story_toddler_20"
            ? "Warm! Iggy's sun is shining!"
            : story.story_id === "story_toddler_18"
              ? "Pop! Gideon blew a big bubble!"
              : story.story_id === "story_toddler_16"
                ? "Whoosh! Wally's spout goes high!"
                : story.story_id === "story_toddler_13"
                  ? "So soft! Sammie loves the gentle pats!"
                  : story.story_id === "story_toddler_12"
                    ? "Crunch! Penny loves bamboo!"
                    : story.story_id === "story_toddler_09"
                      ? "Pop! Benny pulled the carrot!"
                      : story.story_id === "story_toddler_06"
                        ? "Soft stretch… Leo feels strong!"
                        : story.story_id === "story_toddler_04"
                          ? "Bella landed on the flower!"
                          : "Soft breaths… Bear feels calm!",
        );
      }
    }, 40);
  };

  useEffect(() => () => clearHold(), []);

  const handleHelpGlide = () => {
    if (actionDone) return;
    const praise =
      story.story_id === "story_toddler_19"
        ? "Good job! Hattie swirled the mud!"
        : story.story_id === "story_toddler_17"
          ? "Good job! Zoe's stripe is smooth!"
          : story.story_id === "story_toddler_15"
            ? "Good job! Penny traced the pebble!"
            : story.story_id === "story_toddler_14"
              ? "Good job! Toby reached the leaf!"
              : story.story_id === "story_toddler_11"
                ? "Good job! Milo swung to the branch!"
                : story.story_id === "story_toddler_10"
                  ? "Good job! Kiki rolled the yarn!"
                  : story.story_id === "story_toddler_08"
                    ? "Good job! Fiona hopped!"
                    : story.story_id === "story_toddler_07"
                      ? "Good job! Daisy made a splash!"
                      : story.story_id === "story_toddler_05"
                        ? "Good job! Oliver is awake!"
                        : story.story_id === "story_toddler_03"
                          ? "Good job! Pip is sliding!"
                          : "Good job! Sammy is gliding!";
    finishAction(praise);
  };

  const hotspot = scene.tap_target?.hotspot;
  const successBadge =
    story.story_id === "story_toddler_20" && scene.scene_number === 2
      ? "Yellow sun!"
      : story.story_id === "story_toddler_20"
        ? "Sun shining!"
        : story.story_id === "story_toddler_19" && scene.scene_number === 2
          ? "Brown mud pad!"
          : story.story_id === "story_toddler_19"
            ? "Mud circle!"
            : story.story_id === "story_toddler_18" && scene.scene_number === 2
              ? "Orange goldfish!"
              : story.story_id === "story_toddler_18"
                ? "Big bubble!"
                : story.story_id === "story_toddler_17" && scene.scene_number === 2
                  ? "Black stripe!"
                  : story.story_id === "story_toddler_17"
                    ? "Smooth stripe!"
                    : story.story_id === "story_toddler_16" && scene.scene_number === 2
                      ? "Blue droplet!"
                      : story.story_id === "story_toddler_16"
                        ? "Whoosh spout!"
                        : story.story_id === "story_toddler_15" && scene.scene_number === 2
                          ? "Round pebble!"
                          : story.story_id === "story_toddler_15"
                            ? "Circle traced!"
                            : story.story_id === "story_toddler_14" && scene.scene_number === 2
                              ? "Green leaf!"
                              : story.story_id === "story_toddler_14"
                                ? "Toby reached!"
                                : story.story_id === "story_toddler_13" && scene.scene_number === 2
                                  ? "White cloud!"
                                  : story.story_id === "story_toddler_13"
                                    ? "Soft pats!"
                                    : story.story_id === "story_toddler_12" && scene.scene_number === 2
                                      ? "Green bamboo!"
                                      : story.story_id === "story_toddler_12"
                                        ? "Bamboo crunch!"
                                        : story.story_id === "story_toddler_11" && scene.scene_number === 2
                                          ? "Yellow banana!"
                                          : story.story_id === "story_toddler_11"
                                            ? "Milo swung!"
                                            : story.story_id === "story_toddler_10" && scene.scene_number === 2
                                              ? "Pink yarn!"
                                              : story.story_id === "story_toddler_10"
                                                ? "Yarn rolled!"
                                                : story.story_id === "story_toddler_09" && scene.scene_number === 2
                                                  ? "Orange carrot!"
                                                  : story.story_id === "story_toddler_09"
                                                    ? "Carrot pulled!"
                                                    : story.story_id === "story_toddler_08" && scene.scene_number === 2
                                                      ? "Round lily pad!"
                                                      : story.story_id === "story_toddler_08"
                                                        ? "Fiona hopped!"
                                                        : story.story_id === "story_toddler_07" && scene.scene_number === 2
                                                          ? "Yellow duckling!"
                                                          : story.story_id === "story_toddler_07"
                                                            ? "Splash!"
                                                            : story.story_id === "story_toddler_06" && scene.scene_number === 2
                                                              ? "Orange crown!"
                                                              : story.story_id === "story_toddler_06"
                                                                ? "Leo stretched!"
                                                                : story.story_id === "story_toddler_05" && scene.scene_number === 2
                                                                  ? "The moon!"
                                                                  : story.story_id === "story_toddler_05"
                                                                    ? "Oliver is awake!"
                                                                    : story.story_id === "story_toddler_04" && scene.scene_number === 2
                                                                      ? "Yellow flower!"
                                                                      : story.story_id === "story_toddler_04"
                                                                        ? "Bella landed!"
                                                                        : story.story_id === "story_toddler_03" && scene.scene_number === 2
                                                                          ? "Blue fish!"
                                                                          : story.story_id === "story_toddler_03"
                                                                            ? "Pip is sliding!"
                                                                            : scene.interaction_type === "tap_wake"
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
          onLoadedData={(e) => applyKidsMediaPlaybackRate(e.currentTarget)}
          onPlay={(e) => applyKidsMediaPlaybackRate(e.currentTarget)}
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
            onLoadedData={(e) => applyKidsMediaPlaybackRate(e.currentTarget)}
            onPlay={(e) => applyKidsMediaPlaybackRate(e.currentTarget)}
            onEnded={handleSuccessVideoEnded}
          />

          {!actionDone && hotspot && (isTapWake || scene.puzzle?.type === "color_match") && (
            <button
              type="button"
              aria-label={`Tap the ${scene.tap_target?.label ?? "target"}`}
              onClick={wakeOrSuccessTap}
              className={`absolute z-10 rounded-full border-2 border-dashed transition focus:outline-none focus:ring-4 ${
                targetColor === "black"
                  ? "border-slate-800/90 bg-slate-900/20 hover:bg-slate-900/35 focus:ring-slate-500"
                  : targetColor === "white"
                    ? "border-slate-200/95 bg-white/25 hover:bg-white/40 focus:ring-slate-200"
                    : targetColor === "brown"
                      ? "border-amber-800/90 bg-amber-800/20 hover:bg-amber-800/35 focus:ring-amber-700"
                      : targetColor === "green"
                        ? "border-green-400/90 bg-green-300/20 hover:bg-green-300/35 focus:ring-green-300"
                        : targetColor === "pink"
                          ? "border-pink-400/90 bg-pink-300/20 hover:bg-pink-300/35 focus:ring-pink-300"
                          : targetColor === "orange"
                            ? "border-orange-400/90 bg-orange-300/20 hover:bg-orange-300/35 focus:ring-orange-300"
                            : targetColor === "yellow"
                              ? "border-yellow-400/90 bg-yellow-300/20 hover:bg-yellow-300/35 focus:ring-yellow-300"
                              : targetColor === "blue"
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
                {story.story_id === "story_toddler_20"
                  ? holding
                    ? "Keep holding…"
                    : "Touch & hold to let the sun shine"
                  : story.story_id === "story_toddler_18"
                    ? holding
                      ? "Keep blowing…"
                      : "Touch & hold to blow a big bubble"
                    : story.story_id === "story_toddler_16"
                      ? holding
                        ? "Keep holding…"
                        : "Touch & hold to help Wally spout"
                      : story.story_id === "story_toddler_13"
                        ? holding
                          ? "Keep patting…"
                          : "Touch & hold to pat Sammie's wool"
                        : story.story_id === "story_toddler_12"
                          ? holding
                            ? "Keep holding…"
                            : "Touch & hold to help Penny eat"
                          : story.story_id === "story_toddler_09"
                            ? holding
                              ? "Keep pulling…"
                              : "Touch & hold to pull the carrot"
                            : story.story_id === "story_toddler_06"
                              ? holding
                                ? "Keep stretching…"
                                : "Touch & hold to stretch with Leo"
                              : story.story_id === "story_toddler_04"
                                ? holding
                                  ? "Keep holding…"
                                  : "Touch & hold so Bella can land"
                                : holding
                                  ? "Breathe… keep holding"
                                  : "Touch & hold to help Bear breathe"}
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
            {story.story_id === "story_toddler_20"
              ? "Tap the YELLOW sun"
              : story.story_id === "story_toddler_19"
                ? "Tap the BROWN splash pad"
                : story.story_id === "story_toddler_18"
                  ? "Tap the ORANGE goldfish"
                  : story.story_id === "story_toddler_17"
                    ? "Tap the BLACK stripe"
                    : story.story_id === "story_toddler_16"
                      ? "Tap the BLUE droplet"
                      : story.story_id === "story_toddler_15"
                        ? "Which shape is the pebble?"
                        : story.story_id === "story_toddler_14"
                          ? "Tap the GREEN leaf"
                          : story.story_id === "story_toddler_13"
                            ? "Tap the WHITE cloud"
                            : story.story_id === "story_toddler_12"
                              ? "Find the GREEN bamboo"
                              : story.story_id === "story_toddler_11"
                                ? "Tap the YELLOW banana"
                                : story.story_id === "story_toddler_10"
                                  ? "Tap the PINK yarn"
                                  : story.story_id === "story_toddler_09"
                                    ? "Tap the ORANGE carrot"
                                    : story.story_id === "story_toddler_08"
                                      ? "Which shape is the lily pad?"
                                      : story.story_id === "story_toddler_07"
                                        ? "Tap the YELLOW duckling"
                                        : story.story_id === "story_toddler_06"
                                          ? "Find the ORANGE crown"
                                          : story.story_id === "story_toddler_05"
                                            ? "Which shape is the MOON?"
                                            : story.story_id === "story_toddler_04"
                                              ? "Tap the YELLOW flower"
                                              : story.story_id === "story_toddler_03"
                                                ? "Tap the BLUE fish"
                                                : `Pick the soft ${scene.puzzle.target_color?.toUpperCase()} blanket`}
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
          ariaLabel={
            story.story_id === "story_toddler_19"
              ? "Help Hattie swirl"
              : story.story_id === "story_toddler_17"
                ? "Help Zoe stripe"
                : story.story_id === "story_toddler_15"
                  ? "Help Penny circle"
                  : story.story_id === "story_toddler_14"
                    ? "Help Toby reach"
                    : story.story_id === "story_toddler_11"
                      ? "Help Milo swing"
                      : story.story_id === "story_toddler_10"
                        ? "Help Kiki roll"
                        : story.story_id === "story_toddler_08"
                          ? "Help Fiona hop"
                          : story.story_id === "story_toddler_07"
                            ? "Help Daisy splash"
                            : story.story_id === "story_toddler_05"
                              ? "Help Oliver wake"
                              : story.story_id === "story_toddler_03"
                                ? "Help Pip slide"
                                : "Help Sammy glide"
          }
          className="btn-3d-primary mx-auto flex items-center justify-center gap-2 py-3 text-base"
        >
          {story.story_id === "story_toddler_19"
            ? "Help Hattie swirl"
            : story.story_id === "story_toddler_17"
              ? "Help Zoe stripe"
              : story.story_id === "story_toddler_15"
                ? "Help Penny circle"
                : story.story_id === "story_toddler_14"
                  ? "Help Toby reach"
                  : story.story_id === "story_toddler_11"
                    ? "Help Milo swing"
                    : story.story_id === "story_toddler_10"
                      ? "Help Kiki roll"
                      : story.story_id === "story_toddler_08"
                        ? "Help Fiona hop"
                        : story.story_id === "story_toddler_07"
                          ? "Help Daisy splash"
                          : story.story_id === "story_toddler_05"
                            ? "Help Oliver wake"
                            : story.story_id === "story_toddler_03"
                              ? "Help Pip slide"
                              : "Help Sammy glide"}
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
