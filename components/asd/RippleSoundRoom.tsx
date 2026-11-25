"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CloudRain, Droplets, Wind } from "lucide-react";
import AmbientSceneArt from "@/components/asd/AmbientSceneArt";
import {
  playTapTone,
  stopAmbientSound,
  toggleAmbientSound,
  type AmbientKind,
} from "@/utils/asdAudio";
import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";
import { triggerHaptic } from "@/utils/haptics";

type Ripple = {
  x: number;
  y: number;
  r: number;
  max: number;
  alpha: number;
  color: string;
};

const SOUND_CARDS: {
  id: AmbientKind;
  label: string;
  Icon: typeof CloudRain;
  activeClass: string;
  idleClass: string;
  videoSrc: string;
}[] = [
  {
    id: "rain",
    label: "Rain",
    Icon: CloudRain,
    activeClass: "border-sky-500 bg-sky-200 text-sky-900 ring-2 ring-sky-300",
    idleClass: "border-sky-200 bg-white/90 text-sky-800",
    videoSrc: "/asd/ripple/rain-3d-loop.mp4",
  },
  {
    id: "ocean",
    label: "Ocean",
    Icon: Droplets,
    activeClass: "border-cyan-500 bg-cyan-200 text-cyan-950 ring-2 ring-cyan-300",
    idleClass: "border-cyan-200 bg-white/90 text-cyan-800",
    videoSrc: "/asd/ripple/ocean-3d-loop.mp4",
  },
  {
    id: "wind",
    label: "Soft Wind",
    Icon: Wind,
    activeClass:
      "border-emerald-500 bg-emerald-200 text-emerald-950 ring-2 ring-emerald-300",
    idleClass: "border-emerald-200 bg-white/90 text-emerald-800",
    videoSrc: "/asd/ripple/wind-3d-loop.mp4",
  },
];

const RIPPLE_BY_SCENE: Record<AmbientKind | "default", string[]> = {
  default: [
    "rgba(167, 139, 250, 0.9)",
    "rgba(56, 189, 248, 0.85)",
    "rgba(244, 114, 182, 0.8)",
  ],
  rain: [
    "rgba(71, 85, 105, 0.75)",
    "rgba(125, 211, 252, 0.9)",
    "rgba(148, 163, 184, 0.8)",
  ],
  ocean: [
    "rgba(6, 182, 212, 0.9)",
    "rgba(34, 211, 238, 0.85)",
    "rgba(14, 116, 144, 0.75)",
  ],
  wind: [
    "rgba(52, 211, 153, 0.85)",
    "rgba(110, 231, 183, 0.9)",
    "rgba(16, 185, 129, 0.75)",
  ],
};

/**
 * Activity 7 — Looping ambient scene videos + ripples + louder sound.
 */
export default function RippleSoundRoom() {
  const { prefs } = useSensoryPrefs();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number | null>(null);
  const [activeSound, setActiveSound] = useState<AmbientKind | null>(null);

  const activeCard = SOUND_CARDS.find((c) => c.id === activeSound) ?? null;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    for (const ripple of ripplesRef.current) {
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
      ctx.strokeStyle = ripple.color.replace(
        /[\d.]+\)$/,
        `${ripple.alpha.toFixed(3)})`,
      );
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, Math.max(0, ripple.r * 0.55), 0, Math.PI * 2);
      ctx.strokeStyle = ripple.color.replace(
        /[\d.]+\)$/,
        `${(ripple.alpha * 0.45).toFixed(3)})`,
      );
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(280, Math.floor(rect.width));
    const cssH = Math.max(360, Math.floor(rect.height));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      const speed = prefs.reducedMotion ? 0.9 : 1.35;
      ripplesRef.current = ripplesRef.current
        .map((r) => ({
          ...r,
          r: r.r + speed,
          alpha: r.alpha - (prefs.reducedMotion ? 0.018 : 0.012),
        }))
        .filter((r) => r.alpha > 0 && r.r < r.max);
      redraw();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [prefs.reducedMotion, redraw]);

  useEffect(() => {
    return () => stopAmbientSound();
  }, []);

  // Keep looping video playing when a sound scene is active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!activeCard) {
      video.pause();
      return;
    }
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    void video.play().catch(() => undefined);
  }, [activeCard]);

  const spawnRipple = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const palette = RIPPLE_BY_SCENE[activeSound ?? "default"];
    ripplesRef.current.push({
      x,
      y,
      r: 4,
      max: Math.min(rect.width, rect.height) * 0.55,
      alpha: 0.95,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
    if (ripplesRef.current.length > 18) {
      ripplesRef.current = ripplesRef.current.slice(-12);
    }
    triggerHaptic(18);
    playTapTone(523.25 + Math.random() * 120, 90);
  };

  const onSoundToggle = (kind: AmbientKind) => {
    triggerHaptic(25);
    const next = toggleAmbientSound(activeSound === kind ? null : kind);
    setActiveSound(next);
  };

  const sceneLabel =
    activeSound === "rain"
      ? "Rain video looping"
      : activeSound === "ocean"
        ? "Ocean waves looping"
        : activeSound === "wind"
          ? "Wind meadow looping"
          : "Pick Rain, Ocean, or Wind for a looping scene";

  return (
    <div className="relative min-h-[75vh] overflow-hidden rounded-3xl border-4 border-white bg-sky-50 text-slate-800 shadow-xl">
      {!activeSound && <AmbientSceneArt kind={null} />}

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-4">
        <Link
          href="/asd"
          className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-md backdrop-blur-md"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Sensory Hub
        </Link>
        <p className="rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-indigo-700 shadow">
          Always free · calm room
        </p>
      </div>

      <div className="relative z-10 px-4 pb-2">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Ripple Sound Room
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-700">{sceneLabel}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-600">
          Tap the scene for ripples. Videos and sound keep looping while on.
        </p>
      </div>

      <div
        ref={wrapRef}
        className="relative z-10 mx-4 mt-3 min-h-[22rem] flex-1 overflow-hidden rounded-3xl border-4 border-white/80 shadow-inner sm:min-h-[28rem]"
      >
        {activeCard ? (
          <video
            key={activeCard.videoSrc}
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={`${activeCard.videoSrc}?v=3d`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={`${activeCard.label} scene video looping`}
          />
        ) : (
          <AmbientSceneArt kind={null} />
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 h-full w-full touch-none cursor-pointer"
          onPointerDown={(e) => spawnRipple(e.clientX, e.clientY)}
          aria-label="Ripple scene. Tap to make soft water rings."
        />
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2 p-4 sm:gap-3">
        {SOUND_CARDS.map((card) => {
          const Icon = card.Icon;
          const on = activeSound === card.id;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSoundToggle(card.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 border-b-4 px-2 py-3 text-center text-sm font-extrabold shadow-lg transition ${
                on ? card.activeClass : card.idleClass
              }`}
            >
              <Icon className="h-7 w-7" aria-hidden />
              {card.label}
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                {on ? "Looping" : "Tap"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
