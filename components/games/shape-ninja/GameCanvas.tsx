"use client";

import { useEffect, useRef } from "react";
import {
  isCorrectHit,
  type BloomLevelConfig,
  type BloomSpawnItem,
} from "@/components/games/shape-ninja/levelsConfig";
import {
  playBloomBoom,
  playBloomMiss,
} from "@/components/games/shape-ninja/audio";
import { stopKidsSpeech } from "@/utils/speech";
import { speakBloomLine } from "@/components/games/shape-ninja/speech";

type GameCanvasProps = {
  level: BloomLevelConfig;
  running: boolean;
  onScore: () => void;
  onMiss: () => void;
};

type Vec = { x: number; y: number };

type FloatingShape = {
  id: number;
  item: BloomSpawnItem;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  alive: boolean;
};

type Shard = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  life: number;
  color: string;
  size: number;
};

type SlashPoint = { x: number; y: number; t: number };

type Twinkle = { x: number; y: number; r: number; phase: number; speed: number };

const GRAVITY = 0.045;
const SLASH_MS = 180;
const SPAWN_MS = 1100;

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function dist(a: Vec, b: Vec) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function segmentHitsCircle(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  r: number,
) {
  const abx = bx - ax;
  const aby = by - ay;
  const acx = cx - ax;
  const acy = cy - ay;
  const abLen2 = abx * abx + aby * aby || 1;
  let t = (acx * abx + acy * aby) / abLen2;
  t = Math.max(0, Math.min(1, t));
  const px = ax + abx * t;
  const py = ay + aby * t;
  return Math.hypot(px - cx, py - cy) <= r;
}

function drawCrystalShape(
  ctx: CanvasRenderingContext2D,
  shape: BloomSpawnItem["shape"],
  x: number,
  y: number,
  size: number,
  rot: number,
  fill: string,
  glow: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Outer glow
  ctx.shadowColor = glow;
  ctx.shadowBlur = 22;

  const g = ctx.createLinearGradient(-size, -size, size, size);
  g.addColorStop(0, "#ffffffcc");
  g.addColorStop(0.35, fill);
  g.addColorStop(1, "#0f172acc");

  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(0, 0, size, 0, Math.PI * 2);
  } else if (shape === "square") {
    const s = size * 0.92;
    const rad = s * 0.22;
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(-s, -s, s * 2, s * 2, rad);
    } else {
      ctx.rect(-s, -s, s * 2, s * 2);
    }
  } else {
    // triangle
    const s = size * 1.05;
    ctx.moveTo(0, -s);
    ctx.lineTo(s, s * 0.85);
    ctx.lineTo(-s, s * 0.85);
    ctx.closePath();
  }

  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = glow;
  ctx.stroke();

  // Specular highlight
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.ellipse(-size * 0.28, -size * 0.32, size * 0.35, size * 0.18, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();

  // Soft inner refraction ring
  ctx.beginPath();
  if (shape === "circle") ctx.arc(0, 0, size * 0.62, 0, Math.PI * 2);
  else if (shape === "square") {
    const s = size * 0.55;
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(-s, -s, s * 2, s * 2, s * 0.18);
    } else {
      ctx.rect(-s, -s, s * 2, s * 2);
    }
  } else {
    const s = size * 0.55;
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.95, s * 0.7);
    ctx.lineTo(-s * 0.95, s * 0.7);
    ctx.closePath();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function spawnShards(x: number, y: number, color: string): Shard[] {
  const out: Shard[] = [];
  const n = 12 + Math.floor(Math.random() * 5);
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n + rand(-0.2, 0.2);
    const speed = rand(2.5, 7.5);
    out.push({
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - rand(1, 3),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.25, 0.25),
      life: 1,
      color,
      size: rand(4, 11),
    });
  }
  return out;
}

/**
 * Canvas render loop + touch/pointer slash for Shape Ninja Level 1.
 */
