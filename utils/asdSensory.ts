import {
  Apple,
  Bath,
  Cloud,
  Droplets,
  Flower2,
  Heart,
  LifeBuoy,
  PartyPopper,
  Pencil,
  Rainbow,
  Smile,
  type LucideIcon,
} from "lucide-react";

/** The 7 Special Sensory Activities — soft pastel kid-friendly styling. */
export type AsdSensoryActivity = {
  id: string;
  name: string;
  blurb: string;
  href: string;
  icon: LucideIcon;
  accentClass: string;
  iconWrapClass: string;
  ringClass: string;
};

export const ASD_SENSORY_ACTIVITIES: AsdSensoryActivity[] = [
  {
    id: "emergency",
    name: "Emergency PECS",
    blurb: "Water, Toilet, Help, Break — always free safety cards.",
    href: "/asd/emergency",
    icon: LifeBuoy,
    accentClass: "from-rose-50 to-orange-50",
    iconWrapClass: "bg-rose-100 text-rose-500 shadow-rose-100",
    ringClass: "ring-rose-200/80",
  },
  {
    id: "daily-needs",
    name: "Daily Needs & Food",
    blurb: "Snack, milk, sleep, hurt, hug, and play cards.",
    href: "/asd/daily-needs",
    icon: Apple,
    accentClass: "from-amber-50 to-yellow-50",
    iconWrapClass: "bg-amber-100 text-amber-600 shadow-amber-100",
    ringClass: "ring-amber-200/80",
  },
  {
    id: "i-want",
    name: "I Want… Builder",
    blurb: "Build a two-card sentence and speak it aloud.",
    href: "/asd/i-want",
    icon: PartyPopper,
    accentClass: "from-sky-50 to-blue-50",
    iconWrapClass: "bg-sky-100 text-sky-600 shadow-sky-100",
    ringClass: "ring-sky-200/80",
  },
  {
    id: "breathe",
    name: "Calm Breathing",
    blurb: "Hold to inhale and exhale with a gentle mascot.",
    href: "/asd/breathe",
    icon: Flower2,
    accentClass: "from-teal-50 to-cyan-50",
    iconWrapClass: "bg-teal-100 text-teal-600 shadow-teal-100",
    ringClass: "ring-teal-200/80",
  },
  {
    id: "trace",
    name: "Slow Tracing Pad",
    blurb: "Trace the path slowly — speed guard keeps it calm.",
    href: "/asd/trace",
    icon: Pencil,
    accentClass: "from-violet-50 to-fuchsia-50",
    iconWrapClass: "bg-violet-100 text-violet-600 shadow-violet-100",
    ringClass: "ring-violet-200/80",
  },
  {
    id: "feelings",
    name: "How I Feel",
    blurb: "Say happy, sad, overwhelmed, tired, or scared.",
    href: "/asd/feelings",
    icon: Smile,
    accentClass: "from-yellow-50 to-amber-50",
    iconWrapClass: "bg-yellow-100 text-yellow-600 shadow-yellow-100",
    ringClass: "ring-yellow-200/80",
  },
  {
    id: "ripple",
    name: "Ripple Sound Room",
    blurb: "Tap ripples and soft rain, ocean, or wind sounds.",
    href: "/asd/ripple",
    icon: Rainbow,
    accentClass: "from-indigo-50 to-sky-50",
    iconWrapClass: "bg-indigo-100 text-indigo-500 shadow-indigo-100",
    ringClass: "ring-indigo-200/80",
  },
];

/** Hub card shown on the main dashboard when ASD PECS Mode is enabled. */
export const ASD_PECS_HUB_CARD = {
  id: "asd-pecs-hub",
  name: "ASD PECS & Sensory Hub",
  href: "/asd",
  icon: Heart,
  accentClass: "from-pink-50 to-rose-50",
  iconWrapClass: "bg-pink-100 text-pink-600 shadow-pink-100",
  ringClass: "ring-pink-200/80",
} as const;

/** Activity 1 emergency cards — soft pastels, never paywalled. */
export const EMERGENCY_PECS_CARDS = [
  {
    id: "water",
    label: "Water",
    speak: "Water, please!",
    Icon: Droplets,
    cardClass: "border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-100 text-cyan-800",
    iconClass: "text-cyan-500",
    iconWellClass: "bg-cyan-100/90",
    freq: 587.33,
  },
  {
    id: "toilet",
    label: "Toilet",
    speak: "I want to go for toilet, please!",
    Icon: Bath,
    cardClass:
      "border-violet-200 bg-gradient-to-br from-violet-50 to-purple-100 text-violet-800",
    iconClass: "text-violet-500",
    iconWellClass: "bg-violet-100/90",
    freq: 523.25,
  },
  {
    id: "help",
    label: "Help",
    speak: "Help, please!",
    Icon: LifeBuoy,
    cardClass: "border-rose-200 bg-gradient-to-br from-rose-50 to-orange-100 text-rose-800",
    iconClass: "text-rose-500",
    iconWellClass: "bg-rose-100/90",
    freq: 659.25,
  },
  {
    id: "break",
    label: "Break",
    speak: "Break, please!",
    Icon: Cloud,
    cardClass:
      "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-900",
    iconClass: "text-amber-500",
    iconWellClass: "bg-amber-100/90",
    freq: 493.88,
  },
] as const;
