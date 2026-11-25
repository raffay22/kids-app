"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Moon, Plus, Trash2 } from "lucide-react";

type BedtimeRow = {
  id: string;
  story_number: number;
  story_id: string;
  title: string;
  youtube_id: string;
  moral_lesson: string | null;
  theme: string;
  cover_image: string | null;
  is_active: boolean;
};

type ToddlerRow = {
  id: string;
  story_id: string;
  title: string;
  theme: string;
  video_url: string;
  thumbnail_url: string | null;
  narrative_text: string | null;
  is_active: boolean;
};

const emptyBedtime = {
  title: "",
  moral_lesson: "",
  theme: "kindness",
  youtube_url: "",
};

const emptyToddler = {
  title: "",
  theme: "adventure",
  video_url: "",
  thumbnail_url: "",
  narrative_text: "",
};

export default function StoryCmsManager() {
  const [section, setSection] = useState<"bedtime" | "toddlers">("bedtime");

  const [bedtimeRows, setBedtimeRows] = useState<BedtimeRow[]>([]);
  const [bedtimeForm, setBedtimeForm] = useState(emptyBedtime);
  const [bedtimeMissing, setBedtimeMissing] = useState(false);

  const [toddlerRows, setToddlerRows] = useState<ToddlerRow[]>([]);
  const [toddlerForm, setToddlerForm] = useState(emptyToddler);
  const [toddlerMissing, setToddlerMissing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, tRes] = await Promise.all([
        fetch("/api/admin/bedtime-stories"),
        fetch("/api/admin/toddler-stories"),
      ]);
      const [bData, tData] = await Promise.all([bRes.json(), tRes.json()]);

      if (bRes.ok) {
        setBedtimeMissing(Boolean(bData.missingTable));
        setBedtimeRows(bData.stories ?? []);
      }
      if (tRes.ok) {
        setToddlerMissing(Boolean(tData.missingTable));
        setToddlerRows(tData.stories ?? []);
      }
    } catch {
      setError("Failed to load stories from Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleCreateBedtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const res = await fetch("/api/admin/bedtime-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bedtimeForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to add bedtime story");
      return;
    }
    setBedtimeForm(emptyBedtime);
    setStatus(`Added bedtime story "${data.story?.title}" — live immediately!`);
    await loadAll();
  };

  const toggleBedtimeActive = async (row: BedtimeRow) => {
    await fetch("/api/admin/bedtime-stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, is_active: !row.is_active }),
    });
    await loadAll();
  };

  const deleteBedtime = async (id: string) => {
    await fetch(`/api/admin/bedtime-stories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await loadAll();
  };

  const handleCreateToddler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const res = await fetch("/api/admin/toddler-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toddlerForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to add toddler story");
      return;
    }
    setToddlerForm(emptyToddler);
    setStatus(`Added toddler story "${data.story?.title}" — live immediately!`);
    await loadAll();
  };

  const toggleToddlerActive = async (row: ToddlerRow) => {
    await fetch("/api/admin/toddler-stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, is_active: !row.is_active }),
    });
    await loadAll();
  };

  const deleteToddler = async (id: string) => {
    await fetch(`/api/admin/toddler-stories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await loadAll();
  };

  const showMigrationBanner =
    (section === "bedtime" && bedtimeMissing) ||
    (section === "toddlers" && toddlerMissing);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Stories CMS (Zero-Rebuild)</h3>
          <p className="text-sm text-slate-600">
            Add Bedtime YouTube stories or Toddler Storage video stories — published instantly from Supabase without a Netlify rebuild.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSection("bedtime");
              setError(null);
              setStatus(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              section === "bedtime"
                ? "bg-indigo-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Moon className="h-3.5 w-3.5" aria-hidden />
            Bedtime Stories ({bedtimeRows.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSection("toddlers");
              setError(null);
              setStatus(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              section === "toddlers"
                ? "bg-sky-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            Toddler Stories ({toddlerRows.length})
          </button>
        </div>
      </div>

      {showMigrationBanner && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-sm">
                ⚠️ Supabase Table Missing:{" "}
                <code className="font-mono text-xs bg-amber-200/60 px-1 py-0.5 rounded">
                  {section === "bedtime" ? "bedtime_stories" : "toddler_stories"}
                </code>
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Run{" "}
                <code className="font-mono bg-amber-200/60 px-1 py-0.5 rounded">
                  supabase/migrations/020_dynamic_cms_stories_worksheets.sql
                </code>{" "}
                in your Supabase SQL Editor to enable dynamic story publishing.
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard/project/rgacgfnsxkiolebdnqfj/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
            >
              Open SQL Editor ↗
            </a>
          </div>
        </div>
      )}

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      {status ? <p className="text-sm font-medium text-emerald-700">{status}</p> : null}

      {section === "bedtime" ? (
        <>
          <form
            onSubmit={handleCreateBedtime}
            className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2"
          >
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
              placeholder="Story Title (e.g. Bella Bunny's Kindness Basket)"
              value={bedtimeForm.title}
              onChange={(e) => setBedtimeForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="YouTube URL or 11-char Video ID"
              value={bedtimeForm.youtube_url}
              onChange={(e) =>
                setBedtimeForm((f) => ({ ...f, youtube_url: e.target.value }))
              }
              required
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Theme (e.g. kindness, sharing, bravery)"
              value={bedtimeForm.theme}
              onChange={(e) => setBedtimeForm((f) => ({ ...f, theme: e.target.value }))}
            />
            <textarea
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
              placeholder="Moral Lesson (e.g. Sharing with friends makes every day brighter!)"
              value={bedtimeForm.moral_lesson}
              onChange={(e) =>
                setBedtimeForm((f) => ({ ...f, moral_lesson: e.target.value }))
              }
              rows={2}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 sm:col-span-2"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add Bedtime Story
            </button>
          </form>

          {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

          <ul className="space-y-2">
            {bedtimeRows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">
                    #{row.story_number} · {row.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    YouTube ID: <code className="font-mono">{row.youtube_id}</code> · {row.theme}
                    {row.moral_lesson ? ` · ${row.moral_lesson}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleBedtimeActive(row)}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold"
                  >
                    {row.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteBedtime(row.id)}
                    className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    aria-label={`Delete ${row.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <form
            onSubmit={handleCreateToddler}
            className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2"
          >
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Toddler Story Title"
              value={toddlerForm.title}
              onChange={(e) => setToddlerForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Theme (e.g. ocean, animals, adventure)"
              value={toddlerForm.theme}
              onChange={(e) => setToddlerForm((f) => ({ ...f, theme: e.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
              placeholder="Supabase Storage Video URL (https://.../story.mp4)"
              value={toddlerForm.video_url}
              onChange={(e) =>
                setToddlerForm((f) => ({ ...f, video_url: e.target.value }))
              }
              required
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
              placeholder="Thumbnail Image URL (optional)"
              value={toddlerForm.thumbnail_url}
              onChange={(e) =>
                setToddlerForm((f) => ({ ...f, thumbnail_url: e.target.value }))
              }
            />
            <textarea
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
              placeholder="Short narration / caption text (optional)"
              value={toddlerForm.narrative_text}
              onChange={(e) =>
                setToddlerForm((f) => ({ ...f, narrative_text: e.target.value }))
              }
              rows={2}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 sm:col-span-2"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add Toddler Story
            </button>
          </form>

          {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

          <ul className="space-y-2">
            {toddlerRows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{row.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {row.theme} · {row.video_url}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleToddlerActive(row)}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold"
                  >
                    {row.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteToddler(row.id)}
                    className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    aria-label={`Delete ${row.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
