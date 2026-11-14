import {
  Bath,
  Droplets,
  Hand,
  HeartHandshake,
  Pause,
  ShieldAlert,
  Smile,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";

/** The 7 Special Sensory Activities — matches seven-activites.md prompts. */
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
    icon: ShieldAlert,
    accentClass: "from-rose-50/90 to-orange-100/70",
    iconWrapClass: "bg-rose-500 text-white shadow-rose-300/50",
    ringClass: "ring-rose-300/70",
  },
  {
    id: "daily-needs",
    name: "Daily Needs & Food",
    blurb: "Snack, milk, sleep, hurt, hug, and play cards.",
    href: "/asd/daily-needs",
    icon: Sparkles,
    accentClass: "from-amber-50/90 to-yellow-100/70",
    iconWrapClass: "bg-amber-500 text-white shadow-amber-300/50",
    ringClass: "ring-amber-300/70",
  },
  {
    id: "i-want",
    name: "I Want… Builder",
    blurb: "Build a two-card sentence and speak it aloud.",
    href: "/asd/i-want",
    icon: Hand,
    accentClass: "from-sky-50/90 to-blue-100/70",
    iconWrapClass: "bg-sky-500 text-white shadow-sky-300/50",
    ringClass: "ring-sky-300/70",
  },
  {
    id: "breathe",
    name: "Calm Breathing",
    blurb: "Hold to inhale and exhale with a gentle mascot.",
    href: "/asd/breathe",
    icon: HeartHandshake,
    accentClass: "from-teal-50/90 to-cyan-100/70",
    iconWrapClass: "bg-teal-500 text-white shadow-teal-300/50",
    ringClass: "ring-teal-300/70",
  },
  {
    id: "trace",
    name: "Slow Tracing Pad",
    blurb: "Trace the path slowly — speed guard keeps it calm.",
    href: "/asd/trace",
    icon: Sparkles,
    accentClass: "from-violet-50/90 to-purple-100/70",
    iconWrapClass: "bg-violet-500 text-white shadow-violet-300/50",
    ringClass: "ring-violet-300/70",
  },
  {
    id: "feelings",
    name: "How I Feel",
    blurb: "Say happy, sad, overwhelmed, tired, or scared.",
    href: "/asd/feelings",
    icon: Smile,
    accentClass: "from-yellow-50/90 to-amber-100/70",
    iconWrapClass: "bg-yellow-400 text-white shadow-yellow-300/50",
    ringClass: "ring-yellow-300/70",
  },
  {
    id: "ripple",
    name: "Ripple Sound Room",
    blurb: "Tap ripples and soft rain, ocean, or wind sounds.",
    href: "/asd/ripple",
    icon: Wind,
    accentClass: "from-indigo-50/90 to-slate-100/70",
    iconWrapClass: "bg-indigo-600 text-white shadow-indigo-300/50",
    ringClass: "ring-indigo-300/70",
  },
];

/** Hub card shown on the main dashboard when ASD PECS Mode is enabled. */
export const ASD_PECS_HUB_CARD = {
  id: "asd-pecs-hub",
  name: "ASD PECS & Sensory Hub",
  href: "/asd",
  icon: Droplets,
  accentClass: "from-amber-50/90 to-orange-100/80",
  iconWrapClass: "bg-amber-500 text-white shadow-amber-300/50",
  ringClass: "ring-amber-400/80",
} as const;

/** Activity 1 emergency cards — never paywalled. */
export const EMERGENCY_PECS_CARDS = [
  {
    id: "water",
    label: "Water",
    speak: "Water!",
    Icon: Droplets,
    cardClass: "border-cyan-400 bg-cyan-50/90 text-cyan-800",
    iconClass: "text-cyan-600",
    freq: 587.33,
  },
  {
    id: "toilet",
    label: "Toilet",
    speak: "Toilet!",
    Icon: Bath,
    cardClass: "border-purple-400 bg-purple-50/90 text-purple-800",
    iconClass: "text-purple-600",
    freq: 523.25,
  },
  {
    id: "help",
    label: "Help",
    speak: "Help!",
    Icon: ShieldAlert,
    cardClass: "border-rose-400 bg-rose-50/90 text-rose-800",
    iconClass: "text-rose-600",
    freq: 659.25,
  },
  {
    id: "break",
    label: "Break",
    speak: "Break!",
    Icon: Pause,
    cardClass: "border-amber-400 bg-amber-50/90 text-amber-800",
    iconClass: "text-amber-600",
    freq: 493.88,
  },
] as const;
