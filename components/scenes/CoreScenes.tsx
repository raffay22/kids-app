"use client";

import { useId } from "react";
import { motion } from "framer-motion";

type SceneProps = { size: number };

/** Bright, glowing, smiling animated sun — rotating rays, gentle bob, pulsing glow. */
export function SunScene({ size }: SceneProps) {
  const uid = useId().replace(/[:]/g, "");
  const g = `sun-${uid}`;
  const rays = Array.from({ length: 8 });

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Sun"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <radialGradient id={g} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <motion.g
        style={{ transformOrigin: "100px 100px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {rays.map((_, i) => (
          <rect
            key={i}
            x="94"
            y="14"
            width="12"
            height="30"
            rx="6"
            fill="#fbbf24"
            transform={`rotate(${(360 / rays.length) * i} 100 100)`}
          />
        ))}
      </motion.g>
      <circle cx="100" cy="100" r="46" fill={`url(#${g})`} />
      <ellipse cx="82" cy="112" rx="7" ry="4" fill="#fb923c" opacity="0.5" />
      <ellipse cx="118" cy="112" rx="7" ry="4" fill="#fb923c" opacity="0.5" />
      <circle cx="88" cy="94" r="4.5" fill="#92400e" />
      <circle cx="112" cy="94" r="4.5" fill="#92400e" />
      <path d="M86 108 Q100 120 114 108" stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </motion.svg>
  );
}

