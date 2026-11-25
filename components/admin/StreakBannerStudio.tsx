"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Download, Flame, RefreshCw } from "lucide-react";

type Shoutout = {
  id: string;
  child_id: string;
  current_streak: number;
  longest_streak: number;
  nickname: string;
  whatsappText: string;
};

export default function StreakBannerStudio() {
  const [rows, setRows] = useState<Shoutout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Shoutout | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/streak-shoutouts");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load streaks");
      setLoading(false);
      return;
    }
    setRows(data.shoutouts ?? []);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selected || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 1080;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#f97316");
    grad.addColorStop(0.5, "#ef4444");
    grad.addColorStop(1, "#b91c1c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(200, 200, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(900, 880, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff7ed";
    ctx.font = "bold 48px Fredoka, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Kids Learning App", w / 2, 160);

    ctx.font = "bold 120px Fredoka, system-ui, sans-serif";
    ctx.fillText("🔥", w / 2, 380);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px Fredoka, system-ui, sans-serif";
    ctx.fillText(`${selected.current_streak}-Day Streak!`, w / 2, 520);

    ctx.font = "bold 56px Fredoka, system-ui, sans-serif";
    ctx.fillText(selected.nickname, w / 2, 620);

    ctx.font = "36px Fredoka, system-ui, sans-serif";
    ctx.fillStyle = "#ffedd5";
    ctx.fillText("Keep practicing every day!", w / 2, 720);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "28px Fredoka, system-ui, sans-serif";
    ctx.fillText("Share the win on WhatsApp", w / 2, 920);
  }, [selected]);

  const downloadPng = () => {
    if (!canvasRef.current || !selected) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `streak-${selected.nickname}-${selected.current_streak}.png`;
    a.click();
  };

  const copyText = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.whatsappText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Streak Banner Studio</h3>
          <p className="text-sm text-slate-600">
            Children with current streak ≥ 7 — generate a shareable PNG + WhatsApp copy.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

      {!loading && rows.length === 0 ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No 7+ day streaks yet. Keep practicing!
        </p>
      ) : null}

      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => setSelected(row)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                selected?.id === row.id
                  ? "border-orange-400 bg-orange-50"
                  : "border-slate-100 bg-white"
              }`}
            >
              <Flame className="h-5 w-5 text-orange-500" aria-hidden />
              <span>
                <span className="block font-semibold text-slate-800">
                  {row.nickname}
                </span>
                <span className="text-xs text-slate-500">
                  {row.current_streak} days (best {row.longest_streak})
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <div className="space-y-3 rounded-2xl border border-orange-100 bg-white p-4">
          <canvas
            ref={canvasRef}
            className="mx-auto h-auto w-full max-w-sm rounded-2xl shadow-lg"
          />
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {selected.whatsappText}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadPng}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download PNG
            </button>
            <button
              type="button"
              onClick={() => void copyText()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Copy className="h-4 w-4" aria-hidden />
              {copied ? "Copied!" : "Copy WhatsApp text"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
