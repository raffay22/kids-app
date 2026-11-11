"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Home,
  Music2,
  ShoppingCart,
  Sparkles,
  Star,
  Triangle,
  type LucideIcon,
} from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import {
  getGamesForHub,
  type KidGame,
  type KidGameArtTone,
} from "@/utils/gamesCatalog";
import { triggerHaptic } from "@/utils/haptics";
import { speakEnglish } from "@/utils/speech";

const spring = { type: "spring" as const, stiffness: 380, damping: 22 };

const ART: Record<
  KidGameArtTone,
  { panel: string; badge: string; Icon: LucideIcon }
> = {
  lime: {
    panel: "from-lime-300 via-emerald-300 to-teal-400",
    badge: "text-teal-800",
    Icon: ShoppingCart,
  },
  amber: {
    panel: "from-amber-300 via-orange-300 to-rose-400",
    badge: "text-orange-800",
    Icon: Star,
  },
  cyan: {
    panel: "from-cyan-300 via-sky-300 to-blue-400",
    badge: "text-sky-800",
    Icon: Music2,
  },
  rose: {
    panel: "from-rose-300 via-pink-300 to-orange-300",
    badge: "text-rose-800",
    Icon: Triangle,
  },
  sky: {
    panel: "from-sky-300 via-cyan-300 to-teal-400",
    badge: "text-sky-900",
    Icon: Gamepad2,
  },
};

function GameTile({ game, index }: { game: KidGame; index: number }) {
  const router = useRouter();
  const isLive = game.status === "live" && Boolean(game.href);
  const art = ART[game.artTone];
  const Icon = art.Icon;

  const onTap = () => {
    triggerHaptic(30);
    if (!isLive || !game.href) {
      speakEnglish(`${game.title} is coming soon!`, { rate: 0.95, pitch: 1.1 });
      return;
    }
    speakEnglish(`Let's play ${game.title}!`, { rate: 0.95, pitch: 1.1 });
    router.push(game.href);
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay: 0.08 + index * 0.07 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onTap}
      aria-label={isLive ? `Play ${game.title}` : `${game.title}, coming soon`}
      className="group relative overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-white text-left shadow-[0_18px_40px_rgba(15,80,90,0.16)]"
    >
      <div
        className={`relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br sm:h-32 ${art.panel}`}
      >
        <motion.span
          aria-hidden
          className="absolute -left-4 top-3 h-16 w-16 rounded-full bg-white/25"
          animate={{ y: [0, 10, 0], x: [0, 6, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          aria-hidden
          className="absolute -right-2 bottom-6 h-20 w-20 rounded-full bg-white/20"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <span className="relative z-[1] flex items-center gap-3 rounded-3xl bg-white/30 px-4 py-3 text-white shadow-inner backdrop-blur-sm">
          <Icon className="h-10 w-10" strokeWidth={2.25} aria-hidden />
          <span className="text-xl font-extrabold leading-tight sm:text-2xl">{game.title}</span>
        </span>
        {!isLive && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-teal-700 shadow">
            Coming soon
          </span>
        )}
      </div>
      <div className="space-y-1 p-4 sm:p-5">
        <h2 className="text-xl font-extrabold text-slate-800">{game.title}</h2>
        <p className="text-sm font-medium leading-snug text-slate-600">{game.blurb}</p>
      </div>
    </motion.button>
  );
}

export default function GamesHub() {
  const router = useRouter();
  const games = getGamesForHub();
  const hasLive = games.some((g) => g.status === "live");

  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] px-1 pb-2 pt-1 sm:px-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,_#dff9fb_0%,_#fff7e6_45%,_#ffe8d6_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-8 -z-10 h-40 w-40 rounded-full bg-lime-300/40 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-24 -z-10 h-48 w-48 rounded-full bg-cyan-300/35 blur-2xl"
      />

      <section className="relative mb-4 overflow-hidden rounded-[1.75rem] border-4 border-white/80 bg-gradient-to-br from-teal-400 via-cyan-400 to-sky-400 p-4 text-white shadow-[0_20px_50px_rgba(8,100,120,0.28)] sm:p-5">
        <motion.div
          aria-hidden
          className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-3 right-10 h-14 w-14 rounded-full bg-lime-300/50"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-white/90">
              <Gamepad2 className="h-4 w-4" aria-hidden />
              Play Zone
            </p>
            <h1 className="text-3xl font-extrabold leading-none tracking-tight drop-shadow-sm sm:text-4xl">
              Games
            </h1>
            <p className="mt-2 max-w-md text-sm font-semibold text-white/95 sm:text-base">
              Tap Supermarket Trolley to start shopping.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.15 }}
            className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/25 shadow-inner backdrop-blur sm:h-16 sm:w-16"
            aria-hidden
          >
            <Gamepad2 className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.25} />
          </motion.div>
        </div>
      </section>

      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-teal-800">
        <Sparkles className="h-4 w-4 text-amber-500" aria-hidden />
        {hasLive ? "Pick a game to play" : "Games are on the way — peek at what’s coming"}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <GameTile key={game.id} game={game} index={index} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <MotionPressable
          onClick={() => router.push("/")}
          ariaLabel="Go to homepage"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-teal-700 bg-gradient-to-b from-teal-400 to-teal-500 px-6 py-3 text-base font-extrabold text-white shadow-xl"
        >
          <Home className="h-5 w-5" aria-hidden />
          Home
        </MotionPressable>
      </div>
    </div>
  );
}
