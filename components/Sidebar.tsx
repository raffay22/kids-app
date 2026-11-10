"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { NAV_ROUTES } from "@/utils/navigation";
import NavLink from "@/components/NavLink";
import LogoutButton from "@/components/LogoutButton";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/60 bg-white/80 p-4 shadow-xl backdrop-blur-xl lg:flex">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 px-2 text-slate-800"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Kids Learning</p>
          <p className="text-xs text-slate-500">Speech & Play</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {NAV_ROUTES.map((route) => (
          <NavLink key={route.href} route={route} pathname={pathname} />
        ))}
      </nav>

      <div className="mt-4 border-t border-white/60 pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
