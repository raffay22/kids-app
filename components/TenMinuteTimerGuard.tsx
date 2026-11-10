"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MotionPressable from "@/components/MotionPressable";
import { speakEnglish } from "@/utils/speech";

const SESSION_MS = 10 * 60 * 1000;

const BREAK_MESSAGES = [
  "Wow! You have been learning for ten minutes. Let's take a little break!",
  "Great job practicing! Time for a quick rest break.",
  "Super star! Ten minutes of learning complete. Stretch and breathe!",
];

type TenMinuteTimerGuardProps = {
  children: React.ReactNode;
};

export default function TenMinuteTimerGuard({
  children,
}: TenMinuteTimerGuardProps) {
  const [showAlert, setShowAlert] = useState(false);
  const hasAlertedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hasAlertedRef.current) return;
      hasAlertedRef.current = true;
      setShowAlert(true);

      const message =
        BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)];

      speakEnglish(message, { rate: 0.9, pitch: 1.05 });

      if ("vibrate" in navigator) {
        navigator.vibrate([30, 80, 30]);
      }
    }, SESSION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {children}

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-md"
          >
            <div className="glass-card border-amber-200/80 p-4 text-slate-800 shadow-2xl">
              <p className="text-sm font-bold text-amber-800">Break Time 🌟</p>
              <p className="mt-1 text-sm text-slate-700">
                You&apos;ve been practicing for 10 minutes. Time for a calming
                break!
              </p>
              <MotionPressable
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
                onClick={() => setShowAlert(false)}
                ariaLabel="Dismiss break reminder"
              >
                Got it!
              </MotionPressable>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
