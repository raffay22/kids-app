"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, User } from "lucide-react";
import AvatarSelector from "@/components/AvatarSelector";
import ChildSwitcher from "@/components/ChildSwitcher";
import LogoutButton from "@/components/LogoutButton";
import TrophyShowcase from "@/components/TrophyShowcase";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getAvatarById } from "@/utils/avatars";
import { getChildLimit, getTierLabel } from "@/utils/childLimits";
import { createClient } from "@/utils/supabase/client";
import type { AgeGroup, ChildProfile } from "@/types/database";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { children, activeChild, refreshChildren, setActiveChild } = useActiveChild();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const [editingChild, setEditingChild] = useState<ChildProfile | "new" | null>(null);
  const [nickname, setNickname] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("1-3");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("add") === "child") {
      setEditingChild("new");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!editingChild || editingChild === "new") {
      if (editingChild === "new") {
        setNickname("");
        setAgeGroup("1-3");
        setAvatarId("cat-indigo");
      }
      return;
    }
    setNickname(editingChild.nickname);
    setAgeGroup(editingChild.age_group ?? "1-3");
    setAvatarId(editingChild.avatar_id);
  }, [editingChild]);

  useEffect(() => {
    if (activeChild && !editingChild) {
      setEditingChild(activeChild);
    }
  }, [activeChild, editingChild]);

  if (loading) {
    return (
      <section className="glass-card p-6 text-slate-800">
        <p className="text-sm text-slate-600">Loading profile…</p>
      </section>
    );
  }

  if (!user || !profile) {
    return (
      <section className="glass-card p-6 text-slate-800">
        <h2 className="text-xl font-bold">Profile</h2>
        <p className="mt-2 text-sm text-slate-600">Please sign in to manage child profiles.</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Sign In
        </Link>
      </section>
    );
  }

  const limit = getChildLimit(profile);
  const canAddChild = children.length < limit;
  const displayChild =
    editingChild && editingChild !== "new" ? editingChild : activeChild;
  const selectedAvatar = getAvatarById(avatarId ?? displayChild?.avatar_id);
  const AvatarIcon = selectedAvatar.icon;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    if (editingChild === "new") {
      const { data, error: insertError } = await supabase
        .from("children")
        .insert({
          parent_user_id: user.id,
          nickname: nickname.trim(),
          age_group: ageGroup,
          avatar_id: avatarId,
          onboarding_completed: true,
        })
        .select("*")
        .single();

      setSaving(false);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      if (data) setActiveChild(data.id);
      setMessage("Child profile created!");
      setEditingChild(null);
    } else if (editingChild) {
      const { error: updateError } = await supabase
        .from("children")
        .update({
          nickname: nickname.trim(),
          age_group: ageGroup,
          avatar_id: avatarId,
        })
        .eq("id", editingChild.id);

      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setMessage("Profile saved!");
    }

    await refreshChildren();
    await refreshProfile();
  };

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Family Profiles</h2>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="text-xs text-indigo-600">
              {getTierLabel(profile)} · {children.length}/{limit} children
            </p>
          </div>
          <LogoutButton className="w-auto px-4" />
        </div>

        <div className="mt-4">
          <ChildSwitcher />
        </div>

        {!canAddChild && (
          <p className="mt-3 text-xs text-amber-700">
            Profile limit reached.{" "}
            <Link href="/upgrade" className="font-semibold underline">
              Upgrade to Pro or Family Pack
            </Link>{" "}
            to add more learners.
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {children.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => setEditingChild(child)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              editingChild !== "new" && editingChild?.id === child.id
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                : "glass-card text-slate-700"
            }`}
          >
            {child.nickname}
          </button>
        ))}
        {canAddChild && (
          <button
            type="button"
            onClick={() => setEditingChild("new")}
            className="flex items-center gap-1 rounded-2xl border-2 border-dashed border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-600"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add Child
          </button>
        )}
      </div>

      {(editingChild === "new" || editingChild) && (
        <form onSubmit={handleSave} className="glass-card space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br shadow-xl ${selectedAvatar.bgClass}`}
            >
              {selectedAvatar.initial ? (
                <span className={`text-xl font-bold ${selectedAvatar.iconClass}`}>
                  {selectedAvatar.initial}
                </span>
              ) : (
                <AvatarIcon className={`h-7 w-7 ${selectedAvatar.iconClass}`} aria-hidden />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingChild === "new" ? "New Child Profile" : "Edit Profile"}
              </h3>
              <p className="text-sm text-slate-600">
                Vector avatars only — no photo uploads (COPPA/GDPR).
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="nickname" className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <User className="h-4 w-4 text-indigo-500" aria-hidden />
              Child Nickname
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              maxLength={24}
              className="w-full rounded-2xl border-2 border-white/80 bg-white/70 px-4 py-3 text-slate-800 outline-none focus:border-indigo-300"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Target Age Group</p>
            <div className="flex gap-3">
              {(["1-3", "3-6"] as AgeGroup[]).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setAgeGroup(group)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    ageGroup === group
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                      : "bg-white/70 text-slate-700 hover:bg-white"
                  }`}
                >
                  Ages {group}
                </button>
              ))}
            </div>
          </div>

          <AvatarSelector selectedId={avatarId} onSelect={setAvatarId} />

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-70"
          >
            {saving ? "Saving…" : editingChild === "new" ? "Create Profile" : "Save Profile"}
          </button>
        </form>
      )}

      {displayChild && (
        <section className="glass-card p-6">
          <TrophyShowcase
            unlockedTrophies={displayChild.unlocked_trophies ?? []}
            unlockedBadges={displayChild.unlocked_badges ?? []}
          />
        </section>
      )}
    </div>
  );
}
