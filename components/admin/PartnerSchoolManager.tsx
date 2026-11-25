"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  GraduationCap,
  Link2,
  MessageCircle,
  Pencil,
  Plus,
  ShieldOff,
  X,
} from "lucide-react";
import {
  SCHOOL_DISCOUNT_PRESETS,
  resolveSchoolMonthlyPrice,
  schoolInviteUrl,
  whatsappSchoolInviteUrl,
  type PartnerSchool,
  type SchoolDiscountPreset,
} from "@/lib/partnerSchools";

type FormState = {
  school_name: string;
  city: string;
  preset: SchoolDiscountPreset;
  custom_price_pkr: number;
};

const emptyForm: FormState = {
  school_name: "",
  city: "",
  preset: "free_100",
  custom_price_pkr: 90,
};

export default function PartnerSchoolManager() {
  const [schools, setSchools] = useState<PartnerSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerSchool | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/partner-schools");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load schools");
      setLoading(false);
      return;
    }
    setSchools(data.schools ?? []);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (school: PartnerSchool) => {
    setEditing(school);
    const preset =
      SCHOOL_DISCOUNT_PRESETS.find(
        (p) =>
          p.discount_type === school.discount_type &&
          (school.discount_type === "CUSTOM_PRICE"
            ? true
            : p.discount_percentage === school.discount_percentage),
      )?.id ?? (school.discount_type === "CUSTOM_PRICE" ? "custom" : "free_100");
    setForm({
      school_name: school.school_name,
      city: school.city ?? "",
      preset,
      custom_price_pkr: Number(school.custom_price_pkr) || 0,
    });
    setModalOpen(true);
  };

  const presetMeta = useMemo(
    () => SCHOOL_DISCOUNT_PRESETS.find((p) => p.id === form.preset)!,
    [form.preset],
  );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      school_name: form.school_name.trim(),
      city: form.city.trim() || null,
      discount_type: presetMeta.discount_type,
      discount_percentage:
        form.preset === "custom" ? 0 : presetMeta.discount_percentage,
      custom_price_pkr:
        form.preset === "custom"
          ? Number(form.custom_price_pkr) || 0
          : presetMeta.custom_price_pkr,
    };

    const res = await fetch("/api/admin/partner-schools", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
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

  const revoke = async (school: PartnerSchool) => {
    if (!confirm(`Revoke invite for ${school.school_name}? Old links stop working.`)) {
      return;
    }
    const res = await fetch("/api/admin/partner-schools", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: school.id, action: "revoke" }),
    });
    if (res.ok) await load();
  };

  const copyInvite = async (school: PartnerSchool) => {
    const url = schoolInviteUrl(school.school_token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(school.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Could not copy — select the URL manually.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <GraduationCap className="h-5 w-5 text-indigo-500" aria-hidden />
            Partner Schools
          </h3>
          <p className="text-sm text-slate-600">
            Tokenized invite links only — no public promo-code box.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add School
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading schools…</p>
      ) : schools.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          No partner schools yet. Create one to generate a secure parent invite URL.
        </p>
      ) : (
        <ul className="space-y-3">
          {schools.map((school) => {
            const price = resolveSchoolMonthlyPrice(school);
            const invite = schoolInviteUrl(school.school_token);
            return (
              <li
                key={school.id}
                className="rounded-2xl border-2 border-white bg-white/80 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">
                      {school.school_name}
                      {school.city ? (
                        <span className="font-medium text-slate-500"> · {school.city}</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {school.school_code} ·{" "}
                      {school.is_active ? (
                        <span className="text-emerald-600">Active</span>
                      ) : (
                        <span className="text-rose-600">Revoked</span>
                      )}{" "}
                      · {school.joined_students_count} students ·{" "}
                      {price <= 0 ? "100% Free Basic Pro" : `Rs. ${price}/month`}
                    </p>
                    <p className="mt-2 break-all font-mono text-[11px] text-indigo-700">
                      <Link2 className="mr-1 inline h-3 w-3" aria-hidden />
                      {invite}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyInvite(school)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      {copiedId === school.id ? "Copied!" : "Copy link"}
                    </button>
                    <a
                      href={whatsappSchoolInviteUrl(school.school_name, invite)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                      WhatsApp invite
                    </a>
                    <button
                      type="button"
                      onClick={() => openEdit(school)}
                      className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-800"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </button>
                    {school.is_active && (
                      <button
                        type="button"
                        onClick={() => void revoke(school)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
                      >
                        <ShieldOff className="h-3.5 w-3.5" aria-hidden />
                        Revoke token
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal
            aria-labelledby="school-modal-title"
            className="relative w-full max-w-lg rounded-3xl border-4 border-white bg-white p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h4 id="school-modal-title" className="text-lg font-bold text-slate-800">
              {editing ? "Edit Partner School" : "Add Partner School"}
            </h4>
            <form onSubmit={save} className="mt-4 space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-500">
                School name
                <input
                  required
                  value={form.school_name}
                  onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800"
                  placeholder="e.g. Beaconhouse Junior"
                />
              </label>
              <label className="block text-xs font-bold uppercase text-slate-500">
                City
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800"
                  placeholder="e.g. Lahore"
                />
              </label>
              <fieldset>
                <legend className="text-xs font-bold uppercase text-slate-500">
                  Discount selector
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {SCHOOL_DISCOUNT_PRESETS.map((p) => (
                    <label
                      key={p.id}
                      className={`cursor-pointer rounded-2xl border-2 p-3 text-sm ${
                        form.preset === p.id
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="preset"
                        className="sr-only"
                        checked={form.preset === p.id}
                        onChange={() => setForm({ ...form, preset: p.id })}
                      />
                      <span className="font-bold text-slate-800">{p.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{p.blurb}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {form.preset === "custom" && (
                <label className="block text-xs font-bold uppercase text-slate-500">
                  Custom monthly price (PKR)
                  <input
                    type="number"
                    min={0}
                    step={1}
                    required
                    value={form.custom_price_pkr}
                    onChange={(e) =>
                      setForm({ ...form, custom_price_pkr: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-semibold"
                  />
                </label>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Create & generate invite URL"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
