"use client";

import { usePathname } from "next/navigation";
import AppFooter from "@/components/AppFooter";
import BannerAd from "@/components/BannerAd";
import Header from "@/components/Header";
import TrophyCelebrationListener from "@/components/TrophyCelebrationListener";
import {
  bottomPlacementForPath,
  placementForPath,
  showFooterBrandStrip,
} from "@/utils/brandAds";

const STANDALONE_ROUTES = ["/login", "/signup", "/forgot-password", "/onboarding", "/splash-preview"];

const IMMERSIVE_ROUTES = [
  "/games/trolley",
  "/games/coin-shop",
  "/games/memory",
];

/** Hide chrome ads on brand proof + deep ASD activities / gameplay. */
const NO_BANNER_PREFIXES = [
  "/brand-stats",
  "/admin",
  "/asd/breathe",
  "/asd/trace",
  "/asd/ripple",
  "/asd/emergency",
  "/asd/feelings",
  "/asd/daily-needs",
  "/asd/i-want",
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
  const suppressBanner = NO_BANNER_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Colouring board — keep canvas clear of ad chrome
  const coloringPage = pathname === "/coloring" || pathname.startsWith("/coloring/");
  const hideAds = suppressBanner || coloringPage;
  const topPlacement = hideAds ? null : placementForPath(pathname);
  const bottomPlacement = hideAds ? null : bottomPlacementForPath(pathname);
  const footerPlacement =
    !hideAds && showFooterBrandStrip(pathname) ? ("FOOTER_INLINE" as const) : null;

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-slate-50">
      <Header />
      <main
        className={
          immersive
            ? "mx-auto w-full max-w-[90rem] flex-1 px-3 py-3 sm:px-5 lg:px-8"
            : "mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6"
        }
      >
        {topPlacement ? <BannerAd placement={topPlacement} /> : null}
        {children}
        {bottomPlacement ? <BannerAd placement={bottomPlacement} /> : null}
        {footerPlacement ? <BannerAd placement={footerPlacement} className="mt-6" /> : null}
      </main>
      {!immersive && <AppFooter />}
      <TrophyCelebrationListener />
    </div>
  );
}
