"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { isRouteActive, type NavRoute } from "@/utils/navigation";

type NavLinkProps = {
  route: NavRoute;
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
};

const springTransition = { type: "spring" as const, stiffness: 400, damping: 22 };

export default function NavLink({
  route,
  pathname,
  onNavigate,
  compact = false,
}: NavLinkProps) {
  const active = isRouteActive(pathname, route.href);
  const Icon = route.icon;

  return (
    <Link href={route.href} onClick={onNavigate} className="block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={springTransition}
        onTapStart={() => triggerHaptic(30)}
        className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
          active
            ? "nav-pill-active"
            : "text-slate-700 hover:bg-white/70 hover:text-slate-900"
        }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-indigo-500"}`}
          aria-hidden
        />
        {!compact && (
          <span className="truncate">{route.shortLabel}</span>
        )}
      </motion.div>
    </Link>
  );
}
