"use client";

import { motion } from "framer-motion";
import { AVATAR_GALLERY, type AvatarOption } from "@/utils/avatars";
import { triggerHaptic } from "@/utils/haptics";

type AvatarSelectorProps = {
  selectedId: string | null;
  onSelect: (avatarId: string) => void;
};

const springTransition = { type: "spring" as const, stiffness: 400, damping: 22 };

function AvatarTile({
  avatar,
  selected,
  onSelect,
}: {
  avatar: AvatarOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = avatar.icon;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={springTransition}
      onClick={() => {
        triggerHaptic(30);
        onSelect();
      }}
      aria-label={`Select ${avatar.label} avatar`}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition ${
        selected
          ? "ring-4 ring-indigo-500 ring-offset-2"
          : "hover:bg-white/60"
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${avatar.bgClass}`}
      >
        {avatar.initial ? (
          <span className={`text-xl font-bold ${avatar.iconClass}`}>{avatar.initial}</span>
        ) : (
          <Icon className={`h-7 w-7 ${avatar.iconClass}`} aria-hidden />
        )}
      </div>
      <span className="max-w-[4.5rem] truncate text-[10px] font-medium text-slate-600">
        {avatar.label}
      </span>
    </motion.button>
  );
}

export default function AvatarSelector({ selectedId, onSelect }: AvatarSelectorProps) {
  const categories = [
    { key: "animals", label: "Cute Animals" },
    { key: "flowers", label: "Flowers" },
    { key: "geometric", label: "Geometric Badges" },
    { key: "initials", label: "Initial Art" },
  ] as const;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Choose a pre-designed vector avatar. Real child photo uploads are never allowed (COPPA/GDPR).
      </p>

      {categories.map(({ key, label }) => (
        <div key={key}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
            {label}
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {AVATAR_GALLERY.filter((a) => a.category === key).map((avatar) => (
              <AvatarTile
                key={avatar.id}
                avatar={avatar}
                selected={selectedId === avatar.id}
                onSelect={() => onSelect(avatar.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
