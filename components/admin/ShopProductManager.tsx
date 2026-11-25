"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type ShopRow = {
  id: string;
  slug: string | null;
  title: string;
  category: string;
  price_pkr: number;
  blurb: string | null;
  is_active: boolean;
  sort_order: number;
};

const emptyForm = {
  slug: "",
  title: "",
  category: "wooden",
  price_pkr: 1500,
  blurb: "",
  is_active: true,
  sort_order: 0,
};

export default function ShopProductManager() {
  const [products, setProducts] = useState<ShopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingTable, setMissingTable] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/shop-products");
    const data = await res.json();
    if (!res.ok) {
      if (data.error && data.error.includes("schema cache")) {
        setMissingTable(true);
      } else {
        setError(data.error ?? "Failed to load shop products");
      }
      setLoading(false);
      return;
    }
    if (data.missingTable) {
      setMissingTable(true);
    } else {
      setMissingTable(false);
    }
    setProducts(data.products ?? []);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/shop-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    setForm(emptyForm);
    await load();
  };

  const toggleActive = async (p: ShopRow) => {
    await fetch("/api/admin/shop-products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/shop-products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Physical Shop Manager</h3>
        <p className="text-sm text-slate-600">
          CRUD merch used by Parent Shop (wooden toys, workbooks, sensory kits).
        </p>
      </div>

      {missingTable && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-sm">⚠️ Supabase Table Missing: <code className="font-mono text-xs bg-amber-200/60 px-1 py-0.5 rounded">shop_products</code></p>
              <p className="text-xs text-amber-800 mt-1">
                The database table for shop products hasn't been created yet in your Supabase project.
                Run the script <code className="font-mono bg-amber-200/60 px-1 py-0.5 rounded">supabase/APPLY_ALL_ADMIN_MIGRATIONS.sql</code> in your Supabase SQL Editor to enable full shop management.
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
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Slug (optional)"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="wooden">Wooden</option>
          <option value="workbooks">Workbooks</option>
          <option value="sensory">Sensory</option>
        </select>
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
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
          placeholder="Blurb"
          value={form.blurb}
          onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white sm:col-span-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add product
        </button>
      </form>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

      <ul className="space-y-2">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3"
          >
            <div>
              <p className="font-semibold text-slate-800">{p.title}</p>
              <p className="text-xs text-slate-500">
                {p.category} · PKR {p.price_pkr} · {p.is_active ? "active" : "hidden"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void toggleActive(p)}
                className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold"
              >
                {p.is_active ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => void remove(p.id)}
                className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                aria-label={`Delete ${p.title}`}
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
