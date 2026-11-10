"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Sparkles, X } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import Particles from "@/components/scenes/Particles";
import { TrophyScene } from "@/components/scenes/CoreScenes";
import { starShower } from "@/utils/celebrate";

/** Public vector confetti DotLottie (no local raster assets) */
const CONFETTI_LOTTIE =
  "https://lottie.host/4aeaab49-7329-4e92-a9f3-8c0c0b87f7a9/9mLs42Ez2H.lottie";

type RewardTrophyModalProps = {
  open: boolean;
  accuracy: number;
  onClose: () => void;
};

export default function RewardTrophyModal({
  open,
  accuracy,
  onClose,
}: RewardTrophyModalProps) {
  useEffect(() => {
    if (open) starShower();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 z-[81] mx-auto max-w-md -translate-y-1/2"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <DotLottieReact src={CONFETTI_LOTTIE} autoplay loop className="h-full w-full" />
            </div>

            <div className="kid-card relative border-amber-300 bg-gradient-to-b from-amber-50 via-white to-white p-7 text-center">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close trophy modal"
                className="absolute right-4 top-4 text-slate-500 hover:text-slate-800"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>

              <div className="relative mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-white to-amber-50 shadow-2xl">
                <Particles color="#fbbf24" />
                <TrophyScene size={110} />
              </div>

              <h2 className="text-3xl font-bold text-slate-800">Golden Speech Trophy!</h2>
              <p className="mt-2 text-base text-slate-600">
                Amazing! You reached <span className="font-bold text-amber-700">{accuracy}%</span>{" "}
                accuracy this session!
              </p>
              <p className="mt-1 text-sm text-indigo-600">
                Trophy unlocked and saved to your profile.
              </p>

              <MotionPressable
                onClick={onClose}
                ariaLabel="Celebrate and continue"
                className="btn-3d-primary mt-6 flex w-full items-center justify-center gap-2 py-4 text-lg"
              >
                <Sparkles className="h-5 w-5" aria-hidden />
                Yay! Keep Going
              </MotionPressable>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
