"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

const STANDALONE_ROUTES = ["/login", "/signup", "/forgot-password", "/onboarding"];

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (STANDALONE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main
        className={
          pathname.startsWith("/games/trolley")
            ? "mx-auto w-full max-w-[90rem] px-3 py-3 sm:px-5 lg:px-8"
            : "mx-auto max-w-5xl p-4 sm:p-6"
        }
      >
        {children}
      </main>
    </div>
  );
}
