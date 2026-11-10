"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

type ParentalGateProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
};

function generateChallenge() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return { a, b, answer: a + b };
}

export default function ParentalGate({
  open,
  onClose,
  onSuccess,
  title = "Parent Check",
}: ParentalGateProps) {
  const challenge = useMemo(() => (open ? generateChallenge() : null), [open]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!challenge) return;

    if (Number(input) === challenge.answer) {
      setInput("");
      setError(null);
      onSuccess();
      onClose();
      return;
    }

    setError("That answer wasn't quite right. Try again!");
    setInput("");
  };

  const handleClose = () => {
    setInput("");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && challenge && (
        <>
          <motion.button
            type="button"
            aria-label="Close parental gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-1/2 z-[71] mx-auto max-w-sm -translate-y-1/2"
          >
            <form onSubmit={handleSubmit} className="glass-card p-6">
              <div className="mb-4 flex items-center gap-2 text-indigo-600">
                <Lock className="h-5 w-5" aria-hidden />
                <h2 className="font-bold text-slate-800">{title}</h2>
              </div>
              <p className="text-sm text-slate-600">
                Please solve this quick math question to continue:
              </p>
              <p className="my-4 text-center text-2xl font-bold text-slate-800">
                {challenge.a} + {challenge.b} = ?
              </p>
              <input
                type="number"
                inputMode="numeric"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                autoFocus
                className="w-full rounded-2xl border-2 border-white/80 bg-white/70 px-4 py-3 text-center text-lg outline-none focus:border-indigo-300"
              />
              {error && (
                <p className="mt-2 text-sm text-rose-600">{error}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 text-sm font-semibold text-white"
                >
                  Continue
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
