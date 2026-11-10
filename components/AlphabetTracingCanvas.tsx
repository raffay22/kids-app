"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, Sparkles } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import { formatPhonicsDisplay } from "@/utils/phonicsSounds";
import { speakEnglish } from "@/utils/speech";

type Sparkle = { id: number; x: number; y: number };

type AlphabetTracingCanvasProps = {
  letter: string;
  blend: string;
  exampleWord: string;
  onComplete?: () => void;
};

const COVERAGE_TARGET = 1.0;
const STROKE_WIDTH = 18;

function playTraceTone() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 520 + Math.random() * 180;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
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
  const guideMaskRef = useRef<Uint8Array | null>(null);
  const tracedMaskRef = useRef<Uint8Array | null>(null);
  const maskSizeRef = useRef({ w: 0, h: 0 });
  const drawingRef = useRef(false);
  const completedRef = useRef(false);

  const [coverage, setCoverage] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleId = useRef(0);

  const buildGuideMask = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = `bold ${Math.floor(h * 0.65)}px Geist, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter.toUpperCase(), w / 2, h / 2 + h * 0.05);

    const imageData = ctx.getImageData(0, 0, w, h);
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const alpha = imageData.data[i * 4 + 3];
      mask[i] = alpha > 20 ? 1 : 0;
    }

    guideMaskRef.current = mask;
    tracedMaskRef.current = new Uint8Array(w * h);
    maskSizeRef.current = { w, h };

    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#fdf4ff");
    bg.addColorStop(1, "#eff6ff");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.font = `bold ${Math.floor(h * 0.65)}px Fredoka, Geist, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const tx = w / 2;
    const ty = h / 2 + h * 0.05;

    // High-contrast dashed outline so the trace target reads clearly against the pastel canvas
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.strokeText(letter.toUpperCase(), tx, ty);
    ctx.setLineDash([]);

    const letterFill = ctx.createLinearGradient(0, 0, 0, h);
    letterFill.addColorStop(0, "#a5b4fc");
    letterFill.addColorStop(1, "#818cf8");
    ctx.fillStyle = letterFill;
    ctx.globalAlpha = 0.55;
    ctx.fillText(letter.toUpperCase(), tx, ty);
    ctx.globalAlpha = 1;
  }, [letter]);

  const computeCoverage = useCallback(() => {
    const guide = guideMaskRef.current;
    const traced = tracedMaskRef.current;
    if (!guide || !traced) return 0;

    let guideCount = 0;
    let hitCount = 0;
    for (let i = 0; i < guide.length; i++) {
      if (guide[i]) {
        guideCount++;
        if (traced[i]) hitCount++;
      }
    }
    return guideCount === 0 ? 0 : hitCount / guideCount;
  }, []);

  const drawStroke = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const guide = guideMaskRef.current;
      const traced = tracedMaskRef.current;
      const { w, h } = maskSizeRef.current;
      if (!ctx || !canvas || !guide || !traced || w === 0) return;

      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = STROKE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const px = Math.floor(x);
      const py = Math.floor(y);
      const radius = Math.ceil(STROKE_WIDTH / 2);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const ix = px + dx;
          const iy = py + dy;
          if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
          const idx = iy * w + ix;
          if (guide[idx]) traced[idx] = 1;
        }
      }

      // Rainbow stroke — hue follows position for a magical crayon feel
      const hue = Math.round(((x + y) / (w + h)) * 360);
      ctx.beginPath();
      ctx.arc(x, y, STROKE_WIDTH / 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue} 85% 60%)`;
      ctx.fill();

      const cov = computeCoverage();
      setCoverage(cov);

      if (!completedRef.current && cov >= COVERAGE_TARGET) {
        completedRef.current = true;
        speakCompletion(`Wonderful! ${letter} says ${blend}!`);
        onComplete?.();
      }
    },
    [blend, computeCoverage, letter, onComplete],
  );

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e.clientX, e.clientY);
    if (!pt) return;
    playTraceTone();
    addSparkle(e.clientX, e.clientY);
    drawStroke(pt.x, pt.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const pt = getCanvasPoint(e.clientX, e.clientY);
    if (!pt) return;
    playTraceTone();
    addSparkle(e.clientX, e.clientY);
    drawStroke(pt.x, pt.y);
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    completedRef.current = false;
    setCoverage(0);
    buildGuideMask(ctx, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const size = Math.min(parent.clientWidth, 360);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) buildGuideMask(ctx, size, size);
      completedRef.current = false;
      setCoverage(0);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [letter, buildGuideMask]);

  const coveragePercent = Math.round(coverage * 100);

  return (
    <div className="kid-card relative overflow-hidden border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-sky-50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Sparkles className="h-6 w-6 text-purple-500" aria-hidden />
            Trace the Letter{" "}
            <span className="gradient-letter-cool text-2xl font-bold">{formatPhonicsDisplay(letter)}</span>
          </h3>
          <p className="text-sm text-slate-600">Follow the letter — rainbow sparkles as you go!</p>
        </div>
        <MotionPressable
          onClick={resetCanvas}
          ariaLabel="Clear tracing canvas"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border-b-4 border-slate-200 bg-white text-slate-600 shadow-lg active:translate-y-0.5"
        >
          <Eraser className="h-5 w-5" aria-hidden />
        </MotionPressable>
      </div>

      <div className="relative mx-auto max-w-[360px]">
        <canvas
          ref={canvasRef}
          className="touch-none w-full rounded-2xl border-2 border-purple-200 bg-slate-50 shadow-inner"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
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
          {coveragePercent}% traced · {exampleWord} starts with {letter.toUpperCase()}!
        </p>
      </div>
    </div>
  );
}
