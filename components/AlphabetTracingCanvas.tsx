"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Eraser, Sparkles } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import {
  getLetterCenterlinePaths,
  type LetterCaseMode,
} from "@/utils/letterPaths";
import { formatPhonicsDisplay } from "@/utils/phonicsSounds";
import { speakEnglish } from "@/utils/speech";

type Sparkle = { id: number; x: number; y: number };

type Checkpoint = {
  x: number;
  y: number;
  strokeIndex: number;
  completed: boolean;
};

type AlphabetTracingCanvasProps = {
  letter: string;
  blend: string;
  exampleWord: string;
  onComplete?: () => void;
};

const VIEWBOX_SIZE = 300;
const TRACK_WIDTH = 38;
const BRUSH_WIDTH = 24;
const TARGET_CHECKPOINTS = 24; // evenly spaced waypoints along the centerline
const HIT_RADIUS = 24; // matches the 38px track (+ forgiving margin) without crossing into other strokes
const AUTO_COMPLETE_PERCENT = 90; // auto-complete at 90% once the child reaches the final stroke

function playTraceTone() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 520 + Math.random() * 180;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Web Audio unavailable — silent fallback
  }
}

function speakCompletion(message: string) {
  speakEnglish(message, { rate: 0.85 });
}

export default function AlphabetTracingCanvas({
  letter,
  blend,
  exampleWord,
  onComplete,
}: AlphabetTracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const checkpointsRef = useRef<Checkpoint[]>([]);
  const drawingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const completedRef = useRef(false);
  const toneCooldownRef = useRef(0);

  // Early-childhood order: start with small (lowercase) letter first, then big (uppercase)
  const [caseMode, setCaseMode] = useState<LetterCaseMode>("lower");
  const [completedCases, setCompletedCases] = useState<{
    lower: boolean;
    upper: boolean;
  }>({ lower: false, upper: false });
  const completedCasesRef = useRef<{ lower: boolean; upper: boolean }>({
    lower: false,
    upper: false,
  });

  const [coveragePercent, setCoveragePercent] = useState(0);
  const [activeGuide, setActiveGuide] = useState<{
    x: number;
    y: number;
    angleDeg: number;
  } | null>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleId = useRef(0);

  const displayChar =
    caseMode === "lower" ? letter.toLowerCase() : letter.toUpperCase();
  const strokes = useMemo(
    () => getLetterCenterlinePaths(letter, caseMode),
    [letter, caseMode],
  );

  const computeGuideCue = useCallback((points: Checkpoint[]) => {
    const nextIdx = points.findIndex((p) => !p.completed);
    if (nextIdx === -1) {
      setActiveGuide(null);
      return;
    }
    const curr = points[nextIdx];
    // Find the next point on the same stroke for the direction arrow
    const nextSameStroke =
      points[nextIdx + 1]?.strokeIndex === curr.strokeIndex
        ? points[nextIdx + 1]
        : null;
    const angleDeg = nextSameStroke
      ? (Math.atan2(nextSameStroke.y - curr.y, nextSameStroke.x - curr.x) *
          180) /
        Math.PI
      : 90;
    setActiveGuide({ x: curr.x, y: curr.y, angleDeg });
  }, []);

  const sampleCheckpoints = useCallback(() => {
    const validEls = strokes
      .map((_, idx) => ({ idx, el: pathRefs.current[idx] }))
      .filter(
        (item): item is { idx: number; el: SVGPathElement } => item.el != null,
      );

    if (validEls.length === 0) return;

    const lengths = validEls.map((item) => item.el.getTotalLength());
    const totalLength = lengths.reduce((sum, len) => sum + len, 0);
    if (totalLength <= 0) return;

    const sampled: Checkpoint[] = [];
    validEls.forEach((item, i) => {
      const len = lengths[i];
      const count = Math.max(
        3,
        Math.round((len / totalLength) * TARGET_CHECKPOINTS),
      );
      for (let step = 0; step < count; step++) {
        const t = count === 1 ? 0 : step / (count - 1);
        const pt = item.el.getPointAtLength(t * len);
        sampled.push({
          x: pt.x,
          y: pt.y,
          strokeIndex: item.idx,
          completed: false,
        });
      }
    });

    checkpointsRef.current = sampled;
    completedRef.current = false;
    setCoveragePercent(0);
    computeGuideCue(sampled);
  }, [strokes, computeGuideCue]);

  const clearDrawingCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Reset to small (lowercase) first and clear per-case completion when switching letters
  useEffect(() => {
    setCaseMode("lower");
    completedCasesRef.current = { lower: false, upper: false };
    setCompletedCases({ lower: false, upper: false });
  }, [letter]);

  // Re-sample checkpoints and clear canvas whenever the letter or case changes
  useEffect(() => {
    pathRefs.current = pathRefs.current.slice(0, strokes.length);
    const frame = requestAnimationFrame(() => {
      clearDrawingCanvas();
      sampleCheckpoints();
    });
    return () => cancelAnimationFrame(frame);
  }, [letter, caseMode, strokes, clearDrawingCanvas, sampleCheckpoints]);

  // Keep drawing canvas crisp at 300x300 logical coordinates (scales cleanly with CSS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = VIEWBOX_SIZE;
    canvas.height = VIEWBOX_SIZE;
  }, []);

  const markCheckpointsNear = useCallback(
    (x: number, y: number) => {
      const points = checkpointsRef.current;
      if (points.length === 0) return;

      // Only score checkpoints on the current active stroke so nearby strokes aren't completed early
      const firstUncompleted = points.find((p) => !p.completed);
      if (!firstUncompleted) return;
      const activeStrokeIndex = firstUncompleted.strokeIndex;

      const rSq = HIT_RADIUS * HIT_RADIUS;
      let changed = false;
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (pt.completed || pt.strokeIndex !== activeStrokeIndex) continue;
        const dx = pt.x - x;
        const dy = pt.y - y;
        if (dx * dx + dy * dy <= rSq) {
          pt.completed = true;
          changed = true;
        }
      }

      if (!changed) return;

      const completedCount = points.reduce(
        (acc, pt) => acc + (pt.completed ? 1 : 0),
        0,
      );
      const rawPercent = Math.round((completedCount / points.length) * 100);
      const lastStrokeIndex = points[points.length - 1].strokeIndex;
      const startedFinalStroke = points.some(
        (pt) => pt.strokeIndex === lastStrokeIndex && pt.completed,
      );

      if (
        !completedRef.current &&
        rawPercent >= AUTO_COMPLETE_PERCENT &&
        startedFinalStroke
      ) {
        completedRef.current = true;
        for (let i = 0; i < points.length; i++) {
          points[i].completed = true;
        }
        setCoveragePercent(100);
        setActiveGuide(null);
        const caseLabel = caseMode === "lower" ? "small" : "big";
        speakCompletion(`Wonderful! ${caseLabel} ${letter} says ${blend}!`);

        // Award stars once per case: doing one awards once; doing both awards for both!
        if (!completedCasesRef.current[caseMode]) {
          completedCasesRef.current = {
            ...completedCasesRef.current,
            [caseMode]: true,
          };
          setCompletedCases(completedCasesRef.current);
          onComplete?.();
        }
      } else if (!completedRef.current) {
        setCoveragePercent(rawPercent);
        computeGuideCue(points);
      }
    },
    [blend, caseMode, computeGuideCue, letter, onComplete],
  );

  const drawRainbowSegment = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / 5));

      for (let s = 0; s <= steps; s++) {
        const t = steps === 0 ? 1 : s / steps;
        const px = from.x + dx * t;
        const py = from.y + dy * t;
        const hue = Math.round(((px + py) / (VIEWBOX_SIZE * 2)) * 360);

        ctx.beginPath();
        ctx.arc(px, py, BRUSH_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue} 88% 60%)`;
        ctx.fill();

        markCheckpointsNear(px, py);
      }
    },
    [markCheckpointsNear],
  );

  const getBoardPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * VIEWBOX_SIZE,
      y: ((clientY - rect.top) / rect.height) * VIEWBOX_SIZE,
    };
  };

  const addSparkle = (clientX: number, clientY: number) => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const id = sparkleId.current++;
    setSparkles((prev) => [
      ...prev.slice(-12),
      { id, x: clientX - rect.left, y: clientY - rect.top },
    ]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 600);
  };

  const maybePlayTone = () => {
    const now = performance.now();
    if (now - toneCooldownRef.current > 90) {
      toneCooldownRef.current = now;
      playTraceTone();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getBoardPoint(e.clientX, e.clientY);
    if (!pt) return;
    lastPtRef.current = pt;
    maybePlayTone();
    addSparkle(e.clientX, e.clientY);
    drawRainbowSegment(pt, pt);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pt = getBoardPoint(e.clientX, e.clientY);
    if (!pt) return;
    const prev = lastPtRef.current ?? pt;
    lastPtRef.current = pt;
    maybePlayTone();
    addSparkle(e.clientX, e.clientY);
    drawRainbowSegment(prev, pt);
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
    lastPtRef.current = null;
  };

  const resetCanvas = () => {
    clearDrawingCanvas();
    sampleCheckpoints();
  };

  return (
    <div className="kid-card relative overflow-hidden border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-sky-50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Sparkles className="h-6 w-6 text-purple-500" aria-hidden />
            Trace the Letter{" "}
            <span className="gradient-letter-cool text-2xl font-bold">
              {formatPhonicsDisplay(letter)}
            </span>
          </h3>
          <p className="text-sm text-slate-600">
            Start at the glowing dot and follow the dotted line!
          </p>
        </div>
        <MotionPressable
          onClick={resetCanvas}
          ariaLabel="Clear tracing canvas"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border-b-4 border-slate-200 bg-white text-slate-600 shadow-lg active:translate-y-0.5"
        >
          <Eraser className="h-5 w-5" aria-hidden />
        </MotionPressable>
      </div>

      {/* Small (lowercase) first, then Big (uppercase) — child can trace either one or both */}
      <div className="mb-3 flex items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => setCaseMode("lower")}
          className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-base font-extrabold shadow-sm transition ${
            caseMode === "lower"
              ? "border-purple-500 bg-purple-600 text-white shadow-md"
              : "border-purple-200 bg-white text-purple-800 hover:bg-purple-50"
          }`}
        >
          <span className="text-xl leading-none">{letter.toLowerCase()}</span>
          <span>Small</span>
          {completedCases.lower && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-white">
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCaseMode("upper")}
          className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-base font-extrabold shadow-sm transition ${
            caseMode === "upper"
              ? "border-indigo-500 bg-indigo-600 text-white shadow-md"
              : "border-indigo-200 bg-white text-indigo-800 hover:bg-indigo-50"
          }`}
        >
          <span className="text-xl leading-none">{letter.toUpperCase()}</span>
          <span>Big</span>
          {completedCases.upper && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-white">
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
          )}
        </button>
      </div>

      <div
        className="relative mx-auto aspect-square w-full max-w-[360px] select-none overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-fuchsia-50 to-blue-50 shadow-inner"
        style={{ touchAction: "none" }}
      >
        {/* Single-line centerline SVG guide (wide soft track + dotted centerline + start dot & direction cue) */}
        <svg
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {/* Wide soft toddler-friendly track */}
          {strokes.map((d, i) => (
            <path
              key={`track-${letter}-${caseMode}-${i}`}
              d={d}
              fill="none"
              stroke="#ddd6fe"
              strokeWidth={TRACK_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Clear single dotted centerline inside the track */}
          {strokes.map((d, i) => (
            <path
              key={`center-${letter}-${caseMode}-${i}`}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={d}
              fill="none"
              stroke="#818cf8"
              strokeWidth={5}
              strokeDasharray="2 14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Glowing starting dot & subtle direction cue for the current stroke */}
          {activeGuide && (
            <g transform={`translate(${activeGuide.x}, ${activeGuide.y})`}>
              <circle
                r={20}
                fill="#34d399"
                opacity={0.3}
                className="animate-ping"
              />
              <circle
                r={13}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={3.5}
              />
              <g transform={`rotate(${activeGuide.angleDeg}) translate(22, 0)`}>
                <path
                  d="M -4 -5 L 4 0 L -4 5"
                  fill="none"
                  stroke="#059669"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          )}
        </svg>

        {/* Smooth rainbow stroke drawing layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          aria-label={`Trace the letter ${letter}`}
        />

        <AnimatePresence>
          {sparkles.map((s) => (
            <motion.span
              key={s.id}
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.5, y: -20 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute"
              style={{
                left: s.x,
                top: s.y,
                transform: "translate(-50%, -50%)",
                color: `hsl(${(s.x * 3) % 360}, 85%, 55%)`,
              }}
            >
              <Sparkles className="h-5 w-5" aria-hidden />
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4">
        <div className="h-4 overflow-hidden rounded-full border-2 border-white bg-slate-200 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-center text-sm font-semibold text-slate-600">
          {coveragePercent}% traced ({caseMode === "lower" ? "Small" : "Big"}{" "}
          {displayChar}) · {exampleWord} starts with {letter.toUpperCase()}!
        </p>

        {caseMode === "lower" &&
          completedCases.lower &&
          !completedCases.upper && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setCaseMode("upper")}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
              >
                Awesome! Now trace Big {letter.toUpperCase()} for more stars
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}

        {completedCases.lower && completedCases.upper && (
          <p className="mt-2 text-center text-sm font-extrabold text-emerald-700">
            ⭐ Both small {letter.toLowerCase()} &amp; Big {letter.toUpperCase()}{" "}
            completed!
          </p>
        )}
      </div>
    </div>
  );
}
