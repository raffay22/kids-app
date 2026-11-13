import {
  BarChart3,
  BookOpen,
  Calculator,
  Compass,
  Crown,
  Frame,
  Gamepad2,
  Grid,
  HeartHandshake,
  Home,
  MessageCircleCode,
  Moon,
  Newspaper,
  Paintbrush,
  Puzzle,
  ShieldCheck,
  Coins,
  ShoppingBag,
  Sliders,
  Sparkles,
  UserCheck,
  Volume2,
  type LucideIcon,
} from "lucide-react";

export type NavRoute = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

/** Route metadata for titles and parent tooling. Kid UI uses HomeDashboard cards, not a sidebar. */
export const NAV_ROUTES: NavRoute[] = [
  { href: "/", label: "Home Dashboard", shortLabel: "Home", icon: Home },
  {
    href: "/phonics",
    label: "Phonics & Tracing",
    shortLabel: "Phonics",
    icon: Volume2,
  },
  {
    href: "/flashcards",
    label: "Nouns & Verbs Flashcards",
    shortLabel: "Flashcards",
    icon: Sparkles,
  },
  {
    href: "/sentences",
    label: "Daily Sentences",
    shortLabel: "Sentences",
    icon: MessageCircleCode,
  },
  {
    href: "/games/stories/toddlers",
    label: "Stories Under 3 Years",
    shortLabel: "Stories",
    icon: BookOpen,
  },
  {
    href: "/games/stories/bedtime",
    label: "Bedtime Stories",
    shortLabel: "Bedtime",
    icon: Moon,
  },
  {
    href: "/games",
    label: "Games",
    shortLabel: "Games",
    icon: Gamepad2,
  },
  {
    href: "/shop",
    label: "Tap-to-Fill Color Shop",
    shortLabel: "Shop",
    icon: Paintbrush,
  },
  {
    href: "/games/stories/explorers",
    label: "Explorer IQ Stories",
    shortLabel: "Explorer Stories",
    icon: Compass,
  },
  {
    href: "/games/trolley",
    label: "Supermarket Trolley Game",
    shortLabel: "Trolley",
    icon: ShoppingBag,
  },
  {
    href: "/games/picture-puzzle",
    label: "3D Picture Frame Puzzle",
    shortLabel: "Picture Puzzle",
    icon: Frame,
  },
  {
    href: "/games/word-search",
    label: "Daily Kids Word Puzzle",
    shortLabel: "Word Search",
    icon: Newspaper,
  },
  {
    href: "/games/math",
    label: "Early 3D Math Lab",
    shortLabel: "Math Lab",
    icon: Calculator,
  },
  {
    href: "/games/coin-shop",
    label: "Math and Coin Toy Shop",
    shortLabel: "Coin Shop",
    icon: Coins,
  },
  {
    href: "/games/memory",
    label: "3D Tactile Memory Match",
    shortLabel: "Memory",
    icon: Sparkles,
  },
  {
    href: "/games/logic",
    label: "Cognitive Logic Puzzles",
    shortLabel: "Logic",
    icon: Puzzle,
  },
  {
    href: "/calm",
    label: "Calming Sensory Zone",
    shortLabel: "Calm Zone",
    icon: HeartHandshake,
  },
  { href: "/pecs", label: "PECS AAC Board", shortLabel: "PECS", icon: Grid },
  {
    href: "/analytics",
    label: "Practice Log & Dual-Email Export",
    shortLabel: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/profile",
    label: "Profile, Badges & Trophy Showcase",
    shortLabel: "Profile",
    icon: UserCheck,
  },
  {
    href: "/upgrade",
    label: "Pro Pass & School Coupon",
    shortLabel: "Upgrade",
    icon: Crown,
  },
  {
    href: "/settings",
    label: "Sensory & Privacy Controls",
    shortLabel: "Settings",
    icon: Sliders,
  },
  {
    href: "/admin",
    label: "Admin Dashboard & Coupon Studio",
    shortLabel: "Admin",
    icon: ShieldCheck,
  },
];

export function getRouteMeta(pathname: string): NavRoute {
  const match = NAV_ROUTES.find((route) => route.href === pathname);
  return match ?? NAV_ROUTES[0];
}

export function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href;
}
