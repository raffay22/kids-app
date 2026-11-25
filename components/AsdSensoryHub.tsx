"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Home, Sparkles } from "lucide-react";
import { ASD_SENSORY_ACTIVITIES } from "@/utils/asdSensory";
import { triggerHaptic } from "@/utils/haptics";

const springTransition = { type: "spring" as const, stiffness: 420, damping: 24 };

export default function AsdSensoryHub() {
  const router = useRouter();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const lockRef = useRef(false);

  const openActivity = (id: string, href: string) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setNavigatingId(id);
    triggerHaptic(30);
    router.push(href);
    window.setTimeout(() => {
      lockRef.current = false;
      setNavigatingId(null);
    }, 200);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-md"
      >
        <Home className="h-4 w-4" aria-hidden />
        Back to Home
      </Link>

      <section className="relative overflow-hidden rounded-3xl border-4 border-pink-100 bg-gradient-to-br from-pink-50 via-amber-50 to-sky-50 p-5 shadow-2xl sm:p-7">
        <Sparkles
          className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 text-amber-200/70"
          aria-hidden
        />
        <p className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-pink-600">
          <Heart className="h-4 w-4 fill-pink-300 text-pink-500" aria-hidden />
          Calm · ASD PECS
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Sensory Hub
        </h1>
        <p className="mt-2 text-base font-medium text-slate-600">
          Soft colors, gentle sounds, and big friendly buttons — pick one to begin.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ASD_SENSORY_ACTIVITIES.map((activity, index) => {
          const Icon = activity.icon;
          const busy = navigatingId === activity.id;
          return (
            <motion.button
              key={activity.id}
              type="button"
              disabled={navigatingId != null}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: index * 0.04 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => openActivity(activity.id, activity.href)}
              aria-label={`Open ${activity.name}`}
              className={`flex min-h-[7.5rem] items-center gap-4 rounded-3xl border-4 border-white bg-gradient-to-br p-4 text-left shadow-xl ring-2 backdrop-blur-xl ${activity.accentClass} ${activity.ringClass} ${
                busy ? "opacity-90" : ""
              }`}
            >
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border-4 border-white shadow-md ${activity.iconWrapClass}`}
              >
                <Icon className="h-8 w-8" strokeWidth={2.05} aria-hidden />
              </span>
              <span>
                <span className="block text-base font-extrabold text-slate-800">
                  {activity.name}
                </span>
                <span className="mt-0.5 block text-sm font-medium text-slate-600">
                  {activity.blurb}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
