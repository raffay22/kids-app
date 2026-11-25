"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Plus, Trash2, Upload } from "lucide-react";

const MAX_PDF_BYTES = 15 * 1024 * 1024;

type Row = {
  id: string;
  title: string;
  age_group: string;
  category: string;
  description: string | null;
  file_name: string;
  storage_path: string;
  total_pages: number;
  price_pkr: number;
  drip_unlock_at: string | null;
  is_active: boolean;
};

const emptyForm = {
  title: "",
  age_group: "2-4",
  category: "math",
  description: "",
  file_name: "",
  storage_path: "",
  pdf_url: "",
  file_size: "",
  total_pages: 50,
  price_pkr: 150,
  drip_unlock_at: "",
  is_active: true,
};

export default function WorksheetPdfManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missingTable, setMissingTable] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/printable-worksheets");
    const data = await res.json();
    if (!res.ok) {
      if (data.error && data.error.includes("schema cache")) {
        setMissingTable(true);
      } else {
        setError(data.error ?? "Failed to load worksheets");
      }
      setLoading(false);
      return;
    }
    if (data.missingTable) {
      setMissingTable(true);
    } else {
      setMissingTable(false);
    }
    setRows(data.worksheets ?? []);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadSuccess(null);

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Only .pdf files are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError("PDF file must be under 15 MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("age_group", form.age_group);
      fd.append("category", form.category);

      const res = await fetch("/api/admin/printable-worksheets/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "PDF upload failed");
        return;
      }
      setForm((f) => ({
        ...f,
        file_name: data.file_name,
        storage_path: data.storage_path,
        pdf_url: data.public_url,
        file_size: data.file_size,
      }));
      setUploadSuccess(`Uploaded ${data.file_name} (${data.file_size})`);
    } catch {
      setError("Network error while uploading PDF.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const storage_path =
      form.storage_path ||
      `age-${form.age_group}/${form.category}/${form.file_name}`;
    const res = await fetch("/api/admin/printable-worksheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        storage_path,
        pdf_url: form.pdf_url || undefined,
        file_size: form.file_size || undefined,
        drip_unlock_at: form.drip_unlock_at || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    setForm(emptyForm);
    setUploadSuccess(null);
    await load();
  };

  const toggleActive = async (row: Row) => {
    await fetch("/api/admin/printable-worksheets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, is_active: !row.is_active }),
    });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/printable-worksheets?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Worksheet PDF Manager</h3>
        <p className="text-sm text-slate-600">
          Bundle metadata + storage path / drip unlock for the worksheets bucket.
        </p>
      </div>

      {missingTable && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-sm">⚠️ Supabase Table Missing: <code className="font-mono text-xs bg-amber-200/60 px-1 py-0.5 rounded">printable_worksheets</code></p>
              <p className="text-xs text-amber-800 mt-1">
                The database table for printable worksheets hasn&apos;t been created yet in your Supabase project.
                Run the script <code className="font-mono bg-amber-200/60 px-1 py-0.5 rounded">supabase/APPLY_ALL_ADMIN_MIGRATIONS.sql</code> in your Supabase SQL Editor to enable worksheet management.
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

      <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={form.age_group}
          onChange={(e) => setForm((f) => ({ ...f, age_group: e.target.value }))}
        >
          <option value="2-4">Ages 2–4</option>
          <option value="4-6">Ages 4–6</option>
          <option value="6-9">Ages 6–9</option>
        </select>
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="math">Math</option>
          <option value="english">English</option>
          <option value="colouring">Colouring</option>
        </select>
        <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 p-3 sm:col-span-2">
          <p className="text-xs font-bold uppercase text-indigo-800">
            Upload PDF Worksheet (strictly .pdf · max 15 MB)
          </p>
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            <Upload className="h-4 w-4 text-indigo-600" aria-hidden />
            {uploading ? "Uploading PDF to Supabase…" : "Choose .pdf file to upload"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => void handlePdfUpload(e)}
              disabled={uploading}
              className="sr-only"
            />
          </label>
          {uploadSuccess ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {uploadSuccess}
            </p>
          ) : null}
        </div>
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="file_name.pdf"
          value={form.file_name}
          onChange={(e) => setForm((f) => ({ ...f, file_name: e.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="storage_path (auto if empty)"
          value={form.storage_path}
          onChange={(e) => setForm((f) => ({ ...f, storage_path: e.target.value }))}
        />
        <input
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Pages"
          value={form.total_pages}
          onChange={(e) =>
            setForm((f) => ({ ...f, total_pages: Number(e.target.value) || 50 }))
          }
        />
        <input
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Price PKR"
          value={form.price_pkr}
          onChange={(e) =>
            setForm((f) => ({ ...f, price_pkr: Number(e.target.value) || 0 }))
          }
        />
        <input
          type="datetime-local"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
          value={form.drip_unlock_at}
          onChange={(e) =>
            setForm((f) => ({ ...f, drip_unlock_at: e.target.value }))
          }
        />
        <textarea
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white sm:col-span-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add worksheet bundle
        </button>
      </form>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3"
          >
            <div>
              <p className="font-semibold text-slate-800">{row.title}</p>
              <p className="text-xs text-slate-500">
                {row.age_group} · {row.category} · {row.storage_path}
                {row.drip_unlock_at ? ` · drip ${row.drip_unlock_at}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void toggleActive(row)}
                className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold"
              >
                {row.is_active ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => void remove(row.id)}
                className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                aria-label={`Delete ${row.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
