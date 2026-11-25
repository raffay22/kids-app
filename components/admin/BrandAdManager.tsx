"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import {
  BRAND_AD_PLACEMENTS,
  brandProofUrl,
  ctrPercent,
  placementLabel,
  type BrandAd,
} from "@/utils/brandAds";

type FormState = {
  brand_name: string;
  headline: string;
  placement: string;
  banner_position: "TOP_HEADER" | "INLINE" | "FOOTER_INLINE";
  click_url: string;
  whatsapp_phone: string;
  whatsapp_message: string;
  monthly_rent_pkr: string;
  brand_contact_email: string;
  sort_order: string;
  is_active: boolean;
  media_type: "image" | "video";
  media_url: string;
  media_path: string;
};

const emptyForm = (): FormState => ({
  brand_name: "",
  headline: "",
  placement: BRAND_AD_PLACEMENTS[0].id,
  banner_position: "INLINE",
  click_url: "",
  whatsapp_phone: "",
  whatsapp_message: "Hi! I saw your ad on Kids Learning App.",
  monthly_rent_pkr: "0",
  brand_contact_email: "",
  sort_order: "0",
  is_active: true,
  media_type: "image",
  media_url: "",
  media_path: "",
});

export default function BrandAdManager() {
  const [ads, setAds] = useState<BrandAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterPlacement, setFilterPlacement] = useState<string>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/brand-ads");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load brand ads");
      setLoading(false);
      return;
    }
    setAds(data.ads ?? []);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filterPlacement === "all") return ads;
    return ads.filter((a) => a.placement === filterPlacement);
  }, [ads, filterPlacement]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (ad: BrandAd) => {
    setEditingId(ad.id);
    setForm({
      brand_name: ad.brand_name,
      headline: ad.headline ?? "",
      placement: ad.placement,
      banner_position: ad.banner_position,
      click_url: ad.click_url ?? "",
      whatsapp_phone: ad.whatsapp_phone ?? "",
      whatsapp_message: ad.whatsapp_message ?? "",
      monthly_rent_pkr: String(ad.monthly_rent_pkr ?? 0),
      brand_contact_email: ad.brand_contact_email ?? "",
      sort_order: String(ad.sort_order ?? 0),
      is_active: ad.is_active,
      media_type: ad.media_type,
      media_url: ad.media_url,
      media_path: ad.media_path ?? "",
    });
    setModalOpen(true);
  };

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("placement", form.placement);
      const res = await fetch("/api/admin/brand-ads/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((f) => ({
        ...f,
        media_type: data.media_type,
        media_url: data.media_url,
        media_path: data.media_path,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.media_url) {
      setError("Upload an image or video first");
      return;
    }
    setBusy(true);
    setError(null);

    const payload = {
      brand_name: form.brand_name,
      headline: form.headline,
      placement: form.placement,
      banner_position: form.banner_position,
      click_url: form.click_url,
      whatsapp_phone: form.whatsapp_phone,
      whatsapp_message: form.whatsapp_message,
      monthly_rent_pkr: Number(form.monthly_rent_pkr) || 0,
      brand_contact_email: form.brand_contact_email,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      media_type: form.media_type,
      media_url: form.media_url,
      media_path: form.media_path,
      target_page_route:
        BRAND_AD_PLACEMENTS.find((p) => p.id === form.placement)?.route ?? null,
    };

    const res = await fetch("/api/admin/brand-ads", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setModalOpen(false);
    await load();
  };

  const toggleActive = async (ad: BrandAd) => {
    await fetch("/api/admin/brand-ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ad.id, is_active: !ad.is_active }),
    });
    await load();
  };

  const remove = async (ad: BrandAd) => {
    if (!confirm(`Delete ad for ${ad.brand_name}?`)) return;
    await fetch(`/api/admin/brand-ads?id=${encodeURIComponent(ad.id)}`, { method: "DELETE" });
    await load();
  };

  const copyProof = async (ad: BrandAd) => {
    const url = brandProofUrl(ad.proof_token);
    await navigator.clipboard.writeText(url || `/brand-stats/${ad.proof_token}`);
    setCopied(ad.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading brand ads…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
            <Megaphone className="h-5 w-5 text-amber-500" aria-hidden />
            Brand Ads — Multi-Placement
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Upload a different image or video for each slot. Many brands can run at once —
            one creative per placement (or rotate daily when several share a slot).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-extrabold text-white shadow"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New banner
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterPlacement("all")}
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            filterPlacement === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          All slots
        </button>
        {BRAND_AD_PLACEMENTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilterPlacement(p.id)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              filterPlacement === p.id ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Brand</th>
              <th className="px-3 py-2">Placement</th>
              <th className="px-3 py-2">Media</th>
              <th className="px-3 py-2">Views</th>
              <th className="px-3 py-2">Clicks</th>
              <th className="px-3 py-2">CTR</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  No banners yet — create one and upload an image or video.
                </td>
              </tr>
            ) : (
              filtered.map((ad) => (
                <tr key={ad.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-semibold text-slate-800">
                    {ad.brand_name}
                    {ad.headline ? (
                      <span className="mt-0.5 block text-xs font-normal text-slate-500">
                        {ad.headline}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs font-medium text-slate-600">
                    {placementLabel(ad.placement)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold capitalize">
                      {ad.media_type === "video" ? (
                        <Video className="h-3 w-3" aria-hidden />
                      ) : (
                        <ImagePlus className="h-3 w-3" aria-hidden />
                      )}
                      {ad.media_type}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{ad.total_impressions}</td>
                  <td className="px-3 py-2 tabular-nums">{ad.total_clicks}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {ctrPercent(ad.total_impressions, ad.total_clicks)}%
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        ad.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {ad.is_active ? "Live" : "Off"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => openEdit(ad)}
                        className="rounded-lg bg-slate-100 p-1.5 text-slate-700 hover:bg-slate-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title={ad.is_active ? "Pause" : "Activate"}
                        onClick={() => void toggleActive(ad)}
                        className="rounded-lg bg-slate-100 p-1.5 text-slate-700 hover:bg-slate-200"
                      >
                        {ad.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        title="Copy brand proof link"
                        onClick={() => void copyProof(ad)}
                        className="rounded-lg bg-amber-100 p-1.5 text-amber-800 hover:bg-amber-200"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => void remove(ad)}
                        className="rounded-lg bg-rose-100 p-1.5 text-rose-700 hover:bg-rose-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {copied === ad.id ? (
                      <span className="mt-1 block text-[10px] font-bold text-emerald-600">
                        Proof link copied
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <form
            onSubmit={save}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <h4 className="text-lg font-extrabold text-slate-800">
              {editingId ? "Edit banner" : "New brand banner"}
            </h4>

            <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
              Brand name
              <input
                required
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </label>

            <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
              Headline (optional)
              <input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
              Placement slot
              <select
                value={form.placement}
                onChange={(e) => {
                  const meta = BRAND_AD_PLACEMENTS.find((p) => p.id === e.target.value);
                  setForm({
                    ...form,
                    placement: e.target.value,
                    banner_position: (meta?.position as FormState["banner_position"]) ?? "INLINE",
                  });
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
              >
                {BRAND_AD_PLACEMENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({p.id})
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3">
              <p className="text-xs font-bold uppercase text-amber-800">Creative — image or video</p>
              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                <Upload className="h-4 w-4" aria-hidden />
                {uploading ? "Uploading…" : "Upload JPG / PNG / WebP / MP4 / WebM"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
                />
              </label>
              {form.media_url ? (
                <div className="mt-3 overflow-hidden rounded-xl bg-slate-100">
                  {form.media_type === "video" ? (
                    <video src={form.media_url} controls className="max-h-40 w-full object-contain" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.media_url} alt="Preview" className="max-h-40 w-full object-contain" />
                  )}
                  <p className="px-2 py-1 text-[10px] text-slate-500">
                    {form.media_type.toUpperCase()} ready
                  </p>
                </div>
              ) : null}
            </div>

            <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
              External link (optional if WhatsApp set)
              <input
                value={form.click_url}
                onChange={(e) => setForm({ ...form, click_url: e.target.value })}
                placeholder="https://brand.com/offer"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold uppercase text-slate-500">
                WhatsApp phone
                <input
                  value={form.whatsapp_phone}
                  onChange={(e) => setForm({ ...form, whatsapp_phone: e.target.value })}
                  placeholder="923001234567"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-bold uppercase text-slate-500">
                Monthly rent (PKR)
                <input
                  type="number"
                  min={0}
                  value={form.monthly_rent_pkr}
                  onChange={(e) => setForm({ ...form, monthly_rent_pkr: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
              WhatsApp prefill message
              <input
                value={form.whatsapp_message}
                onChange={(e) => setForm({ ...form, whatsapp_message: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
              Brand contact email
              <input
                type="email"
                value={form.brand_contact_email}
                onChange={(e) => setForm({ ...form, brand_contact_email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Live on app now
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || uploading || !form.media_url}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save banner"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
