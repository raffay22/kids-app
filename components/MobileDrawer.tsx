"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ROUTES } from "@/utils/navigation";
import NavLink from "@/components/NavLink";
import LogoutButton from "@/components/LogoutButton";
import { triggerHaptic } from "@/utils/haptics";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,20rem)] flex-col border-r border-white/70 bg-white/90 p-4 shadow-2xl backdrop-blur-xl lg:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2 text-slate-800"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </div>
                <span className="text-sm font-bold">Kids Learning</span>
              </Link>

              <motion.button
                type="button"
                aria-label="Close menu"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  triggerHaptic(30);
                  onClose();
                }}
                className="glass-card flex h-10 w-10 items-center justify-center text-slate-700"
              >
                <X className="h-5 w-5" aria-hidden />
              </motion.button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {NAV_ROUTES.map((route) => (
                <NavLink
                  key={route.href}
                  route={route}
                  pathname={pathname}
                  onNavigate={onClose}
                />
              ))}
            </nav>

            <div className="mt-4 border-t border-white/60 pt-4">
              <LogoutButton onNavigate={onClose} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
