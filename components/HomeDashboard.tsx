"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Gamepad2,
  Grid,
  MessageCircleCode,
  Paintbrush,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { speakEnglish } from "@/utils/speech";
import { triggerHaptic } from "@/utils/haptics";

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
    id: "games",
    name: "Games",
    href: "/games",
    icon: Gamepad2,
    accentClass: "from-lime-50/90 to-cyan-100/70",
    iconWrapClass: "bg-teal-500 text-white shadow-teal-300/50",
    ringClass: "ring-teal-300/70",
  },
  {
    id: "shop",
    name: "Tap-to-Fill Color Shop",
    href: "/shop",
    icon: Paintbrush,
    accentClass: "from-emerald-50/80 to-teal-100/60",
    iconWrapClass: "bg-emerald-500 text-white shadow-emerald-300/50",
    ringClass: "ring-emerald-300/70",
  },
  {
    id: "pecs",
    name: "PECS AAC Board",
    href: "/pecs",
    icon: Grid,
    accentClass: "from-orange-50/80 to-rose-100/60",
    iconWrapClass: "bg-[#FF7F7F] text-white shadow-orange-300/50",
    ringClass: "ring-orange-300/70",
  },
];

const springTransition = { type: "spring" as const, stiffness: 420, damping: 24 };

export default function HomeDashboard() {
  const router = useRouter();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const lockRef = useRef(false);

  const openFeature = (feature: FeatureCard) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setNavigatingId(feature.id);
    triggerHaptic(30);

    speakEnglish(`Let's jump into the ${feature.name} section!`, {
      rate: 0.95,
      pitch: 1.08,
    });

    window.setTimeout(() => {
      router.push(feature.href);
      lockRef.current = false;
      setNavigatingId(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <section className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          What shall we learn today?
        </h1>
        <p className="mt-1 text-base text-slate-600">
          Tap a big card to jump into a fun activity.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => {
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
