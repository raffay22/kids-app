import { AISLE_SPAN, type GroceryShape, type TrolleyShelfItem } from "@/utils/trolleyCatalog";

/**
 * BACKUP of original utils/coinShop.ts before 30-row Amazon Mart & Real 3D Human upgrade.
 */
export const STARS_PER_TOY = 5;
export const COINS_PER_FIVE_STARS = 2;
export const COIN_TRAY_SIZE = 6;
export const SHOP_BAYS = 4;
export const TOYS_PER_BAY = 4;

export function coinsFromStars(stars: number): number {
  return Math.floor(Math.max(0, stars) / STARS_PER_TOY) * COINS_PER_FIVE_STARS;
}

export type PremiumToyKind =
  | "teddy"
  | "doll"
  | "race-car"
  | "soccer-ball"
  | "robot"
  | "storybook"
  | "rocket"
  | "unicorn"
  | "dino"
  | "drum"
  | "paint-set"
  | "kite"
  | "train"
  | "blocks"
  | "yacht"
  | "camera";

export type ShopToy = {
  id: string;
  name: string;
  word: string;
  kind: PremiumToyKind;
  shape: GroceryShape;
  color: string;
  accent: string;
  price: number;
  section: number;
  slot: number;
};

const UNIQUE_TOYS: Omit<ShopToy, "section" | "slot">[] = [
  { id: "toy-teddy", name: "Teddy Bear", word: "teddy", kind: "teddy", shape: "bag", color: "#c47a3a", accent: "#8b4513", price: 3 },
  { id: "toy-doll", name: "Princess Doll", word: "doll", kind: "doll", shape: "cone", color: "#f9a8d4", accent: "#db2777", price: 4 },
  { id: "toy-car", name: "Race Car", word: "car", kind: "race-car", shape: "box", color: "#ef4444", accent: "#1e293b", price: 2 },
  { id: "toy-ball", name: "Soccer Ball", word: "ball", kind: "soccer-ball", shape: "apple", color: "#f8fafc", accent: "#0f172a", price: 1 },
  { id: "toy-robot", name: "Buddy Robot", word: "robot", kind: "robot", shape: "can", color: "#94a3b8", accent: "#38bdf8", price: 3 },
  { id: "toy-book", name: "Story Book", word: "book", kind: "storybook", shape: "box", color: "#3b82f6", accent: "#fbbf24", price: 2 },
  { id: "toy-rocket", name: "Space Rocket", word: "rocket", kind: "rocket", shape: "cone", color: "#e2e8f0", accent: "#f97316", price: 3 },
  { id: "toy-unicorn", name: "Unicorn", word: "unicorn", kind: "unicorn", shape: "egg", color: "#f5d0fe", accent: "#a855f7", price: 4 },
  { id: "toy-dino", name: "Dino Friend", word: "dino", kind: "dino", shape: "leaf", color: "#4ade80", accent: "#166534", price: 2 },
  { id: "toy-drum", name: "Toy Drum", word: "drum", kind: "drum", shape: "can", color: "#f59e0b", accent: "#b45309", price: 2 },
  { id: "toy-paint", name: "Paint Set", word: "paint", kind: "paint-set", shape: "box", color: "#fef3c7", accent: "#22c55e", price: 2 },
  { id: "toy-kite", name: "Rainbow Kite", word: "kite", kind: "kite", shape: "leaf", color: "#38bdf8", accent: "#f43f5e", price: 1 },
  { id: "toy-train", name: "Toy Train", word: "train", kind: "train", shape: "cylinder", color: "#2563eb", accent: "#fbbf24", price: 3 },
  { id: "toy-blocks", name: "ABC Blocks", word: "blocks", kind: "blocks", shape: "box", color: "#f87171", accent: "#60a5fa", price: 2 },
  { id: "toy-yacht", name: "Toy Boat", word: "boat", kind: "yacht", shape: "loaf", color: "#38bdf8", accent: "#ffffff", price: 2 },
  { id: "toy-camera", name: "Toy Camera", word: "camera", kind: "camera", shape: "box", color: "#e2e8f0", accent: "#0ea5e9", price: 3 },
];

export function buildCoinAisle(): ShopToy[] {
  const count = Math.min(UNIQUE_TOYS.length, SHOP_BAYS * TOYS_PER_BAY);
  return UNIQUE_TOYS.slice(0, count).map((toy, index) => ({
    ...toy,
    section: Math.floor(index / TOYS_PER_BAY),
    slot: index % TOYS_PER_BAY,
  }));
}

export const SHOP_TOYS = buildCoinAisle();

export function toyPosition(toy: ShopToy): [number, number, number] {
  const side = toy.slot % 2 === 0 ? -1 : 1;
  const row = Math.floor(toy.slot / 2);
  const x = side * 1.72;
  const y = row === 0 ? 0.58 : 1.48;
  const z = -1.4 - toy.section * AISLE_SPAN - row * 1.35;
  return [x, y, z];
}

export function shopGateZ(): number {
  return -AISLE_SPAN * SHOP_BAYS - 1.2;
}

export function toyAsShelfItem(toy: ShopToy): TrolleyShelfItem {
  return {
    id: toy.id,
    word: toy.word,
    letter: toy.word.slice(0, 1).toUpperCase(),
    isTarget: true,
    shape: toy.shape,
    color: toy.color,
  };
}

export function coinPrompt(toy: ShopToy): string {
  const coins = toy.price === 1 ? "coin" : "coins";
  return `This ${toy.name} costs ${toy.price} ${coins}! Can you drop ${toy.price} gold coins into the Saving Bank?`;
}
