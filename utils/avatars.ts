import {
  Bird,
  Cat,
  Circle,
  Dog,
  Fish,
  Flower2,
  Hexagon,
  Rabbit,
  Sparkles,
  Squirrel,
  Star,
  Triangle,
  Turtle,
  type LucideIcon,
} from "lucide-react";

export type AvatarOption = {
  id: string;
  label: string;
  category: "animals" | "flowers" | "geometric" | "initials";
  icon: LucideIcon;
  bgClass: string;
  iconClass: string;
  initial?: string;
};

export const AVATAR_GALLERY: AvatarOption[] = [
  { id: "cat-indigo", label: "Indigo Cat", category: "animals", icon: Cat, bgClass: "from-indigo-400 to-indigo-600", iconClass: "text-white" },
  { id: "dog-sky", label: "Sky Dog", category: "animals", icon: Dog, bgClass: "from-sky-400 to-sky-600", iconClass: "text-white" },
  { id: "rabbit-pink", label: "Pink Rabbit", category: "animals", icon: Rabbit, bgClass: "from-pink-400 to-rose-500", iconClass: "text-white" },
  { id: "bird-amber", label: "Amber Bird", category: "animals", icon: Bird, bgClass: "from-amber-400 to-orange-500", iconClass: "text-white" },
  { id: "fish-teal", label: "Teal Fish", category: "animals", icon: Fish, bgClass: "from-teal-400 to-cyan-600", iconClass: "text-white" },
  { id: "turtle-emerald", label: "Emerald Turtle", category: "animals", icon: Turtle, bgClass: "from-emerald-400 to-green-600", iconClass: "text-white" },
  { id: "squirrel-orange", label: "Orange Squirrel", category: "animals", icon: Squirrel, bgClass: "from-orange-400 to-amber-600", iconClass: "text-white" },
  { id: "flower-rose", label: "Rose Bloom", category: "flowers", icon: Flower2, bgClass: "from-rose-300 to-pink-500", iconClass: "text-white" },
  { id: "flower-violet", label: "Violet Petal", category: "flowers", icon: Flower2, bgClass: "from-violet-300 to-purple-500", iconClass: "text-white" },
  { id: "flower-lime", label: "Lime Blossom", category: "flowers", icon: Flower2, bgClass: "from-lime-300 to-green-500", iconClass: "text-white" },
  { id: "badge-circle", label: "Circle Badge", category: "geometric", icon: Circle, bgClass: "from-slate-400 to-slate-600", iconClass: "text-white" },
  { id: "badge-hex", label: "Hex Badge", category: "geometric", icon: Hexagon, bgClass: "from-indigo-500 to-purple-700", iconClass: "text-white" },
  { id: "badge-triangle", label: "Triangle Badge", category: "geometric", icon: Triangle, bgClass: "from-fuchsia-500 to-purple-700", iconClass: "text-white" },
  { id: "badge-star", label: "Star Badge", category: "geometric", icon: Star, bgClass: "from-yellow-400 to-amber-500", iconClass: "text-white" },
  { id: "initial-a", label: "Initial A", category: "initials", icon: Sparkles, bgClass: "from-blue-500 to-indigo-600", iconClass: "text-white", initial: "A" },
  { id: "initial-m", label: "Initial M", category: "initials", icon: Sparkles, bgClass: "from-purple-500 to-violet-700", iconClass: "text-white", initial: "M" },
  { id: "initial-s", label: "Initial S", category: "initials", icon: Sparkles, bgClass: "from-emerald-500 to-teal-600", iconClass: "text-white", initial: "S" },
  { id: "initial-z", label: "Initial Z", category: "initials", icon: Sparkles, bgClass: "from-rose-500 to-red-600", iconClass: "text-white", initial: "Z" },
];

export function getAvatarById(id: string | null | undefined): AvatarOption {
  return AVATAR_GALLERY.find((a) => a.id === id) ?? AVATAR_GALLERY[0];
}

export const TROPHY_CATALOG = [
  { id: "golden-speech", label: "Golden Speech Trophy", emoji: "🏆", description: ">80% flashcard accuracy" },
  { id: "phonics-champion", label: "Phonics Champion", emoji: "🏆", description: "Completed alphabet tracing" },
  { id: "iq-story", label: "IQ Story Trophy", emoji: "🏆", description: "Finished explorer story puzzles" },
];

export const BADGE_CATALOG = [
  { id: "first-star", label: "First Star", emoji: "🎖️", description: "Earned your first star" },
  { id: "five-day-streak", label: "5-Day Streak", emoji: "🎖️", description: "Practiced 5 days in a row" },
  { id: "story-explorer", label: "Story Explorer", emoji: "🎖️", description: "Read 10 calming stories" },
];
