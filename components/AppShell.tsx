"use client";

import { usePathname } from "next/navigation";
import AppFooter from "@/components/AppFooter";
import Header from "@/components/Header";

const STANDALONE_ROUTES = ["/login", "/signup", "/forgot-password", "/onboarding"];

const IMMERSIVE_ROUTES = [
  "/games/trolley",
  "/games/coin-shop",
  "/games/memory",
];

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (STANDALONE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  const immersive = IMMERSIVE_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main
        className={
          immersive
            ? "mx-auto w-full max-w-[90rem] flex-1 px-3 py-3 sm:px-5 lg:px-8"
            : "mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6"
        }
      >
        {children}
      </main>
      {!immersive && <AppFooter />}
    </div>
  );
}