/** Glossy bouncing apple with wiggling leaf and shine highlight. */
export function AppleScene({ size }: SceneProps) {
  const uid = useId().replace(/[:]/g, "");
  const g = `apple-${uid}`;
  return (
    <motion.svg
      viewBox="38 46 124 130"
      width={size}
      height={size}
      role="img"
      aria-label="Apple"
      animate={{ scaleY: [1, 0.94, 1], scaleX: [1, 1.04, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "100px 130px" }}
    >
      <defs>
        <radialGradient id={g} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="55%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </radialGradient>
      </defs>
      <path
        d="M100 78c-26-14-56 4-54 36 2 30 30 52 54 52s52-22 54-52c2-32-28-50-54-36Z"
        fill={`url(#${g})`}
      />
      <ellipse cx="80" cy="100" rx="10" ry="16" fill="#fff" opacity="0.35" />
      <rect x="96" y="56" width="8" height="24" rx="4" fill="#7c4a1e" />
      <motion.path
        d="M104 62 Q126 54 130 70 Q112 72 104 62Z"
        fill="#4ade80"
        style={{ transformOrigin: "104px 62px" }}
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/** Cute dog head bust — floppy ears wiggle, happy panting tongue. */
export function DogScene({ size }: SceneProps) {
  const uid = useId().replace(/[:]/g, "");
  const g = `dog-${uid}`;
  return (
    <motion.svg
      viewBox="24 44 152 130"
      width={size}
      height={size}
      role="img"
      aria-label="Dog"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <radialGradient id={g} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fde3b8" />
          <stop offset="100%" stopColor="#d9a25b" />
        </radialGradient>
      </defs>
      <motion.path
        d="M56 76 Q30 60 40 110 Q56 116 68 92Z"
        fill="#c2894f"
        style={{ transformOrigin: "60px 76px" }}
        animate={{ rotate: [-4, 6, -4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M144 76 Q170 60 160 110 Q144 116 132 92Z"
        fill="#c2894f"
        style={{ transformOrigin: "140px 76px" }}
        animate={{ rotate: [4, -6, 4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="100" cy="105" r="52" fill={`url(#${g})`} />
      <ellipse cx="100" cy="128" rx="26" ry="20" fill="#fff6e8" />
      <circle cx="100" cy="120" r="9" fill="#3f2d1a" />
      <circle cx="80" cy="98" r="6" fill="#1e293b" />
      <circle cx="120" cy="98" r="6" fill="#1e293b" />
      <circle cx="78" cy="96" r="2" fill="#fff" />
      <circle cx="118" cy="96" r="2" fill="#fff" />
      <motion.path
        d="M94 140 Q100 156 106 140"
        stroke="#f472b6"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        animate={{ d: ["M94 140 Q100 156 106 140", "M94 140 Q100 148 106 140", "M94 140 Q100 156 106 140"] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/** Playful cat face — twitching whiskers, blinking eyes. */
export function CatScene({ size }: SceneProps) {
  const uid = useId().replace(/[:]/g, "");
  const g = `cat-${uid}`;
  return (
    <motion.svg viewBox="34 20 132 142" width={size} height={size} role="img" aria-label="Cat">
      <defs>
        <radialGradient id={g} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <path d="M60 70 L48 30 L82 58Z" fill="#f59e0b" />
      <path d="M140 70 L152 30 L118 58Z" fill="#f59e0b" />
      <path d="M64 68 L54 38 L82 60Z" fill="#fed7aa" />
      <path d="M136 68 L146 38 L118 60Z" fill="#fed7aa" />
      <circle cx="100" cy="105" r="50" fill={`url(#${g})`} />
      <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.95, 1] }} style={{ transformOrigin: "100px 96px" }}>
        <ellipse cx="82" cy="96" rx="6" ry="8" fill="#1e293b" />
        <ellipse cx="118" cy="96" rx="6" ry="8" fill="#1e293b" />
      </motion.g>
      <path d="M94 116 L106 116 L100 124Z" fill="#f472b6" />
      <motion.g animate={{ rotate: [0, 3, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "70px 120px" }}>
        <line x1="70" y1="118" x2="40" y2="112" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="124" x2="40" y2="126" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <motion.g animate={{ rotate: [0, -3, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "130px 120px" }}>
        <line x1="130" y1="118" x2="160" y2="112" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        <line x1="130" y1="124" x2="160" y2="126" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </motion.svg>
  );
}

/** Glass of milk with gentle bubble fizz. */
export function MilkScene({ size }: SceneProps) {
  return (
    <motion.svg viewBox="58 20 100 160" width={size} height={size} role="img" aria-label="Milk" animate={{ y: [0, -5, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
      <path d="M72 50 L128 50 L120 160 Q100 172 80 160Z" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="3" />
      <path d="M78 78 L122 78 L116 156 Q100 166 84 156Z" fill="#f8fafc" />
      <rect x="90" y="30" width="20" height="24" rx="4" fill="#facc15" />
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={90 + i * 10}
          cy={130}
          r="4"
          fill="#bae6fd"
          animate={{ cy: [140, 90], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}
    </motion.svg>
  );
}

/** Bouncing water droplet with ripple rings. */
export function WaterScene({ size }: SceneProps) {
  return (
    <svg viewBox="48 28 104 172" width={size} height={size} role="img" aria-label="Water">
      <motion.path
        d="M100 34c26 40 40 62 40 84a40 40 0 0 1-80 0c0-22 14-44 40-84Z"
        fill="#38bdf8"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <ellipse cx="86" cy="120" rx="8" ry="12" fill="#e0f2fe" opacity="0.7" />
      {[0, 1].map((i) => (
        <motion.circle
          key={i}
          cx="100"
          cy="150"
          r="10"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="3"
          animate={{ r: [10, 46], opacity: [0.7, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

/** Cozy chair with a soft bounce. */
export function ChairScene({ size }: SceneProps) {
  return (
    <motion.svg viewBox="48 42 112 142" width={size} height={size} role="img" aria-label="Chair" animate={{ rotate: [-1.5, 1.5, -1.5] }} transition={{ duration: 3, repeat: Infinity }}>
      <rect x="60" y="50" width="80" height="70" rx="16" fill="#fb923c" />
      <rect x="66" y="58" width="68" height="54" rx="12" fill="#fdba74" />
      <rect x="54" y="112" width="92" height="26" rx="12" fill="#ea580c" />
      <rect x="60" y="136" width="14" height="40" rx="6" fill="#7c2d12" />
      <rect x="126" y="136" width="14" height="40" rx="6" fill="#7c2d12" />
    </motion.svg>
  );
}

/** Storybook that gently opens and closes. */
export function BookScene({ size }: SceneProps) {
  return (
    <svg viewBox="38 60 124 100" width={size} height={size} role="img" aria-label="Book">
      <rect x="45" y="70" width="110" height="80" rx="8" fill="#7c3aed" />
      <motion.path
        d="M100 76 L100 142 L52 150 L52 84Z"
        fill="#ede9fe"
        style={{ transformOrigin: "100px 110px" }}
        animate={{ rotateY: [0, 25, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <path d="M100 76 L100 142 L148 150 L148 84Z" fill="#f5f3ff" />
      <line x1="112" y1="96" x2="140" y2="92" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
      <line x1="112" y1="108" x2="140" y2="104" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Fluffy rabbit with twitching ears and nose. */
export function RabbitScene({ size }: SceneProps) {
  return (
    <motion.svg viewBox="46 10 108 155" width={size} height={size} role="img" aria-label="Rabbit" animate={{ y: [0, -10, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
      <motion.ellipse cx="82" cy="52" rx="12" ry="34" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" style={{ transformOrigin: "82px 84px" }} animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <motion.ellipse cx="118" cy="52" rx="12" ry="34" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" style={{ transformOrigin: "118px 84px" }} animate={{ rotate: [4, -4, 4] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <circle cx="100" cy="110" r="48" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="84" cy="100" r="5" fill="#1e293b" />
      <circle cx="116" cy="100" r="5" fill="#1e293b" />
      <motion.ellipse cx="100" cy="118" rx="6" ry="4" fill="#f472b6" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
    </motion.svg>
  );
}

/** Soft cloud drifting side to side. */
export function CloudScene({ size }: SceneProps) {
  return (
    <motion.svg viewBox="36 56 138 100" width={size} height={size} role="img" aria-label="Cloud" animate={{ x: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <ellipse cx="100" cy="120" rx="58" ry="30" fill="#e0f2fe" />
      <circle cx="70" cy="100" r="26" fill="#f0f9ff" />
      <circle cx="120" cy="94" r="32" fill="#f0f9ff" />
      <circle cx="150" cy="112" r="22" fill="#f0f9ff" />
    </motion.svg>
  );
}

/** Crescent moon with twinkling stars. */
export function MoonScene({ size }: SceneProps) {
  return (
    <svg viewBox="25 15 165 175" width={size} height={size} role="img" aria-label="Moon">
      <motion.path d="M120 40a70 70 0 1 0 0 120 60 60 0 1 1 0-120Z" fill="#c4b5fd" animate={{ rotate: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ transformOrigin: "100px 100px" }} />
      {[{ x: 150, y: 60 }, { x: 165, y: 100 }, { x: 145, y: 135 }].map((s, i) => (
        <motion.path
          key={i}
          d={`M${s.x} ${s.y - 6} L${s.x + 2} ${s.y} L${s.x + 6} ${s.y} L${s.x + 2} ${s.y + 3} L${s.x + 4} ${s.y + 8} L${s.x} ${s.y + 4} L${s.x - 4} ${s.y + 8} L${s.x - 2} ${s.y + 3} L${s.x - 6} ${s.y} L${s.x - 2} ${s.y}Z`}
          fill="#fef9c3"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </svg>
  );
}

/** Bouncing ball with squash-and-stretch. */
export function BallScene({ size }: SceneProps) {
  return (
    <motion.svg viewBox="38 38 124 158" width={size} height={size} role="img" aria-label="Ball" animate={{ y: [0, 40, 0] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}>
      <motion.g animate={{ scaleX: [1, 1.12, 1], scaleY: [1, 0.9, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "100px 100px" }}>
        <circle cx="100" cy="100" r="50" fill="#fb923c" />
        <path d="M60 80 Q100 100 140 80" stroke="#fff" strokeWidth="5" fill="none" />
        <path d="M60 120 Q100 100 140 120" stroke="#fff" strokeWidth="5" fill="none" />
        <line x1="100" y1="50" x2="100" y2="150" stroke="#fff" strokeWidth="5" />
      </motion.g>
    </motion.svg>
  );
}

/** Swaying tree with leaves rustling. */
export function TreeScene({ size }: SceneProps) {
  return (
    <svg viewBox="34 28 132 148" width={size} height={size} role="img" aria-label="Tree">
      <rect x="90" y="120" width="20" height="50" rx="6" fill="#92400e" />
      <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "100px 120px" }}>
        <circle cx="100" cy="80" r="46" fill="#4ade80" />
        <circle cx="70" cy="100" r="30" fill="#22c55e" />
        <circle cx="130" cy="100" r="30" fill="#22c55e" />
      </motion.g>
    </svg>
  );
}

/** Swimming fish with waving tail and bubbles. */
export function FishScene({ size }: SceneProps) {
  return (
    <motion.svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Fish" animate={{ x: [-6, 6, -6] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
      <ellipse cx="105" cy="100" rx="46" ry="32" fill="#38bdf8" />
      <motion.path d="M60 100 L20 76 L20 124Z" fill="#0ea5e9" style={{ transformOrigin: "60px 100px" }} animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 0.8, repeat: Infinity }} />
      <circle cx="130" cy="92" r="6" fill="#0c4a6e" />
      <path d="M150 100 Q140 112 122 108" stroke="#0284c7" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[0, 1].map((i) => (
        <motion.circle key={i} cx={170} cy={90 - i * 10} r="3" fill="#bae6fd" animate={{ cy: [90 - i * 10, 40], opacity: [1, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5 }} />
      ))}
    </motion.svg>
  );
}

/** Friendly lion with pulsing mane. */
export function LionScene({ size }: SceneProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Lion">
      <motion.circle cx="100" cy="100" r="66" fill="#f59e0b" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: "100px 100px" }} />
      <circle cx="100" cy="102" r="42" fill="#fde68a" />
      <circle cx="86" cy="94" r="5" fill="#1e293b" />
      <circle cx="114" cy="94" r="5" fill="#1e293b" />
      <path d="M92 116 Q100 124 108 116" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="108" rx="7" ry="5" fill="#78350f" />
    </svg>
  );
}

/** Steamy slice of pizza. */
export function PizzaScene({ size }: SceneProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Pizza">
      <path d="M100 40 L155 150 L45 150Z" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
      <circle cx="90" cy="100" r="8" fill="#dc2626" />
      <circle cx="115" cy="120" r="8" fill="#dc2626" />
      <circle cx="100" cy="130" r="6" fill="#16a34a" />
      {[0, 1].map((i) => (
        <motion.path
          key={i}
          d={`M${88 + i * 24} 50 q-6 -14 0 -26`}
          stroke="#e2e8f0"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </svg>
  );
}

/** Gleaming golden trophy with a pulsing glow and floating sparkles. */
export function TrophyScene({ size }: SceneProps) {
  const uid = useId().replace(/[:]/g, "");
  const g = `trophy-${uid}`;
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Trophy"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="100"
        cy="100"
        r="70"
        fill="#fde68a"
        opacity="0.35"
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 100px" }}
      />
      <rect x="76" y="150" width="48" height="14" rx="4" fill="#78350f" />
      <rect x="86" y="136" width="28" height="18" fill={`url(#${g})`} />
      <path d="M70 60h60v34c0 20-14 34-30 34s-30-14-30-34Z" fill={`url(#${g})`} />
      <path d="M70 66c-14-2-22 6-22 18s10 22 26 22" stroke="#b45309" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M130 66c14-2 22 6 22 18s-10 22-26 22" stroke="#b45309" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M100 66 L106 80 L121 80 L109 89 L113 104 L100 95 L87 104 L91 89 L79 80 L94 80Z" fill="#fff7d6" opacity="0.9" />
      {[{ x: 55, y: 40 }, { x: 150, y: 50 }, { x: 145, y: 130 }].map((s, i) => (
        <motion.path
          key={i}
          d={`M${s.x} ${s.y - 6} L${s.x + 2} ${s.y} L${s.x + 6} ${s.y} L${s.x + 2} ${s.y + 3} L${s.x + 4} ${s.y + 8} L${s.x} ${s.y + 4} L${s.x - 4} ${s.y + 8} L${s.x - 2} ${s.y + 3} L${s.x - 6} ${s.y} L${s.x - 2} ${s.y}Z`}
          fill="#fef08a"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }}
          style={{ transformOrigin: `${s.x}px ${s.y}px` }}
        />
      ))}
    </motion.svg>
  );
}

/** Gentle elephant with swaying trunk and ear flap. */
export function ElephantScene({ size }: SceneProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Elephant">
      <motion.ellipse cx="60" cy="96" rx="30" ry="34" fill="#c4b5fd" style={{ transformOrigin: "80px 96px" }} animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 2.2, repeat: Infinity }} />
      <circle cx="106" cy="98" r="52" fill="#ddd6fe" />
      <circle cx="90" cy="92" r="5" fill="#1e293b" />
      <circle cx="122" cy="92" r="5" fill="#1e293b" />
      <motion.path
        d="M96 118 q-4 30 -18 40"
        stroke="#ddd6fe"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        animate={{ d: ["M96 118 q-4 30 -18 40", "M96 118 q4 30 -8 44", "M96 118 q-4 30 -18 40"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
