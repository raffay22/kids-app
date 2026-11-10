"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Volume2 } from "lucide-react";
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
  onSceneComplete: () => void;
};

export default function StoryScene({
  story,
  scene,
  sceneIndex,
  totalScenes,
  onSceneComplete,
}: StorySceneProps) {
  const { speak } = useTTS();
  const visualWord = getSceneVisualWord(scene);
  const lottieSrc = resolveLottieUrl(getSceneLottieUrl(scene));

  const handleNarration = useCallback(() => {
    speak(scene.audio_prompt || scene.narrative_text, 0.9);
  }, [scene, speak]);

  const handleTapContinue = () => {
    triggerHaptic(30);
    playDing();
    onSceneComplete();
  };

  const handlePuzzleCorrect = () => {
    playDing();
    speak("Super Star!", 0.95);
    onSceneComplete();
  };

  const handlePuzzleWrong = () => {
    playBoop();
    speak("Try again!", 0.9);
  };

  return (
    <motion.article
      key={`${story.story_id}-${scene.scene_number}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="kid-card space-y-5 border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-6"
    >
      <div className="flex items-center justify-between text-sm font-semibold text-indigo-500">
        <span>{story.theme} · {story.title}</span>
        <span>
          Scene {sceneIndex + 1}/{totalScenes}
        </span>
      </div>

      <Illustration word={visualWord} lottieUrl={lottieSrc} size="lg" className="mx-auto" />

      <p className="text-center text-lg font-medium leading-relaxed text-slate-800">
        {scene.narrative_text}
      </p>

      <MotionPressable
        onClick={handleNarration}
        ariaLabel="Hear the story"
        className="mx-auto flex items-center gap-2 rounded-2xl border-b-4 border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-lg"
      >
        <Volume2 className="h-4 w-4" aria-hidden />
        Hear story
      </MotionPressable>

      {scene.puzzle ? (
        <IQPuzzleRenderer
          puzzle={scene.puzzle}
          onCorrect={handlePuzzleCorrect}
          onWrong={handlePuzzleWrong}
        />
      ) : (
        <MotionPressable
          onClick={handleTapContinue}
          ariaLabel="Continue story"
          className="btn-3d-primary mx-auto flex items-center justify-center gap-2 py-3 text-base"
        >
          Tap to continue
          <ChevronRight className="h-5 w-5" aria-hidden />
        </MotionPressable>
      )}
    </motion.article>
  );
}
