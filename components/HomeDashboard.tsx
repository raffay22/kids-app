"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Coins,
  FileText,
  Gamepad2,
  Grid,
  MessageCircleCode,
  Moon,
  Paintbrush,
  ShoppingBag,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react";

import { useSensoryPrefs } from "@/hooks/useSensoryPrefs";
import {
  ASD_PECS_HUB_CARD,
  ASD_SENSORY_ACTIVITIES,
} from "@/utils/asdSensory";
import { triggerHaptic } from "@/utils/haptics";
import PWAInstallBanner from "@/components/PWAInstallBanner";

type FeatureCard = {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  accentClass: string;
  iconWrapClass: string;
  ringClass: string;
};

const FEATURES: FeatureCard[] = [
  {
    id: "phonics",
    name: "Phonics & Tracing",
    href: "/phonics",
    icon: Volume2,
    accentClass: "from-purple-50/80 to-violet-100/60",
    iconWrapClass: "bg-purple-500 text-white shadow-purple-300/50",
    ringClass: "ring-purple-300/70",
  },
  {
    id: "flashcards",
    name: "Nouns & Verbs Flashcards",
    href: "/flashcards",
    icon: Sparkles,
    accentClass: "from-sky-50/80 to-blue-100/60",
    iconWrapClass: "bg-sky-500 text-white shadow-sky-300/50",
    ringClass: "ring-sky-300/70",
  },
  {
    id: "sentences",
    name: "Daily Sentences",
    href: "/sentences",
    icon: MessageCircleCode,
    accentClass: "from-amber-50/80 to-yellow-100/60",
    iconWrapClass: "bg-amber-400 text-white shadow-amber-300/50",
    ringClass: "ring-amber-300/70",
  },
  {
    id: "stories",
    name: "Stories Under 3 Years",
    href: "/games/stories/toddlers",
    icon: BookOpen,
    accentClass: "from-rose-50/80 to-pink-100/60",
    iconWrapClass: "bg-rose-400 text-white shadow-rose-300/50",
    ringClass: "ring-rose-300/70",
  },
  {
    id: "bedtime",
    name: "Bedtime Stories",
    href: "/games/stories/bedtime",
    icon: Moon,
    accentClass: "from-indigo-50/80 to-sky-100/60",
    iconWrapClass: "bg-indigo-500 text-white shadow-indigo-300/50",
    ringClass: "ring-indigo-300/70",
  },
  {
    id: "games",
    name: "Brain Logic Games",
    href: "/games",
    icon: Brain,
    accentClass: "from-lime-50/90 to-cyan-100/70",
    iconWrapClass: "bg-teal-500 text-white shadow-teal-300/50",
    ringClass: "ring-teal-300/70",
  },
  {
    id: "coloring",
    name: "Colouring Board",
    href: "/coloring",
    icon: Paintbrush,
    accentClass: "from-rose-50/80 to-pink-100/60",
    iconWrapClass: "bg-rose-500 text-white shadow-rose-300/50",
    ringClass: "ring-rose-300/70",
  },
  {
    id: "coin-shop",
    name: "Coin Toy Shop",
    href: "/games/coin-shop",
    icon: Coins,
    accentClass: "from-amber-50/80 to-yellow-100/60",
    iconWrapClass: "bg-amber-400 text-amber-950 shadow-amber-300/50",
    ringClass: "ring-amber-300/70",
  },

  {
    id: "parent-shop",
    name: "Parent Shop",
    href: "/shop",
    icon: ShoppingBag,
    accentClass: "from-fuchsia-50/80 to-pink-100/60",
    iconWrapClass: "bg-fuchsia-500 text-white shadow-fuchsia-300/50",
    ringClass: "ring-fuchsia-300/70",
  },
  {
    id: "worksheets",
    name: "Activity Sheets",
    href: "/worksheets",
    icon: FileText,
    accentClass: "from-amber-50/80 to-orange-100/60",
    iconWrapClass: "bg-amber-500 text-white shadow-amber-300/50",
    ringClass: "ring-amber-300/70",
  },
  {
    id: "pecs",
    name: "Emergency PECS",
    href: "/asd",
    icon: Grid,
    accentClass: "from-orange-50/80 to-rose-100/60",
    iconWrapClass: "bg-[#FF7F7F] text-white shadow-orange-300/50",
    ringClass: "ring-orange-300/70",
  },
];

