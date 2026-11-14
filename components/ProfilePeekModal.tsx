"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User } from "lucide-react";
import ParentalGate from "@/components/ParentalGate";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getAvatarById } from "@/utils/avatars";

type ProfilePeekModalProps = {
  open: boolean;
  onClose: () => void;
};

type GateTarget = "profile" | "settings" | null;

export default function ProfilePeekModal({ open, onClose }: ProfilePeekModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { activeChild } = useActiveChild();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateTarget, setGateTarget] = useState<GateTarget>(null);
  const avatar = getAvatarById(activeChild?.avatar_id);
  const AvatarIcon = avatar.icon;

  const requestGate = (target: Exclude<GateTarget, null>) => {
    setGateTarget(target);
    setGateOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
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
              <div className="rounded-3xl border-4 border-white bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md ${avatar.bgClass}`}
                  >
                    {avatar.initial ? (
                      <span className={`text-xl font-bold ${avatar.iconClass}`}>
                        {avatar.initial}
                      </span>
                    ) : (
                      <AvatarIcon className={`h-7 w-7 ${avatar.iconClass}`} aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">
                      Profile
                    </p>
                    <p className="truncate text-xl font-extrabold text-slate-800">
                      {activeChild?.nickname ?? profile?.child_nickname ?? "Friend"}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3 text-sm">
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
                </dl>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => requestGate("profile")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg"
                  >
                    <User className="h-4 w-4" aria-hidden />
                    Edit profile
                  </button>
                  <button
                    type="button"
                    onClick={() => requestGate("settings")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 py-3 text-sm font-extrabold text-violet-800 shadow-md"
                  >
                    <Settings className="h-4 w-4" aria-hidden />
                    Sensory &amp; Settings
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
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
        }}
        onSuccess={() => {
          const target = gateTarget;
          setGateOpen(false);
          setGateTarget(null);
          onClose();
          if (target === "settings") {
            router.push("/settings");
            return;
          }
          router.push("/profile");
        }}
        title={
          gateTarget === "settings"
            ? "Parent Check — Settings"
            : "Parent Check — Profile"
        }
      />
    </>
  );
}
