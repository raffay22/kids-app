"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { isProUser } from "@/lib/membership";

/** 4 games that are 100% locked behind the Pro paywall (no free levels). */
export const PRO_LOCKED_GAME_IDS = new Set([
  "bloom-blast",
  "shape-ninja",
  "coin-toy-shop",
  "supermarket-trolley",
]);

/** Flashcard categories that are 100% free. */
export const FREE_FLASHCARD_CATEGORIES = new Set([
  "abc",
  "objects",
  "nouns",
  "vowels_consonants",
]);

/** Flashcard categories locked behind Pro (Grammar & Advanced). */
export const PRO_LOCKED_FLASHCARD_CATEGORIES = new Set([
  "pronouns",
  "adjectives",
  "verbs",
]);

/** Stories 1–6 (0-based indices 0..5) are permanently FREE; 7+ are Pro. */
export const FREE_STORY_COUNT = 6;

/** Coloring board: first 20 sheets form the Free Pool; 3 sheets/day limit. */
export const FREE_COLORING_POOL_SIZE = 20;
export const FREE_COLORING_DAILY_LIMIT = 3;

export type ProFeatureKey =
  | "game:bloom-blast"
  | "game:shape-ninja"
  | "game:coin-toy-shop"
  | "game:supermarket-trolley"
  | "game:picture-puzzle:pro"
  | "game:math:pro"
  | "game:logic:pro"
  | "game:word-search:pro"
  | "coloring:pro-pool"
  | "coloring:unlimited"
  | "worksheets:download"
  | "phonics"
  | "sentences:basic"
  | "sentences:advanced"
  | "sentences:pro"
  | `flashcards:${string}`
  | `story:bedtime:${number}`
  | `story:toddler:${number}`;

/**
 * Pure centralized access checker.
 * Paid Pro users bypass all restrictions across every module.
 */
export function canAccessFeature(featureKey: ProFeatureKey, isPro: boolean): boolean {
  if (isPro) return true;

  if (featureKey === "phonics" || featureKey === "sentences:basic") {
    return true;
  }

  if (featureKey.startsWith("flashcards:")) {
    const cat = featureKey.slice("flashcards:".length);
    return FREE_FLASHCARD_CATEGORIES.has(cat);
  }

  if (featureKey.startsWith("story:bedtime:")) {
    const idx = Number(featureKey.slice("story:bedtime:".length));
    return Number.isFinite(idx) && idx < FREE_STORY_COUNT;
  }

  if (featureKey.startsWith("story:toddler:")) {
    const idx = Number(featureKey.slice("story:toddler:".length));
    return Number.isFinite(idx) && idx < FREE_STORY_COUNT;
  }

  return false;
}

/**
 * Reusable React hook for Pro access control across all client components.
 */
export function useProAccess() {
  const { profile, loading } = useAuth();
  const isPro = useMemo(() => isProUser(profile), [profile]);

  const canAccess = useMemo(
    () => (featureKey: ProFeatureKey) => canAccessFeature(featureKey, isPro),
    [isPro],
  );

  return {
    isPro,
    loading,
    profile,
    canAccess,
  };
}
