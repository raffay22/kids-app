"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import AvatarSelector from "@/components/AvatarSelector";
import MotionPressable from "@/components/MotionPressable";
import type { AgeGroup } from "@/types/database";

type OnboardingWizardProps = {
  onComplete: (data: {
    nickname: string;
    avatarId: string;
    ageGroup: AgeGroup;
    skipped: boolean;
  }) => Promise<void>;
  onSkip: () => Promise<void>;
};

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>("cat-indigo");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("1-3");
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    setLoading(true);
    await onSkip();
    setLoading(false);
  };

  const handleFinish = async () => {
    if (!nickname.trim() || !avatarId) return;
    setLoading(true);
    await onComplete({
      nickname: nickname.trim(),
      avatarId,
      ageGroup,
      skipped: false,
    });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center canvas-bg p-4">
      <div className="glass-card w-full max-w-lg p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
              Step {step + 1} of 3
            </p>
            <h1 className="text-xl font-bold text-slate-800">Welcome Setup</h1>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-slate-800">
                Hello, wonderful parent! 👋
              </h2>
              <p className="text-slate-600">
                This is a playful learning space designed to support speech, language, and
                confidence — at your child&apos;s own pace. No pressure, just gentle practice
                and celebration.
              </p>
              <p className="text-sm text-slate-500">
                Let&apos;s set up your first learner profile. It only takes a minute!
              </p>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="text-sm text-slate-500 hover:text-indigo-600"
                >
                  Skip for now
                </button>
                <MotionPressable
                  onClick={() => setStep(1)}
                  ariaLabel="Continue to avatar setup"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                >
                  Let&apos;s Go
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </MotionPressable>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-slate-800">Choose an avatar & nickname</h2>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Child nickname (e.g. Mia)"
                maxLength={24}
                className="w-full rounded-2xl border-2 border-white/80 bg-white/70 px-4 py-3 text-slate-800 outline-none focus:border-indigo-300"
              />
              <AvatarSelector selectedId={avatarId} onSelect={setAvatarId} />
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="text-sm text-slate-500 hover:text-indigo-600"
                >
                  Skip for now
                </button>
                <MotionPressable
                  onClick={() => setStep(2)}
                  ariaLabel="Continue to age group"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </MotionPressable>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="age"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-slate-800">Select age group</h2>
              <p className="text-sm text-slate-600">
                This gently adjusts difficulty — it never locks content away. Everything stays
                open to explore!
              </p>
              <div className="flex gap-3">
                {(["1-3", "3-6"] as AgeGroup[]).map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setAgeGroup(group)}
                    className={`flex-1 rounded-2xl px-4 py-4 text-sm font-semibold transition ${
                      ageGroup === group
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                        : "bg-white/70 text-slate-700 hover:bg-white"
                    }`}
                  >
                    Ages {group}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="text-sm text-slate-500 hover:text-indigo-600"
                >
                  Skip for now
                </button>
                <MotionPressable
                  onClick={handleFinish}
                  ariaLabel="Finish onboarding"
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Start Learning!"}
                </MotionPressable>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
