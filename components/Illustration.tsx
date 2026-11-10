"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UseAnimations from "react-useanimations";
import KidCharacter from "@/components/scenes/KidCharacter";
import LottiePlayer from "@/components/LottiePlayer";
import {
  SunScene,
  AppleScene,
  DogScene,
  CatScene,
  MilkScene,
  WaterScene,
  ChairScene,
  BookScene,
  RabbitScene,
  CloudScene,
  MoonScene,
  BallScene,
  TreeScene,
  FishScene,
  LionScene,
  PizzaScene,
  ElephantScene,
} from "@/components/scenes/CoreScenes";
import { ThemeBadgeScene } from "@/components/scenes/BadgeScenes";
import { getIllustrationEntry, resolveIllustrationWord, type CoreSceneKey } from "@/utils/illustrations";
import { resolveLottieUrl } from "@/utils/lottieUrl";
import { resolveUseAnimationIcon } from "@/utils/useAnimationMap";

const CORE_SCENES: Record<CoreSceneKey, (props: { size: number }) => React.JSX.Element> = {
  sun: SunScene,
  apple: AppleScene,
  dog: DogScene,
  cat: CatScene,
  milk: MilkScene,
  water: WaterScene,
  chair: ChairScene,
  book: BookScene,
  rabbit: RabbitScene,
  cloud: CloudScene,
  moon: MoonScene,
  ball: BallScene,
  tree: TreeScene,
  fish: FishScene,
  lion: LionScene,
  pizza: PizzaScene,
  elephant: ElephantScene,
};

type IllustrationProps = {
  word: string;
  /** Supabase/CDN Lottie URL — takes priority over local word registry */
  lottieUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  celebrate?: boolean;
  className?: string;
};

const SIZES: Record<NonNullable<IllustrationProps["size"]>, number> = {
  sm: 110,
  md: 160,
  lg: 220,
  xl: 280,
};

type RenderTier = "lottie" | "useAnimation" | "svg";

/**
 * Hero illustration — priority:
 * 1) Supabase/CDN Lottie URL
 * 2) Local /lottie/*.json registry asset
 * 3) react-useanimations icon (word match)
 * 4) Calm SVG scene + CSS motion fallback
 */
export default function Illustration({
  word,
  lottieUrl,
  size = "lg",
  celebrate = false,
  className = "",
}: IllustrationProps) {
  const entry = getIllustrationEntry(word);
  const resolvedWord = resolveIllustrationWord(word);
  const externalLottie = resolveLottieUrl(lottieUrl);
  const useAnimationIcon = resolveUseAnimationIcon(word);
  const px = SIZES[size];
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setFailedSrcs(new Set());
  }, [externalLottie, entry.lottieSrc, word]);

  const lottieCandidates = [externalLottie, entry.lottieSrc].filter(
    (src): src is string => Boolean(src),
  );
  const activeLottieSrc = lottieCandidates.find((src) => !failedSrcs.has(src));

  const renderTier: RenderTier = activeLottieSrc
    ? "lottie"
    : useAnimationIcon
      ? "useAnimation"
      : "svg";

  const onFail = useCallback(() => {
    setFailedSrcs((prev) => {
      const next = new Set(prev);
      if (activeLottieSrc) next.add(activeLottieSrc);
      return next;
    });
  }, [activeLottieSrc]);

  const renderScene = () => {
    if (entry.scene.kind === "kid") {
      return <KidCharacter pose={entry.scene.pose} size={px * 0.78} />;
    }
    if (entry.scene.kind === "core") {
      const Scene = CORE_SCENES[entry.scene.key];
      return <Scene size={px * 0.78} />;
    }
    return <ThemeBadgeScene theme={entry.scene.theme} size={px * 0.78} />;
  };

  const svgMotionClass = celebrate ? "anim-wiggle" : "anim-bounce";

  return (
    <motion.div
      role="img"
      aria-label={resolvedWord || word}
      key={`${resolvedWord}-${externalLottie ?? ""}-${renderTier}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={
        celebrate
          ? { opacity: 1, scale: [1, 1.03, 1] }
          : { opacity: 1, scale: 1 }
      }
      transition={
        celebrate
          ? { duration: 0.35, ease: "easeOut" }
          : { duration: 0.22, ease: "easeOut" }
      }
      className={`relative flex items-center justify-center overflow-hidden rounded-[2.25rem] border-[5px] bg-gradient-to-br from-white via-white to-slate-50 shadow-xl ${className}`}
      style={{
        width: px,
        height: px,
        borderColor: entry.accent,
        boxShadow: `0 12px 28px -10px ${entry.accent}55, 0 0 0 4px #fff`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${entry.accent}44 0%, transparent 55%)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-[82%] w-[82%] items-center justify-center">
        <AnimatePresence mode="wait">
          {renderTier === "lottie" && activeLottieSrc ? (
            <motion.div
              key={`lottie-${activeLottieSrc}`}
              className="h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LottiePlayer src={activeLottieSrc} onFail={onFail} className="h-full w-full" />
            </motion.div>
          ) : renderTier === "useAnimation" && useAnimationIcon ? (
            <motion.div
              key={`useanim-${resolvedWord}`}
              className="flex h-full w-full items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <UseAnimations
                animation={useAnimationIcon}
                size={Math.round(px * 0.42)}
                strokeColor={entry.accent}
                loop
                autoplay
              />
            </motion.div>
          ) : (
            <motion.div
              key={`svg-${resolvedWord}`}
              className={svgMotionClass}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderScene()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
