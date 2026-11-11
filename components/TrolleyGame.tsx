"use client";

import { useEffect, useState } from "react";
import AlphabetSelectorModal from "@/components/trolley/AlphabetSelectorModal";
import SupermarketRide from "@/components/trolley/SupermarketRide";
import { useAuth } from "@/components/AuthProvider";
import {
  FREE_MAX_TROLLEY_LETTERS,
  getMaxSelectableLetters,
  isProMembership,
} from "@/utils/membership";
import { TROLLEY_LETTERS, type ShopperChoice } from "@/utils/trolleyCatalog";

export default function TrolleyGame() {
  const { profile } = useAuth();
  const isPro = isProMembership(profile);
  const maxLetters = getMaxSelectableLetters(profile);

  const [selectedLetters, setSelectedLetters] = useState<string[]>(() =>
    TROLLEY_LETTERS.slice(0, FREE_MAX_TROLLEY_LETTERS),
  );
  const [inRide, setInRide] = useState(false);
  const [shopper, setShopper] = useState<ShopperChoice>("girl");

  useEffect(() => {
    setSelectedLetters((prev) =>
      prev.length > maxLetters ? prev.slice(0, maxLetters) : prev,
    );
  }, [maxLetters]);

  if (!inRide) {
    return (
      <AlphabetSelectorModal
        selected={selectedLetters}
        maxLetters={maxLetters}
        isPro={isPro}
        onChangeSelected={setSelectedLetters}
        shopper={shopper}
        onChangeShopper={setShopper}
        onStartShopping={() => setInRide(true)}
      />
    );
  }

  return (
    <SupermarketRide
      letters={selectedLetters}
      shopper={shopper}
      onChangeLetters={() => setInRide(false)}
    />
  );
}
