"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Film,
  Grid,
  Home,
  Lock,
  Volume2,
} from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import ParentalGate from "@/components/ParentalGate";
import { useAuth } from "@/components/AuthProvider";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";
import { createClient } from "@/utils/supabase/client";
import {
  DEFAULT_ANIMATION_LOOP_CAP,
  TTS_SPEED_MAX,
  TTS_SPEED_MIN,
  getAnimationLoopCap,
  isSensoryGateUnlocked,
  unlockSensoryGate,
} from "@/utils/sensoryPrefs";
import { speakEnglish } from "@/utils/speech";

type PendingSensoryAction =
  | { kind: "unlock" }
  | { kind: "set"; patch: Parameters<ReturnType<typeof useSensoryPrefs>["updatePrefs"]>[0] };

export default function SettingsPanel() {
  const { user, profile, refreshProfile } = useAuth();
  const { prefs, ready, updatePrefs } = useSensoryPrefs();
  const [gateOpen, setGateOpen] = useState(false);
  const [pending, setPending] = useState<PendingSensoryAction | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const gateOk = unlocked || isSensoryGateUnlocked();
  const loopCap = getAnimationLoopCap(prefs);

  const persistReduceMotion = useCallback(
    async (reducedMotion: boolean) => {
      if (!user) return;
      try {
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({ reduce_motion: reducedMotion })
          .eq("id", user.id);
        await refreshProfile();
      } catch {
        // offline — local pref still applies
      }
    },
    [refreshProfile, user],
  );

  const requireGate = (action: PendingSensoryAction) => {
    if (gateOk) {
      if (action.kind === "set") {
        const next = updatePrefs(action.patch);
        if (action.patch.reducedMotion != null) {
          void persistReduceMotion(next.reducedMotion);
        }
        setMsg("Saved.");
      }
      return;
    }
    setPending(action);
    setGateOpen(true);
  };

  const onGateSuccess = () => {
    unlockSensoryGate();
    setUnlocked(true);
    if (pending?.kind === "set") {
      const next = updatePrefs(pending.patch);
      if (pending.patch.reducedMotion != null) {
        void persistReduceMotion(next.reducedMotion);
      }
      setMsg("Saved.");
    } else {
      setMsg("Sensory controls unlocked for this session.");
    }
    setPending(null);
  };

  const previewSpeech = () => {
    speakEnglish("Ah… ah… A is for Apple.", { rate: prefs.ttsSpeed });
  };

  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-xl"
      >
        <Home className="h-4 w-4" aria-hidden />
        Back to Home
      </Link>

      <section className="rounded-3xl border-4 border-white/90 bg-white/85 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        <p className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-indigo-600">
          <Lock className="h-4 w-4" aria-hidden />
          Parent area
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Sensory &amp; Privacy Controls
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Hold the lock on Home for 3 seconds to open this page. Special Mode
          toggles need a quick parent math check.
        </p>
        {!gateOk && (
          <button
            type="button"
            onClick={() => requireGate({ kind: "unlock" })}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg"
          >
            <Lock className="h-4 w-4" aria-hidden />
            Unlock sensory toggles
          </button>
        )}
        {msg && (
          <p className="mt-3 text-sm font-bold text-emerald-700" role="status">
            {msg}
          </p>
        )}
      </section>

      {/* Reduced motion + loop cap */}
      <section
        className={`rounded-3xl border-4 border-white/90 bg-white/85 p-5 shadow-xl backdrop-blur-xl sm:p-6 ${
          !gateOk ? "opacity-70" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center text-lg font-extrabold text-slate-800">
              <Film className="mr-2 h-5 w-5 text-violet-600" aria-hidden />
              Reduced Motion &amp; Loop Cap
              <InfoTooltip text="Limits animations to prevent screen distraction, reduce lag, and save battery." />
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {prefs.reducedMotion
                ? "Videos stay still — 0 loops, high-contrast static frames."
                : `Videos loop up to ${DEFAULT_ANIMATION_LOOP_CAP} times, then freeze on a calm frame.`}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.reducedMotion}
            disabled={!ready}
            onClick={() =>
              requireGate({
                kind: "set",
                patch: { reducedMotion: !prefs.reducedMotion },
              })
            }
            className={`relative h-9 w-16 shrink-0 rounded-full border-2 transition ${
              prefs.reducedMotion
                ? "border-violet-500 bg-violet-500"
                : "border-slate-200 bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-0.5 h-7 w-7 rounded-full bg-white shadow transition ${
                prefs.reducedMotion ? "left-7" : "left-0.5"
              }`}
            />
          </button>
        </div>
        <p className="mt-3 rounded-2xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800">
          Active loop cap: <strong>{loopCap}</strong>
          {loopCap === 0 ? " (static only)" : ` (pause after ${loopCap} plays)`}
          {profile?.reduce_motion ? " · synced with profile" : ""}
        </p>
      </section>

      {/* TTS speed */}
      <section
        className={`rounded-3xl border-4 border-white/90 bg-white/85 p-5 shadow-xl backdrop-blur-xl sm:p-6 ${
          !gateOk ? "opacity-70" : ""
        }`}
      >
        <h2 className="flex items-center text-lg font-extrabold text-slate-800">
          <Volume2 className="mr-2 h-5 w-5 text-sky-600" aria-hidden />
          Audio TTS Pitch &amp; Speed
          <InfoTooltip text="Adjusts speech speed for Phonics and Sentences to help children hear sounds more clearly." />
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Web Speech rate from {TTS_SPEED_MIN.toFixed(1)}x (clearest) to{" "}
          {TTS_SPEED_MAX.toFixed(1)}x.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">0.5x</span>
          <input
            type="range"
            min={TTS_SPEED_MIN}
            max={TTS_SPEED_MAX}
            step={0.02}
            value={prefs.ttsSpeed}
            disabled={!ready}
            onPointerDown={() => {
              if (!gateOk) requireGate({ kind: "unlock" });
            }}
            onChange={(e) => {
              if (!gateOk) return;
              updatePrefs({ ttsSpeed: Number(e.target.value) });
            }}
            aria-label="Speech speed"
            className="h-3 flex-1 cursor-pointer accent-sky-500"
          />
          <span className="text-xs font-bold text-slate-500">1.0x</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm font-extrabold text-sky-800">
            {prefs.ttsSpeed.toFixed(2)}x
          </p>
          <button
            type="button"
            onClick={previewSpeech}
            className="rounded-2xl border-2 border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-bold text-sky-800"
          >
            Preview voice
          </button>
        </div>
      </section>

      {/* ASD PECS modes */}
      <section
        className={`rounded-3xl border-4 border-white/90 bg-white/85 p-5 shadow-xl backdrop-blur-xl sm:p-6 ${
          !gateOk ? "opacity-70" : ""
        }`}
      >
        <h2 className="flex items-center text-lg font-extrabold text-slate-800">
          <Grid className="mr-2 h-5 w-5 text-amber-600" aria-hidden />
          Adaptive ASD PECS Dashboard
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Choose how the home dashboard shows therapy tools.
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-amber-100 bg-amber-50/60 p-3">
            <div>
              <p className="flex items-center font-extrabold text-slate-800">
                Enable ASD PECS Mode
                <InfoTooltip text="Adds an extra 'ASD PECS & Sensory Hub' card to the main dashboard alongside all normal games, stories, and phonics." />
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Normal activities stay visible, plus the Sensory Hub card.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.asdPecsMode}
              onClick={() =>
                requireGate({
                  kind: "set",
                  patch: {
                    asdPecsMode: !prefs.asdPecsMode,
                    ...(prefs.asdPecsMode ? { onlyAsdPecsMode: false } : {}),
                  },
                })
              }
              className={`relative h-9 w-16 shrink-0 rounded-full border-2 transition ${
                prefs.asdPecsMode
                  ? "border-amber-500 bg-amber-500"
                  : "border-slate-200 bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-7 w-7 rounded-full bg-white shadow transition ${
                  prefs.asdPecsMode ? "left-7" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-rose-100 bg-rose-50/60 p-3">
            <div>
              <p className="flex items-center font-extrabold text-slate-800">
                Only ASD PECS Mode
                <InfoTooltip text="Hides all standard games, stories, and phonics, displaying ONLY the ASD PECS & Sensory Hub on the dashboard for distraction-free therapy." />
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Home shows only the 7 special sensory activities.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.onlyAsdPecsMode}
              onClick={() =>
                requireGate({
                  kind: "set",
                  patch: {
                    onlyAsdPecsMode: !prefs.onlyAsdPecsMode,
                    asdPecsMode: !prefs.onlyAsdPecsMode ? true : prefs.asdPecsMode,
                  },
                })
              }
              className={`relative h-9 w-16 shrink-0 rounded-full border-2 transition ${
                prefs.onlyAsdPecsMode
                  ? "border-rose-500 bg-rose-500"
                  : "border-slate-200 bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-7 w-7 rounded-full bg-white shadow transition ${
                  prefs.onlyAsdPecsMode ? "left-7" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border-4 border-white/90 bg-white/80 p-5 shadow-xl">
        <h2 className="text-base font-extrabold text-slate-800">Quick links</h2>
        <ul className="mt-3 space-y-2 text-sm font-semibold text-indigo-700">
          <li>
            <Link href="/profile" className="hover:underline">
              Profile &amp; trophies
            </Link>
          </li>
          <li>
            <Link href="/asd" className="hover:underline">
              ASD PECS &amp; Sensory Hub
            </Link>
          </li>
          <li>
            <Link href="/analytics" className="hover:underline">
              Practice log
            </Link>
          </li>
          <li>
            <Link href="/upgrade" className="hover:underline">
              Pro Pass
            </Link>
          </li>
        </ul>
      </section>

      <ParentalGate
        open={gateOpen}
        onClose={() => {
          setGateOpen(false);
          setPending(null);
        }}
        onSuccess={onGateSuccess}
        title="Parent Check — Sensory Controls"
      />
    </div>
  );
}
