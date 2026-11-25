"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { playTapTone } from "@/utils/asdAudio";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";
import { getSensoryTtsSpeed } from "@/utils/sensoryPrefs";
import { speakEnglish, stopKidsSpeech } from "@/utils/speech";
import { triggerHaptic } from "@/utils/haptics";

/** px per ms — above this freezes the trail and coaches slow movement. */
const VELOCITY_LIMIT = 1.35;
/** How close (px) a point must be to a sample on the guide path to count. */
const PATH_HIT_RADIUS = 28;
/** Fraction of guide samples that must be visited to complete. */
const COMPLETION_RATIO = 0.72;

type Pt = { x: number; y: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

function buildWavePath(w: number, h: number): Pt[] {
  const pts: Pt[] = [];
  const padX = Math.max(40, w * 0.08);
  const midY = h * 0.48;
  const amp = Math.min(h * 0.18, 70);
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = padX + t * (w - padX * 2);
    const y = midY + Math.sin(t * Math.PI * 2.2) * amp;
    pts.push({ x, y });
  }
  return pts;
}

function dist(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/**
 * Activity 5 — Velocity-controlled slow tracing pad.
 * HTML5 Canvas only — no raster images. Always free.
 */
export default function SlowTracingPad() {
  const { prefs } = useSensoryPrefs();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<Pt[]>([]);
  const visitedRef = useRef<Uint8Array | null>(null);
  const trailRef = useRef<Pt[]>([]);
  const lastRef = useRef<{ pt: Pt; t: number } | null>(null);
  const drawingRef = useRef(false);
  const frozenRef = useRef(false);
  const completeRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const toneCooldownRef = useRef(0);
  const warnCooldownRef = useRef(0);

  const [status, setStatus] = useState("Trace the glowing wave — slowly");
  const [frozen, setFrozen] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Soft background wash
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#f5f3ff");
    bg.addColorStop(0.5, "#eef2ff");
    bg.addColorStop(1, "#ecfeff");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const guide = guideRef.current;
    if (guide.length > 1) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = frozenRef.current ? 10 : 8;
      ctx.strokeStyle = frozenRef.current
        ? "rgba(251, 146, 60, 0.55)"
        : "rgba(167, 139, 250, 0.45)";
      ctx.beginPath();
      ctx.moveTo(guide[0].x, guide[0].y);
      for (let i = 1; i < guide.length; i++) {
        ctx.lineTo(guide[i].x, guide[i].y);
      }
      ctx.stroke();

      // Soft glow under guide
      if (!prefs.reducedMotion && !frozenRef.current) {
        ctx.save();
        ctx.shadowColor = "rgba(196, 181, 253, 0.9)";
        ctx.shadowBlur = 14;
        ctx.strokeStyle = "rgba(196, 181, 253, 0.35)";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }

      // Start / end dots
      const start = guide[0];
      const end = guide[guide.length - 1];
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath();
      ctx.arc(start.x, start.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = completeRef.current ? "#34d399" : "#a78bfa";
      ctx.beginPath();
      ctx.arc(end.x, end.y, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    const trail = trailRef.current;
    if (trail.length > 1) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 7;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#f472b6");
      grad.addColorStop(0.5, "#a78bfa");
      grad.addColorStop(1, "#22d3ee");
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.stroke();
    }

    // Sparkle particles
    for (const p of particlesRef.current) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (completeRef.current) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fbbf24";
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.08;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const ax = cx + Math.cos(a) * r;
        const ay = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
        const b = a + Math.PI / 5;
        ctx.lineTo(cx + Math.cos(b) * r * 0.45, cy + Math.sin(b) * r * 0.45);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }, [prefs.reducedMotion]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(280, Math.floor(rect.width));
    const cssH = Math.max(320, Math.floor(rect.height));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    guideRef.current = buildWavePath(cssW, cssH);
    visitedRef.current = new Uint8Array(guideRef.current.length);
    trailRef.current = [];
    particlesRef.current = [];
    completeRef.current = false;
    frozenRef.current = false;
    setDone(false);
    setFrozen(false);
    setProgress(0);
    setStatus("Trace the glowing wave — slowly");
    redraw();
  }, [redraw]);

  useEffect(() => {
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resize]);

  useEffect(() => {
    const tick = () => {
      if (!prefs.reducedMotion && particlesRef.current.length) {
        particlesRef.current = particlesRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.03,
          }))
          .filter((p) => p.life > 0);
        redraw();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [prefs.reducedMotion, redraw]);

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const markVisited = (pt: Pt) => {
    const guide = guideRef.current;
    const visited = visitedRef.current;
    if (!visited) return;
    for (let i = 0; i < guide.length; i++) {
      if (visited[i]) continue;
      if (dist(pt, guide[i]) <= PATH_HIT_RADIUS) {
        visited[i] = 1;
      }
    }
    let hit = 0;
    for (let i = 0; i < visited.length; i++) hit += visited[i];
    const ratio = hit / visited.length;
    setProgress(Math.round(ratio * 100));
    if (ratio >= COMPLETION_RATIO && !completeRef.current) {
      completeRef.current = true;
      setDone(true);
      setStatus("Beautiful slow tracing!");
      triggerHaptic(30);
      stopKidsSpeech();
      speakEnglish("Beautiful slow tracing!", {
        rate: getSensoryTtsSpeed(),
        pitch: 1.05,
      });
      playTapTone(659.25, 180);
      if (!prefs.reducedMotion) {
        const canvas = canvasRef.current;
        const cx = (canvas?.clientWidth ?? 200) / 2;
        const cy = (canvas?.clientHeight ?? 200) / 2;
        for (let i = 0; i < 28; i++) {
          const a = (Math.PI * 2 * i) / 28;
          particlesRef.current.push({
            x: cx,
            y: cy,
            vx: Math.cos(a) * (1.5 + Math.random()),
            vy: Math.sin(a) * (1.5 + Math.random()),
            life: 1,
            color: ["#fbbf24", "#f472b6", "#a78bfa", "#22d3ee"][i % 4],
          });
        }
      }
      redraw();
    }
  };

  const warnSlow = () => {
    const now = performance.now();
    if (now - warnCooldownRef.current < 1600) return;
    warnCooldownRef.current = now;
    frozenRef.current = true;
    setFrozen(true);
    setStatus("Slow down to guide your friend!");
    triggerHaptic(40);
    stopKidsSpeech();
    speakEnglish("Slow down to guide your friend!", {
      rate: getSensoryTtsSpeed(),
      pitch: 1.0,
    });
    redraw();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (completeRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    frozenRef.current = false;
    setFrozen(false);
    const pt = pointerPos(e);
    lastRef.current = { pt, t: performance.now() };
    trailRef.current = [pt];
    markVisited(pt);
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || completeRef.current) return;
    const pt = pointerPos(e);
    const last = lastRef.current;
    const now = performance.now();
    if (last) {
      const dt = Math.max(1, now - last.t);
      const velocity = dist(pt, last.pt) / dt;
      if (velocity > VELOCITY_LIMIT) {
        warnSlow();
        lastRef.current = { pt, t: now };
        return;
      }
      if (frozenRef.current) {
        // Resume when child slows down again
        frozenRef.current = false;
        setFrozen(false);
        setStatus("Nice and slow — keep going");
      }
    }

    trailRef.current.push(pt);
    if (trailRef.current.length > 800) {
      trailRef.current = trailRef.current.slice(-600);
    }
    lastRef.current = { pt, t: now };
    markVisited(pt);

    if (!prefs.reducedMotion && now - toneCooldownRef.current > 90) {
      toneCooldownRef.current = now;
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99];
      playTapTone(notes[trailRef.current.length % notes.length], 70);
      particlesRef.current.push({
        x: pt.x,
        y: pt.y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8 - 0.4,
        life: 1,
        color: "#c4b5fd",
      });
    }
    redraw();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    lastRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const reset = () => {
    stopKidsSpeech();
    resize();
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 bg-slate-50 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/asd"
          className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-xl backdrop-blur-xl"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Sensory Hub
        </Link>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-violet-800">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Always free · calm motor
        </p>
      </div>

      <section className="rounded-3xl border-4 border-white bg-white/95 p-5 shadow-xl backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Slow Tracing Pad
        </h1>
        <p className="mt-1 text-base font-medium text-slate-600" role="status">
          {status}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
          <div
            className="h-full rounded-full bg-violet-500 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <div
        ref={wrapRef}
        className={`relative min-h-[22rem] flex-1 overflow-hidden rounded-3xl border-4 border-b-8 shadow-xl backdrop-blur-xl sm:min-h-[28rem] ${
          frozen
            ? "border-orange-300 bg-orange-50/80"
            : "border-violet-200 bg-white/90"
        }`}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="Slow tracing canvas. Draw along the glowing wave slowly."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl border-b-4 border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-md"
        >
          Reset path
        </button>
        {done && (
          <p className="self-center text-sm font-bold text-emerald-700">
            Path complete — soft star burst
          </p>
        )}
      </div>
    </div>
  );
}
