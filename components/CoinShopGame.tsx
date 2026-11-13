"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Coins, ShoppingBag } from "lucide-react";
import Illustration from "@/components/Illustration";
import MotionPressable from "@/components/MotionPressable";
import { useAuth } from "@/components/AuthProvider";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useTTS } from "@/hooks/useTTS";
import { createClient } from "@/utils/supabase/client";
import { logProgress } from "@/utils/logProgress";
import { burstConfetti, playDing, playBoop } from "@/utils/celebrate";
import { triggerHaptic } from "@/utils/haptics";

type ShopItem = {
  id: string;
  name: string;
  word: string;
  price: number;
};

const SHOP_ITEMS: ShopItem[] = [
  { id: "toy-ball", name: "Bouncy Ball", word: "ball", price: 1 },
  { id: "toy-book", name: "Story Book", word: "book", price: 2 },
  { id: "toy-star", name: "Shiny Star", word: "sun", price: 3 },
];

type CoinPill = { id: string };

export default function CoinShopGame() {
  const { user } = useAuth();
  const { activeChild, refreshChildren } = useActiveChild();
  const { speak } = useTTS();

  const [wallet, setWallet] = useState<CoinPill[]>(
    Array.from({ length: 6 }, (_, i) => ({ id: `coin-${i}` })),
  );
  const [register, setRegister] = useState<CoinPill[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [owned, setOwned] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const countAloud = useCallback(
    (n: number) => {
      const words = ["zero", "one", "two", "three", "four", "five", "six"];
      speak(words[n] ?? String(n), 0.85);
    },
    [speak],
  );

  const moveCoinToRegister = (coin: CoinPill) => {
    triggerHaptic(30);
    setWallet((prev) => prev.filter((c) => c.id !== coin.id));
    setRegister((prev) => {
      const next = [...prev, coin];
      countAloud(next.length);
      return next;
    });
    setFeedback(null);
  };

  const returnCoin = (coin: CoinPill) => {
    triggerHaptic(30);
    setRegister((prev) => prev.filter((c) => c.id !== coin.id));
    setWallet((prev) => [...prev, coin]);
  };

  const handleBuy = useCallback(async () => {
    if (!selectedItem) {
      playBoop();
      setFeedback("Pick a toy from the shelf first!");
      return;
    }

    if (register.length < selectedItem.price) {
      playBoop();
      setFeedback(`Need ${selectedItem.price} coins — keep counting!`);
      return;
    }

    if (owned.includes(selectedItem.id)) {
      playBoop();
      setFeedback("You already own that toy!");
      return;
    }

    triggerHaptic(30);
    burstConfetti();
    playDing();
    speak(`You bought the ${selectedItem.name}!`, 0.95);
    setOwned((prev) => [...prev, selectedItem.id]);
    setRegister((prev) => prev.slice(selectedItem.price));
    setFeedback(`Yay! ${selectedItem.name} is yours!`);

    if (user && activeChild) {
      void logProgress({
        user_id: user.id,
        child_id: activeChild.id,
        feature_route: "/shop",
        attempt_type: "tap",
        target_word: selectedItem.id,
        is_correct: true,
      });

      try {
        const supabase = createClient();
        const toys = activeChild.unlocked_toys ?? [];
        if (!toys.includes(selectedItem.id)) {
          await supabase
            .from("children")
            .update({ unlocked_toys: [...toys, selectedItem.id] })
            .eq("id", activeChild.id);
          await refreshChildren();
        }
      } catch {
        // offline ok
      }
    }
  }, [selectedItem, register.length, owned, user, activeChild, speak, refreshChildren]);

  return (
    <div className="space-y-5">
      <section className="kid-card border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5">
        <p className="flex items-center gap-1.5 text-sm font-bold uppercase text-amber-600">
          <Coins className="h-4 w-4" aria-hidden />
          Coin Toy Shop
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">Count coins & buy a toy!</h2>
        <p className="mt-1 text-sm text-slate-600">Tap coins into the saving box, then buy.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {SHOP_ITEMS.map((item) => (
          <MotionPressable
            key={item.id}
            onClick={() => setSelectedItem(item)}
            ariaLabel={`Select ${item.name}`}
            className={`kid-card flex flex-col items-center gap-2 p-4 ${
              selectedItem?.id === item.id
                ? "border-amber-400 ring-2 ring-amber-300"
                : "border-slate-200"
            } ${owned.includes(item.id) ? "opacity-60" : ""}`}
          >
            <Illustration word={item.word} size="sm" />
            <span className="font-bold text-slate-800">{item.name}</span>
            <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
              <Coins className="h-4 w-4" aria-hidden />
              {item.price} {item.price === 1 ? "coin" : "coins"}
            </span>
            {owned.includes(item.id) && (
              <span className="text-xs font-bold text-emerald-600">Owned</span>
            )}
          </MotionPressable>
        ))}
      </div>

      <LayoutGroup>
        <section className="kid-card border-indigo-200 bg-indigo-50/50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase text-amber-700">
            <span aria-hidden>🐻</span>
            Saving box ({register.length} coins)
          </p>
          <div className="flex min-h-[52px] flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {register.map((coin) => (
                <motion.button
                  key={coin.id}
                  layoutId={coin.id}
                  type="button"
                  onClick={() => returnCoin(coin)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-b-4 border-amber-500 bg-gradient-to-b from-amber-300 to-amber-400 text-lg font-bold text-amber-900 shadow-md"
                >
                  1
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <section className="kid-card border-slate-200 p-4">
          <p className="mb-2 text-sm font-bold uppercase text-slate-500">Your coins</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {wallet.map((coin) => (
                <motion.button
                  key={coin.id}
                  layoutId={coin.id}
                  type="button"
                  onClick={() => moveCoinToRegister(coin)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-b-4 border-amber-500 bg-gradient-to-b from-yellow-300 to-amber-400 text-lg font-bold text-amber-900 shadow-md"
                >
                  1
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </LayoutGroup>

      <MotionPressable
        onClick={() => void handleBuy()}
        ariaLabel="Buy selected toy"
        className="btn-3d-success flex w-full items-center justify-center gap-2 py-4 text-lg"
      >
        <ShoppingBag className="h-5 w-5" aria-hidden />
        Buy toy
      </MotionPressable>

      {feedback && (
        <p className="text-center text-lg font-bold text-indigo-700">{feedback}</p>
      )}
    </div>
  );
}
