/** Parent Shop catalog + WhatsApp order helpers (Prompt D). */

import {
  BookOpen,
  Puzzle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { WHATSAPP_CHANNEL_URL } from "@/utils/siteLinks";

export type ShopCategory = "wooden" | "workbooks" | "sensory";

export type ShopProduct = {
  id: string;
  title: string;
  category: ShopCategory;
  pricePkr: number;
  blurb: string;
  Icon: LucideIcon;
  accentClass: string;
  iconClass: string;
};

export const SHOP_CATEGORIES: {
  id: ShopCategory | "all";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "wooden", label: "Wooden Toys" },
  { id: "workbooks", label: "Printed Workbooks" },
  { id: "sensory", label: "Sensory Kits" },
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "wood-abc",
    title: "Soft Wooden ABC Blocks",
    category: "wooden",
    pricePkr: 1800,
    blurb: "Chunky pastel letters for tiny hands.",
    Icon: Puzzle,
    accentClass: "from-amber-50 to-orange-50 border-amber-200",
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    id: "wood-shapes",
    title: "Rainbow Shape Sorter",
    category: "wooden",
    pricePkr: 2200,
    blurb: "Calm colors, quiet clicks, big smiles.",
    Icon: Sparkles,
    accentClass: "from-rose-50 to-pink-50 border-rose-200",
    iconClass: "bg-rose-100 text-rose-600",
  },
  {
    id: "wb-math",
    title: "50-Page Early Math Book",
    category: "workbooks",
    pricePkr: 150,
    blurb: "Counting & tracing pages for home practice.",
    Icon: BookOpen,
    accentClass: "from-sky-50 to-cyan-50 border-sky-200",
    iconClass: "bg-sky-100 text-sky-700",
  },
  {
    id: "wb-noun",
    title: "50-Page Noun Matching Book",
    category: "workbooks",
    pricePkr: 150,
    blurb: "Picture matching for speech practice.",
    Icon: BookOpen,
    accentClass: "from-violet-50 to-fuchsia-50 border-violet-200",
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    id: "kit-calm",
    title: "Calm Sensory Kit",
    category: "sensory",
    pricePkr: 3500,
    blurb: "Soft textures, fidget tools, quiet play.",
    Icon: Sparkles,
    accentClass: "from-teal-50 to-emerald-50 border-teal-200",
    iconClass: "bg-teal-100 text-teal-700",
  },
  {
    id: "kit-trace",
    title: "Finger Trace Sensory Tray",
    category: "sensory",
    pricePkr: 2800,
    blurb: "Slow tracing paths for regulation time.",
    Icon: Puzzle,
    accentClass: "from-lime-50 to-green-50 border-lime-200",
    iconClass: "bg-lime-100 text-lime-700",
  },
];

export const PARENT_EMAIL_GROUP =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_PARENT_EMAIL_GROUP) ||
  "mailto:support@growvabusiness.com?subject=Join%20Parent%20Email%20Group";

export function getWhatsAppOrderUrl(productTitle: string): string {
  const phone =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_WHATSAPP_ORDER_PHONE) ||
    "";
  const text = encodeURIComponent(`Hi! I want to order ${productTitle}`);
  if (phone) return `https://wa.me/${phone.replace(/\D/g, "")}?text=${text}`;
  return `https://wa.me/?text=${text}`;
}

export function getReferralShareUrl(userId: string | null | undefined): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://kids.growvabusiness.com";
  const ref = userId?.trim() || "parent";
  return `${origin}/invite?ref=${encodeURIComponent(ref)}`;
}

export function getWhatsAppShareReferralUrl(referralLink: string): string {
  const text = encodeURIComponent(
    `Join me on Kids Learning App! Soft speech & calm play for little ones 💛\n${referralLink}`,
  );
  return `https://wa.me/?text=${text}`;
}

export { WHATSAPP_CHANNEL_URL };
