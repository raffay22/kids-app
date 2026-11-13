"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, Home, Sparkles } from "lucide-react";
import MotionPressable from "@/components/MotionPressable";
import { getGamesForHub, type KidGame } from "@/utils/gamesCatalog";
import { triggerHaptic } from "@/utils/haptics";
import {
  KIDS_SPEECH_PITCH,
  KIDS_SPEECH_RATE,
  speakEnglish,
} from "@/utils/speech";

const spring = { type: "spring" as const, stiffness: 380, damping: 22 };

function GameTile({ game, index }: { game: KidGame; index: number }) {
  const router = useRouter();
  const isLive = game.status === "live" && Boolean(game.href);

  const onTap = () => {
    triggerHaptic(30);
    if (!isLive || !game.href) {
      speakEnglish(`${game.title} is coming soon!`, {
        rate: KIDS_SPEECH_RATE,
        pitch: KIDS_SPEECH_PITCH,
      });
      return;
    }
    // Navigate immediately so the error overlay / speech never blocks taps.
    // The destination game speaks its own prompt; leaving a page stops old speech.
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
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 sm:aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.coverSrc}
          alt={game.coverAlt}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          draggable={false}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <p className="line-clamp-2 text-lg font-extrabold leading-tight text-white drop-shadow-md sm:text-xl">
            {game.title}
          </p>
        </div>
        {!isLive && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-teal-700 shadow">
            Coming soon
          </span>
        )}
        {isLive && game.blurb.startsWith("NEW") && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-950 shadow">
            New
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

      <section className="relative mb-4 overflow-hidden rounded-[1.75rem] border-4 border-white/80 bg-gradient-to-br from-teal-400 via-cyan-400 to-sky-400 p-4 text-white shadow-[0_20px_50px_rgba(8,100,120,0.28)] sm:p-5">
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
              Big taps. Bright pictures. Pick a game and play.
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

      <div className="grid gap-4 sm:grid-cols-2">
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
