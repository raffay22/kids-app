import type { Metadata, Viewport } from "next";
import { Fredoka, Geist_Mono } from "next/font/google";
import AppShell from "@/components/AppShell";
import { ActiveChildProvider } from "@/components/ActiveChildProvider";
import { AuthProvider } from "@/components/AuthProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import ProgressSyncInit from "@/components/ProgressSyncInit";
import PWARegister from "@/components/PWARegister";
import TenMinuteTimerGuard from "@/components/TenMinuteTimerGuard";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kids Learning App",
    template: "%s | Kids Learning App",
  },
  description:
    "Speech therapy and gamified learning PWA for children with ASD and speech delays",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kids Learning",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body
        className={`${fredoka.variable} ${geistMono.variable} antialiased text-slate-800`}
      >
        <AuthProvider>
          <ActiveChildProvider>
            <OnboardingGuard>
              <TenMinuteTimerGuard>
                <AppShell>{children}</AppShell>
              </TenMinuteTimerGuard>
            </OnboardingGuard>
          </ActiveChildProvider>
        </AuthProvider>
        <ProgressSyncInit />
        <PWARegister />
      </body>
    </html>
  );
}
