"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Lock, Settings, ShieldCheck, User } from "lucide-react";
import ChildSwitcher from "@/components/ChildSwitcher";
import LogoutButton from "@/components/LogoutButton";
import ParentalGate from "@/components/ParentalGate";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getAvatarById } from "@/utils/avatars";
import { triggerHaptic } from "@/utils/haptics";
import {
  enablePracticeReminders,
  getReminderPermission,
  type ReminderPermission,
} from "@/utils/notifications";
import {
  getMembershipTier,
  OPEN_ACCESS_TEST_MODE,
  TIER_PRICING,
  type MembershipTier,
} from "@/lib/membership";

type ProfilePeekModalProps = {
  open: boolean;
  onClose: () => void;
  /** When true, ParentalGate must pass before the full profile panel shows. */
  requireGate?: boolean;
};

type GateTarget = "reveal" | "profile" | "settings" | null;

function tierBadge(tier: MembershipTier): { label: string; className: string } {
  if (tier === "full_member") {
    return {
      label: TIER_PRICING.full_member.label,
      className: "bg-violet-100 text-violet-800",
    };
  }
  if (tier === "basic_pro") {
    return {
      label: TIER_PRICING.basic_pro.label,
      className: "bg-sky-100 text-sky-800",
    };
  }
  return {
    label: TIER_PRICING.free.label,
    className: "bg-slate-100 text-slate-700",
  };
}

/**
 * Prompt E — Profile modal with ChildSwitcher, plan badge, and logout.
 */
export default function ProfilePeekModal({
  open,
  onClose,
  requireGate = false,
}: ProfilePeekModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { activeChild } = useActiveChild();
  const revealedRef = useRef(!requireGate);
  const [revealed, setRevealed] = useState(!requireGate);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateTarget, setGateTarget] = useState<GateTarget>(null);
  const [reminderPerm, setReminderPerm] = useState<ReminderPermission>("default");

  useEffect(() => {
    setReminderPerm(getReminderPermission());
  }, []);
  const avatar = getAvatarById(activeChild?.avatar_id);
  const AvatarIcon = avatar.icon;
  const badge = tierBadge(getMembershipTier(profile));

  const showPanel = open && (!requireGate || revealed);

  const handleClose = () => {
    onClose();
    if (requireGate) {
      revealedRef.current = false;
      setRevealed(false);
    }
  };

  const requestGate = (target: Exclude<GateTarget, null>) => {
    setGateTarget(target);
    setGateOpen(true);
  };

  useEffect(() => {
    if (open && requireGate && !revealedRef.current && !gateOpen) {
      requestGate("reveal");
    }
    if (!open) {
      setGateOpen(false);
      setGateTarget(null);
      if (requireGate) {
        revealedRef.current = false;
        setRevealed(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/reveal only
  }, [open, requireGate, gateOpen]);

  return (
    <>
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.button
              type="button"
              aria-label="Close profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Child profile"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="fixed inset-x-4 top-1/2 z-[61] mx-auto max-w-sm -translate-y-1/2"
            >
              <div className="max-h-[85vh] overflow-y-auto rounded-3xl border-4 border-white bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md ${avatar.bgClass}`}
                  >
                    {avatar.initial ? (
                      <span className={`text-xl font-bold ${avatar.iconClass}`}>
                        {avatar.initial}
                      </span>
                    ) : (
                      <AvatarIcon
                        className={`h-7 w-7 ${avatar.iconClass}`}
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">
                      Profile
                    </p>
                    <p className="truncate text-xl font-extrabold text-slate-800">
                      {activeChild?.nickname ??
                        profile?.child_nickname ??
                        "Friend"}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${badge.className}`}
                    >
                      {badge.label}
                      {OPEN_ACCESS_TEST_MODE ? " · test" : ""}
                    </span>
                    {profile?.is_admin && (
                      <span className="mt-1 ml-1.5 inline-flex rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-sm">
                        👑 Admin
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Switch child
                  </p>
                  <ChildSwitcher compact />
                </div>

                <dl className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="font-semibold text-slate-500">Nickname</dt>
                    <dd className="font-bold text-slate-800">
                      {activeChild?.nickname ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="font-semibold text-slate-500">Stars</dt>
                    <dd className="font-bold text-amber-700">
                      ⭐ {activeChild?.stars ?? 0}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="font-semibold text-slate-500">Parent email</dt>
                    <dd className="max-w-[58%] truncate text-right font-bold text-slate-800">
                      {profile?.parent_email ?? user?.email ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="font-semibold text-slate-500">Plan</dt>
                    <dd className="font-bold text-slate-800">{badge.label}</dd>
                  </div>
                  {profile?.is_admin && (
                    <div className="flex justify-between gap-2 border-t border-rose-100 pt-1.5">
                      <dt className="font-bold text-rose-700">Account Access</dt>
                      <dd className="font-black text-rose-700">System Admin</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        const next = await enablePracticeReminders();
                        setReminderPerm(next);
                        triggerHaptic(20);
                      })();
                    }}
                    className={`inline-flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-sm font-extrabold shadow-sm transition ${
                      reminderPerm === "granted"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4" aria-hidden />
                      Daily Practice Reminders
                    </span>
                    {reminderPerm === "granted" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <Check className="h-4 w-4" /> Enabled
                      </span>
                    ) : (
                      <span className="text-xs text-sky-600 underline">Turn On</span>
                    )}
                  </button>
                  {profile?.is_admin && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        router.push("/admin");
                      }}
                      className="inline-flex items-center justify-between rounded-2xl border-2 border-rose-300 bg-rose-50 px-4 py-3 text-sm font-black text-rose-800 shadow-md transition hover:bg-rose-100"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-rose-600" aria-hidden />
                        Admin Dashboard Portal
                      </span>
                      <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        Open
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => requestGate("settings")}
                    className="inline-flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-indigo-600" aria-hidden />
                      Parental Gate &amp; Settings
                    </span>
                    <span className="text-xs text-slate-500">Protected</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => requestGate("profile")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg"
                  >
                    <User className="h-4 w-4" aria-hidden />
                    Edit nickname &amp; avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => requestGate("settings")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 py-3 text-sm font-extrabold text-violet-800 shadow-md"
                  >
                    <Settings className="h-4 w-4" aria-hidden />
                    Sensory &amp; Controls
                  </button>
                  <LogoutButton
                    className="justify-center border-2 border-rose-100 bg-rose-50 font-extrabold"
                    onNavigate={handleClose}
                  />
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ParentalGate
        open={gateOpen}
        onClose={() => {
          setGateOpen(false);
          setGateTarget(null);
          if (requireGate && !revealedRef.current) handleClose();
        }}
        onSuccess={() => {
          const target = gateTarget;
          setGateOpen(false);
          setGateTarget(null);
          if (target === "reveal") {
            revealedRef.current = true;
            setRevealed(true);
            return;
          }
          handleClose();
          if (target === "settings") {
            router.push("/settings");
            return;
          }
          router.push("/profile");
        }}
        title={
          gateTarget === "settings"
            ? "Parent Check — Settings"
            : gateTarget === "reveal"
              ? "Parent Check — Profile"
              : "Parent Check — Edit Profile"
        }
      />
    </>
  );
}