export default function GameCanvas({
  level,
  running,
  onScore,
  onMiss,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shapesRef = useRef<FloatingShape[]>([]);
  const shardsRef = useRef<Shard[]>([]);
  const slashRef = useRef<SlashPoint[]>([]);
  const twinklesRef = useRef<Twinkle[]>([]);
  const idRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const pointerDownRef = useRef(false);
  const lastPtrRef = useRef<Vec | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(running);
  const callbacksRef = useRef({ onScore, onMiss, level });

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    callbacksRef.current = { onScore, onMiss, level };
  }, [onScore, onMiss, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = Math.max(360, Math.min(window.innerHeight * 0.62, 640));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Background stars
    twinklesRef.current = Array.from({ length: 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: rand(0.6, 2.2),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.8, 2.2),
    }));

    shapesRef.current = [];
    shardsRef.current = [];
    slashRef.current = [];
    lastSpawnRef.current = performance.now();

    const toLocal = (e: PointerEvent): Vec => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      if (!runningRef.current) return;
      canvas.setPointerCapture(e.pointerId);
      pointerDownRef.current = true;
      const p = toLocal(e);
      lastPtrRef.current = p;
      slashRef.current.push({ ...p, t: performance.now() });
    };

    const onMove = (e: PointerEvent) => {
      if (!pointerDownRef.current || !runningRef.current) return;
      const p = toLocal(e);
      const prev = lastPtrRef.current;
      lastPtrRef.current = p;
      const now = performance.now();
      slashRef.current.push({ ...p, t: now });
      slashRef.current = slashRef.current.filter((s) => now - s.t < SLASH_MS);

      if (!prev) return;
      if (dist(prev, p) < 4) return;

      // Hit test
      for (const shape of shapesRef.current) {
        if (!shape.alive) continue;
        if (
          segmentHitsCircle(prev.x, prev.y, p.x, p.y, shape.x, shape.y, shape.size * 1.05)
        ) {
          shape.alive = false;
          shardsRef.current.push(...spawnShards(shape.x, shape.y, shape.item.fill));
          const { level: lvl, onScore: score, onMiss: miss } = callbacksRef.current;
          const ok = isCorrectHit(lvl, shape.item);
          if (ok) {
            playBloomBoom();
            speakBloomLine(`${shape.item.label}... BOOM!`);
            score();
          } else {
            playBloomMiss();
            miss();
          }
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      pointerDownRef.current = false;
      lastPtrRef.current = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    let last = performance.now();

    const spawnOne = (w: number, h: number) => {
      const pool = callbacksRef.current.level.spawnPool;
      if (!pool.length) return;
      const item = pick(pool);
      const size = rand(36, 52);
      const x = rand(size + 16, Math.max(size + 20, w - size - 16));
      shapesRef.current.push({
        id: idRef.current++,
        item,
        x,
        y: h + size + 10,
        vx: rand(-0.55, 0.55),
        vy: rand(-4.2, -3.1),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.02, 0.02),
        size,
        alive: true,
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // Cosmic gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#0f172a");
      bg.addColorStop(0.55, "#1e1b4b");
      bg.addColorStop(1, "#312e81");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Twinkles
      for (const t of twinklesRef.current) {
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(now * 0.002 * t.speed + t.phase));
        ctx.beginPath();
        ctx.arc(t.x * w, t.y * h, t.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      if (runningRef.current) {
        if (now - lastSpawnRef.current > SPAWN_MS) {
          lastSpawnRef.current = now;
          spawnOne(w, h);
        }

        // Shapes physics
        const nextShapes: FloatingShape[] = [];
        for (const s of shapesRef.current) {
          if (!s.alive) continue;
          s.vy += GRAVITY * (dt / 16);
          s.x += s.vx * (dt / 16) * 1.1;
          s.y += s.vy * (dt / 16) * 1.1;
          // Soft horizontal arc
          s.vx += Math.sin(now * 0.001 + s.id) * 0.008;
          s.rot += s.vr * (dt / 16);

          if (s.y < -s.size * 2) {
            // Escaped top = miss
            callbacksRef.current.onMiss();
            playBloomMiss();
            continue;
          }
          if (s.x < -s.size * 2 || s.x > w + s.size * 2) continue;
          nextShapes.push(s);
          drawCrystalShape(
            ctx,
            s.item.shape,
            s.x,
            s.y,
            s.size,
            s.rot,
            s.item.fill,
            s.item.glow,
          );
        }
        shapesRef.current = nextShapes;
      } else {
        // Still draw remaining shapes when paused/ended
        for (const s of shapesRef.current) {
          if (!s.alive) continue;
          drawCrystalShape(
            ctx,
            s.item.shape,
            s.x,
            s.y,
            s.size,
            s.rot,
            s.item.fill,
            s.item.glow,
          );
        }
      }

      // Shards
      const nextShards: Shard[] = [];
      for (const sh of shardsRef.current) {
        sh.vy += 0.18 * (dt / 16);
        sh.x += sh.vx * (dt / 16);
        sh.y += sh.vy * (dt / 16);
        sh.rot += sh.vr;
        sh.life -= 0.018 * (dt / 16);
        if (sh.life <= 0) continue;
        ctx.save();
        ctx.translate(sh.x, sh.y);
        ctx.rotate(sh.rot);
        ctx.globalAlpha = Math.max(0, sh.life);
        ctx.fillStyle = sh.color;
        ctx.fillRect(-sh.size / 2, -sh.size / 2, sh.size, sh.size * 0.6);
        ctx.restore();
        nextShards.push(sh);
      }
      shardsRef.current = nextShards;

      // Neon slash trail
      const slash = slashRef.current.filter((p) => now - p.t < SLASH_MS);
      slashRef.current = slash;
      if (slash.length >= 2) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < slash.length; i++) {
          const a = slash[i - 1]!;
          const b = slash[i]!;
          const age = (now - b.t) / SLASH_MS;
          const alpha = 1 - age;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(34,211,238,${alpha * 0.95})`;
          ctx.shadowColor = "#22d3ee";
          ctx.shadowBlur = 16;
          ctx.lineWidth = 6 * (1 - age * 0.5);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.85})`;
          ctx.lineWidth = 2.2;
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      stopKidsSpeech();
      shapesRef.current = [];
      shardsRef.current = [];
    };
  }, []);

  // Clear field when stopping / restarting
  useEffect(() => {
    if (!running) return;
    shapesRef.current = [];
    shardsRef.current = [];
    slashRef.current = [];
    lastSpawnRef.current = performance.now();
  }, [running, level.id]);

  return (
    <canvas
      ref={canvasRef}
      className="touch-none block h-full w-full cursor-crosshair rounded-[1.5rem]"
      aria-label="Shape Ninja play area — swipe to slash shapes"
    />
  );
}