// Temporarily hidden from the dashboard UI until pending work is complete
const TEMPORARILY_HIDDEN_CARD_IDS = new Set(["parent-shop", "worksheets", "coin-shop"]);

const springTransition = { type: "spring" as const, stiffness: 420, damping: 24 };

export default function HomeDashboard() {
  const router = useRouter();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const lockRef = useRef(false);
  const { prefs } = useSensoryPrefs();
  const onlyAsd = prefs.onlyAsdPecsMode;
  const showAsdHub = prefs.asdPecsMode && !onlyAsd;

  const dashboardCards: FeatureCard[] = onlyAsd
    ? ASD_SENSORY_ACTIVITIES.map((a) => ({
        id: a.id,
        name: a.name,
        href: a.href,
        icon: a.icon,
        accentClass: a.accentClass,
        iconWrapClass: a.iconWrapClass,
        ringClass: a.ringClass,
      }))
    : [
        ...FEATURES.filter(
          (f) =>
            !TEMPORARILY_HIDDEN_CARD_IDS.has(f.id) &&
            (f.id !== "pecs" || !showAsdHub)
        ),
        ...(showAsdHub
          ? [
              {
                id: ASD_PECS_HUB_CARD.id,
                name: ASD_PECS_HUB_CARD.name,
                href: ASD_PECS_HUB_CARD.href,
                icon: ASD_PECS_HUB_CARD.icon,
                accentClass: ASD_PECS_HUB_CARD.accentClass,
                iconWrapClass: ASD_PECS_HUB_CARD.iconWrapClass,
                ringClass: ASD_PECS_HUB_CARD.ringClass,
              } satisfies FeatureCard,
            ]
          : []),
      ];

  const openFeature = (feature: FeatureCard) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setNavigatingId(feature.id);
    triggerHaptic(30);
    // Open immediately — speech on leave is cancelled by StopSpeechOnNavigate.
    router.push(feature.href);
    window.setTimeout(() => {
      lockRef.current = false;
      setNavigatingId(null);
    }, 200);
  };

  return (
    <div className="space-y-6">
      <section className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          {onlyAsd ? "Sensory activities" : "What shall we learn today?"}
        </h1>
        <p className="mt-1 text-base text-slate-600">
          {onlyAsd
            ? "Distraction-free therapy — only the 7 ASD PECS sensory tools."
            : "Tap a big card to jump into a fun activity."}
        </p>
      </section>

      <PWAInstallBanner />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {dashboardCards.map((feature) => {
          const Icon = feature.icon;
          const busy = navigatingId === feature.id;

          return (
            <motion.button
              key={feature.id}
              type="button"
              disabled={navigatingId != null}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.9 }}
              transition={springTransition}
              onClick={() => openFeature(feature)}
              aria-label={`Open ${feature.name}`}
              className={`relative flex min-h-[9.5rem] flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-4 border-white/90 bg-white/80 bg-gradient-to-br p-4 text-center shadow-2xl backdrop-blur-xl ring-2 sm:min-h-[11rem] sm:p-5 disabled:cursor-wait ${feature.accentClass} ${feature.ringClass} ${
                busy ? "opacity-90" : ""
              }`}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg sm:h-16 sm:w-16 ${feature.iconWrapClass}`}
              >
                <Icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
              </span>
              <span className="text-sm font-bold leading-tight text-slate-800 sm:text-base">
                {feature.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
