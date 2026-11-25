import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve("public/coloring/sheets");

const sheets = [
  {
    id: "svg-sun",
    title: "Sunny Day",
    emoji: "☀️",
    category: "nature",
    body: `<circle cx="400" cy="280" r="90" fill="none" stroke="#111" stroke-width="8"/>
<g stroke="#111" stroke-width="8" stroke-linecap="round">
  <line x1="400" y1="140" x2="400" y2="90"/><line x1="400" y1="470" x2="400" y2="520"/>
  <line x1="260" y1="280" x2="210" y2="280"/><line x1="540" y1="280" x2="590" y2="280"/>
  <line x1="300" y1="180" x2="265" y2="145"/><line x1="500" y1="180" x2="535" y2="145"/>
  <line x1="300" y1="380" x2="265" y2="415"/><line x1="500" y1="380" x2="535" y2="415"/>
</g>`,
  },
  {
    id: "svg-house",
    title: "Cozy House",
    emoji: "🏠",
    category: "places",
    body: `<path d="M200 420 L400 220 L600 420 Z" fill="none" stroke="#111" stroke-width="8"/>
<rect x="240" y="420" width="320" height="220" fill="none" stroke="#111" stroke-width="8"/>
<rect x="360" y="500" width="80" height="140" fill="none" stroke="#111" stroke-width="8"/>
<rect x="280" y="470" width="60" height="60" fill="none" stroke="#111" stroke-width="6"/>
<rect x="460" y="470" width="60" height="60" fill="none" stroke="#111" stroke-width="6"/>`,
  },
  {
    id: "svg-fish",
    title: "Happy Fish",
    emoji: "🐟",
    category: "animals",
    body: `<ellipse cx="380" cy="420" rx="140" ry="80" fill="none" stroke="#111" stroke-width="8"/>
<path d="M520 420 L640 340 L640 500 Z" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="320" cy="400" r="14" fill="#111"/>
<path d="M280 450 Q320 480 360 450" fill="none" stroke="#111" stroke-width="6"/>`,
  },
  {
    id: "svg-tree",
    title: "Big Tree",
    emoji: "🌳",
    category: "nature",
    body: `<rect x="370" y="480" width="60" height="160" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="400" cy="380" r="120" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="320" cy="420" r="70" fill="none" stroke="#111" stroke-width="6"/>
<circle cx="480" cy="420" r="70" fill="none" stroke="#111" stroke-width="6"/>`,
  },
  {
    id: "svg-balloon",
    title: "Party Balloon",
    emoji: "🎈",
    category: "adventure",
    body: `<ellipse cx="400" cy="320" rx="90" ry="120" fill="none" stroke="#111" stroke-width="8"/>
<path d="M400 440 Q420 500 400 560 Q380 500 400 440" fill="none" stroke="#111" stroke-width="6"/>
<line x1="400" y1="560" x2="400" y2="680" stroke="#111" stroke-width="4"/>`,
  },
  {
    id: "svg-star",
    title: "Twinkle Star",
    emoji: "⭐",
    category: "fantasy",
    body: `<path d="M400 180 L445 320 L600 320 L475 410 L520 560 L400 470 L280 560 L325 410 L200 320 L355 320 Z" fill="none" stroke="#111" stroke-width="8"/>`,
  },
  {
    id: "svg-heart",
    title: "Big Heart",
    emoji: "❤️",
    category: "treats",
    body: `<path d="M400 560 C260 440 220 320 300 250 C360 200 400 260 400 260 C400 260 440 200 500 250 C580 320 540 440 400 560 Z" fill="none" stroke="#111" stroke-width="8"/>`,
  },
  {
    id: "svg-butterfly",
    title: "Butterfly",
    emoji: "🦋",
    category: "animals",
    body: `<ellipse cx="300" cy="360" rx="90" ry="120" fill="none" stroke="#111" stroke-width="7"/>
<ellipse cx="500" cy="360" rx="90" ry="120" fill="none" stroke="#111" stroke-width="7"/>
<ellipse cx="300" cy="520" rx="70" ry="90" fill="none" stroke="#111" stroke-width="7"/>
<ellipse cx="500" cy="520" rx="70" ry="90" fill="none" stroke="#111" stroke-width="7"/>
<line x1="400" y1="280" x2="400" y2="620" stroke="#111" stroke-width="8"/>
<circle cx="400" cy="260" r="22" fill="none" stroke="#111" stroke-width="6"/>`,
  },
  {
    id: "svg-boat",
    title: "Sail Boat",
    emoji: "⛵",
    category: "vehicles",
    body: `<path d="M220 520 L580 520 L520 600 L280 600 Z" fill="none" stroke="#111" stroke-width="8"/>
<path d="M400 520 L400 260 L560 520 Z" fill="none" stroke="#111" stroke-width="8"/>
<line x1="200" y1="640" x2="600" y2="640" stroke="#111" stroke-width="6"/>`,
  },
  {
    id: "svg-icecream",
    title: "Ice Cream Cone",
    emoji: "🍦",
    category: "treats",
    body: `<path d="M320 420 L400 680 L480 420 Z" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="360" cy="360" r="70" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="440" cy="360" r="70" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="400" cy="300" r="70" fill="none" stroke="#111" stroke-width="8"/>`,
  },
  {
    id: "svg-duck",
    title: "Pond Duck",
    emoji: "🦆",
    category: "animals",
    body: `<ellipse cx="420" cy="460" rx="140" ry="80" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="300" cy="380" r="55" fill="none" stroke="#111" stroke-width="8"/>
<path d="M250 380 L180 400 L250 420 Z" fill="none" stroke="#111" stroke-width="7"/>
<ellipse cx="500" cy="420" rx="40" ry="20" fill="none" stroke="#111" stroke-width="6"/>`,
  },
  {
    id: "svg-robot",
    title: "Friendly Robot",
    emoji: "🤖",
    category: "adventure",
    body: `<rect x="280" y="260" width="240" height="180" rx="20" fill="none" stroke="#111" stroke-width="8"/>
<rect x="320" y="460" width="160" height="140" rx="12" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="340" cy="340" r="22" fill="none" stroke="#111" stroke-width="6"/>
<circle cx="460" cy="340" r="22" fill="none" stroke="#111" stroke-width="6"/>
<rect x="360" y="390" width="80" height="24" fill="none" stroke="#111" stroke-width="6"/>
<line x1="280" y1="320" x2="220" y2="400" stroke="#111" stroke-width="8"/>
<line x1="520" y1="320" x2="580" y2="400" stroke="#111" stroke-width="8"/>`,
  },
];

for (const sheet of sheets) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#ffffff"/>
  ${sheet.body}
</svg>
`;
  writeFileSync(resolve(dir, `${sheet.id}.svg`), svg);
}

console.log(`Wrote ${sheets.length} SVG colouring sheets`);
