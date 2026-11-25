"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import ParentalGate from "@/components/ParentalGate";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getAvatarById } from "@/utils/avatars";
import { getChildLimit } from "@/utils/childLimits";
import { triggerHaptic } from "@/utils/haptics";

type ChildSwitcherProps = {
  compact?: boolean;
};

const springTransition = { type: "spring" as const, stiffness: 400, damping: 22 };

export default function ChildSwitcher({ compact = false }: ChildSwitcherProps) {
  const { profile } = useAuth();
  const { children, activeChild, setActiveChild } = useActiveChild();
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingChildId, setPendingChildId] = useState<string | null>(null);

  if (!profile || children.length === 0) return null;

  const limit = getChildLimit(profile);
  const canAddMore = children.length < limit;

  const requestSwitch = (childId: string) => {
    if (childId === activeChild?.id) return;
    setPendingChildId(childId);
    setGateOpen(true);
  };

  const confirmSwitch = () => {
    if (pendingChildId) setActiveChild(pendingChildId);
    setPendingChildId(null);
  };

  return (
    <>
      <div className={`flex items-center gap-1.5 ${compact ? "" : "flex-wrap"}`}>
        {children.map((child) => {
          const avatar = getAvatarById(child.avatar_id);
          const Icon = avatar.icon;
          const isActive = child.id === activeChild?.id;

          return (
            <motion.button
              key={child.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={springTransition}
              onClick={() => {
                triggerHaptic(30);
                requestSwitch(child.id);
              }}
              aria-label={`Switch to ${child.nickname}`}
              aria-pressed={isActive}
              title={child.nickname}
              className={`relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md transition ${avatar.bgClass} ${
                isActive ? "ring-4 ring-indigo-500 ring-offset-2" : "opacity-80 hover:opacity-100"
              }`}
            >
              {avatar.initial ? (
                <span className={`text-sm font-bold ${avatar.iconClass}`}>
                  {avatar.initial}
                </span>
              ) : (
                <Icon className={`h-5 w-5 ${avatar.iconClass}`} aria-hidden />
              )}
            </motion.button>
          );
        })}

        {canAddMore && (
          <Link
            href="/profile?add=child"
            aria-label="Add child profile"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-white/70 text-indigo-500 transition hover:bg-white"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </Link>
        )}
      </div>

      {!compact && (
        <p className="mt-1 text-xs text-slate-500">
          Active: <span className="font-semibold text-slate-700">{activeChild?.nickname}</span>
          {" · "}
          {children.length}/{limit} profiles
        </p>
      )}

      <ParentalGate
        open={gateOpen}
        onClose={() => {
          setGateOpen(false);
          setPendingChildId(null);
        }}
        onSuccess={confirmSwitch}
        title="Switch Child Profile"
      />
    </>
  );
}
