import type { Metadata, Viewport } from "next";
import { Fredoka, Geist_Mono } from "next/font/google";
import AppShell from "@/components/AppShell";
import { ActiveChildProvider } from "@/components/ActiveChildProvider";
import { AuthProvider } from "@/components/AuthProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import PageTracker from "@/components/PageTracker";
import PresenceHeartbeat from "@/components/PresenceHeartbeat";
import ProgressSyncInit from "@/components/ProgressSyncInit";
import PracticeReminderWatcher from "@/components/PracticeReminderWatcher";
import PWARegister from "@/components/PWARegister";
import SensoryBootstrap from "@/components/SensoryBootstrap";
import StopSpeechOnNavigate from "@/components/StopSpeechOnNavigate";
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
      { url: "/icons/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: [{ url: "/icons/favicon-64.png", type: "image/png" }],
    apple: [{ url: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://growvajunior.com/#organization",
      "name": "Growva Junior",
      "url": "https://growvajunior.com",
      "logo": "https://growvajunior.com/brand/growvajuniorstudio-logo-transparent.png",
      "sameAs": [
        "https://growvabusiness.com",
      ],
      "parentOrganization": {
        "@type": "Organization",
        "@id": "https://growvabusiness.com/#organization",
        "name": "Growva Business",
        "url": "https://growvabusiness.com",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://growvajunior.com/#website",
      "url": "https://growvajunior.com",
      "name": "Growva Junior | Early Learning & Stories (Ages 1–9)",
      "publisher": {
        "@id": "https://growvajunior.com/#organization",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${fredoka.variable} ${geistMono.variable} antialiased text-slate-800`}
      >
        <AuthProvider>
          <ActiveChildProvider>
            <OnboardingGuard>
              <TenMinuteTimerGuard>
                <SensoryBootstrap />
                <StopSpeechOnNavigate />
                <PresenceHeartbeat />
                <PageTracker />
                <PracticeReminderWatcher />
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
