import { type GroceryShape, type TrolleyShelfItem } from "@/utils/trolleyCatalog";

/** Kids start with 10 free coins, and can buy more coins using their stars! */
export const INITIAL_COIN_BUDGET = 10;
export const STARS_PER_TEN_RATE = 10;
export const COINS_PER_TEN_STARS = 3;
export const STARS_PER_TOY = 5;
export const COINS_PER_FIVE_STARS = 2;
export const COIN_TRAY_SIZE = 6;

export type CoinPack = {
  id: string;
  coins: number;
  starsCost: number;
  title: string;
};

/**
 * Exact Star-to-Coin packs requested:
 * - 3 coins from 10 stars
 * - 10 coins from 25 stars
 * - 20 coins from 45 stars
 * - 50 coins from 87 stars
 */
export const COIN_PACKS: CoinPack[] = [
  { id: "pack-3", coins: 3, starsCost: 10, title: "Mini Pack" },
  { id: "pack-10", coins: 10, starsCost: 25, title: "Smart Pack" },
  { id: "pack-20", coins: 20, starsCost: 45, title: "Super Pack" },
  { id: "pack-50", coins: 50, starsCost: 87, title: "Mega Mart Pack" },
];

const WALLET_STORAGE_PREFIX = "kids_coin_shop_wallet_v2_";

export function readCoinWallet(childId: string | null | undefined): number {
  const key = `${WALLET_STORAGE_PREFIX}${childId || "guest"}`;
  if (typeof window === "undefined") return INITIAL_COIN_BUDGET;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      window.localStorage.setItem(key, String(INITIAL_COIN_BUDGET));
      return INITIAL_COIN_BUDGET;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : INITIAL_COIN_BUDGET;
  } catch {
    return INITIAL_COIN_BUDGET;
  }
}

export function writeCoinWallet(childId: string | null | undefined, coins: number): number {
  const key = `${WALLET_STORAGE_PREFIX}${childId || "guest"}`;
  const safe = Math.max(0, Math.floor(coins));
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, String(safe));
    } catch {
      // ignore storage quota errors
    }
  }
  return safe;
}

/** 30 continuous rows (bays), 4 featured items per row (Left/Right × Lower/Upper shelf) = 120 shelf items. */
export const SHOP_ROWS = 30;
export const TOYS_PER_ROW = 4;
export const ROW_SPAN = 3.4;
/** Every 4 rows, the shopper reaches a Cross-Aisle Junction with optional Left Path or Right Path. */
export const CROSSROADS_INTERVAL = 4;
export const CROSSROADS_GAP = 2.6;
export const PATH_SHIFT_X = 3.4;

/** Legacy aliases preserved for compatibility */
export const SHOP_BAYS = SHOP_ROWS;
export const TOYS_PER_BAY = TOYS_PER_ROW;

export type MartPathChoice = "left" | "right";

export function coinsFromStars(stars: number): number {
  return Math.floor(Math.max(0, stars) / STARS_PER_TEN_RATE) * COINS_PER_TEN_STARS;
}

/** 60 Unique shelf toys across 30 supermarket rows. */
export type PremiumToyKind =
  | "teddy"
  | "doll"
  | "unicorn"
  | "dino"
  | "bunny"
  | "panda"
  | "puppy"
  | "kitty"
  | "race-car"
  | "train"
  | "firetruck"
  | "schoolbus"
  | "helicopter"
  | "airplane"
  | "tractor"
  | "scooter"
  | "robot"
  | "rocket"
  | "camera"
  | "ufo"
  | "astronaut"
  | "laptop"
  | "walkie"
  | "telescope"
  | "drum"
  | "paint-set"
  | "xylophone"
  | "guitar"
  | "piano"
  | "trumpet"
  | "crayons"
  | "easel"
  | "soccer-ball"
  | "kite"
  | "yacht"
  | "basketball"
  | "skateboard"
  | "tricycle"
  | "bowling"
  | "bucket"
  | "storybook"
  | "blocks"
  | "castle"
  | "rings"
  | "shapesorter"
  | "globe"
  | "abacus"
  | "magnifying"
  | "teapot"
  | "mixer"
  | "cupcake-stand"
  | "icecream-cart"
  | "cashregister"
  | "shoppingbasket"
  | "popcorn-maker"
  | "juice-blender"
  | "ferriswheel"
  | "carousel"
  | "treasurechest"
  | "crown";

export type ShopToy = {
  id: string;
  name: string;
  word: string;
  kind: PremiumToyKind;
  /** Closest grocery shape so the shared cart rig can show a mini version. */
  shape: GroceryShape;
  color: string;
  accent: string;
  price: number;
  /** Row index 0..29 (30 rows total) */
  section: number;
  /** 0 = left shelf, 1 = right shelf */
  slot: number;
  department: string;
};

export const MART_DEPARTMENTS: { title: string; subtitle: string; color: string; accent: string }[] = [
  { title: "PLUSH & CUDDLE PETS", subtitle: "Rows 1–4 · Soft Stuffed Friends", color: "#ec4899", accent: "#fce7f3" },
  { title: "SPEED & WHEELS GARAGE", subtitle: "Rows 5–8 · Cars, Trains & Jets", color: "#ef4444", accent: "#fee2e2" },
  { title: "SPACE & ROBOT TECH", subtitle: "Rows 9–12 · Rockets & Gadgets", color: "#2563eb", accent: "#dbeafe" },
  { title: "LITTLE CHEF KITCHEN MART", subtitle: "Rows 13–16 · Tea Sets & Treats", color: "#0891b2", accent: "#cffafe" },
  { title: "SPORTS & OUTDOOR ARENA", subtitle: "Rows 17–20 · Balls, Bikes & Boats", color: "#16a34a", accent: "#dcfce7" },
  { title: "BUILDERS & BRAIN PUZZLES", subtitle: "Rows 21–24 · Blocks, Books & Globes", color: "#7c3aed", accent: "#ede9fe" },
  { title: "MUSIC & ART STUDIO", subtitle: "Rows 25–28 · Instruments & Paint", color: "#d97706", accent: "#fef3c7" },
  { title: "GRAND TREASURE SHOWCASE", subtitle: "Rows 29–30 · Royal Prizes", color: "#b45309", accent: "#fef08a" },
];

const UNIQUE_TOYS: Omit<ShopToy, "section" | "slot" | "department">[] = [
  // Block 0 (Rows 1–4): Plush & Cuddle Pets
  { id: "toy-teddy", name: "Teddy Bear", word: "teddy", kind: "teddy", shape: "bag", color: "#c47a3a", accent: "#fde68a", price: 3 },
  { id: "toy-doll", name: "Princess Doll", word: "doll", kind: "doll", shape: "cone", color: "#f472b6", accent: "#db2777", price: 4 },
  { id: "toy-unicorn", name: "Magic Unicorn", word: "unicorn", kind: "unicorn", shape: "egg", color: "#fdf4ff", accent: "#a855f7", price: 4 },
  { id: "toy-dino", name: "Dino Friend", word: "dino", kind: "dino", shape: "leaf", color: "#4ade80", accent: "#15803d", price: 2 },
  { id: "toy-bunny", name: "Fluffy Bunny", word: "bunny", kind: "bunny", shape: "egg", color: "#fff1f2", accent: "#fb7185", price: 2 },
  { id: "toy-panda", name: "Cuddle Panda", word: "panda", kind: "panda", shape: "bag", color: "#f8fafc", accent: "#1e293b", price: 3 },
  { id: "toy-puppy", name: "Golden Puppy", word: "puppy", kind: "puppy", shape: "bag", color: "#fbbf24", accent: "#92400e", price: 3 },
  { id: "toy-kitty", name: "Purr Kitty", word: "kitty", kind: "kitty", shape: "egg", color: "#fed7aa", accent: "#ea580c", price: 2 },

  // Block 1 (Rows 5–8): Speed & Wheels Garage
  { id: "toy-car", name: "Race Car", word: "car", kind: "race-car", shape: "box", color: "#ef4444", accent: "#1e293b", price: 2 },
  { id: "toy-train", name: "Express Train", word: "train", kind: "train", shape: "cylinder", color: "#2563eb", accent: "#fbbf24", price: 3 },
  { id: "toy-firetruck", name: "Fire Truck", word: "firetruck", kind: "firetruck", shape: "box", color: "#dc2626", accent: "#facc15", price: 4 },
  { id: "toy-schoolbus", name: "School Bus", word: "bus", kind: "schoolbus", shape: "loaf", color: "#facc15", accent: "#1e293b", price: 3 },
  { id: "toy-helicopter", name: "Rescue Chopper", word: "helicopter", kind: "helicopter", shape: "cone", color: "#0284c7", accent: "#38bdf8", price: 4 },
  { id: "toy-airplane", name: "Sky Jet Plane", word: "airplane", kind: "airplane", shape: "cone", color: "#f8fafc", accent: "#ef4444", price: 3 },
  { id: "toy-tractor", name: "Farm Tractor", word: "tractor", kind: "tractor", shape: "box", color: "#16a34a", accent: "#facc15", price: 2 },
  { id: "toy-scooter", name: "Kick Scooter", word: "scooter", kind: "scooter", shape: "cylinder", color: "#ec4899", accent: "#38bdf8", price: 3 },

  // Block 2 (Rows 9–12): Space & Robot Tech
  { id: "toy-robot", name: "Buddy Robot", word: "robot", kind: "robot", shape: "can", color: "#94a3b8", accent: "#38bdf8", price: 3 },
  { id: "toy-rocket", name: "Space Rocket", word: "rocket", kind: "rocket", shape: "cone", color: "#e2e8f0", accent: "#f97316", price: 3 },
  { id: "toy-camera", name: "Kids Camera", word: "camera", kind: "camera", shape: "box", color: "#38bdf8", accent: "#facc15", price: 3 },
  { id: "toy-ufo", name: "Galaxy Saucer", word: "saucer", kind: "ufo", shape: "donut", color: "#a855f7", accent: "#22d3ee", price: 4 },
  { id: "toy-astronaut", name: "Space Ranger", word: "astronaut", kind: "astronaut", shape: "can", color: "#f8fafc", accent: "#2563eb", price: 4 },
  { id: "toy-laptop", name: "Kids Laptop", word: "laptop", kind: "laptop", shape: "box", color: "#6366f1", accent: "#38bdf8", price: 3 },
  { id: "toy-walkie", name: "Walkie Talkie", word: "radio", kind: "walkie", shape: "bottle", color: "#eab308", accent: "#1e293b", price: 2 },
  { id: "toy-telescope", name: "Star Telescope", word: "telescope", kind: "telescope", shape: "cylinder", color: "#1d4ed8", accent: "#fbbf24", price: 3 },

  // Block 3 (Rows 13–16): Music & Art Studio
  { id: "toy-drum", name: "Toy Drum", word: "drum", kind: "drum", shape: "can", color: "#f59e0b", accent: "#dc2626", price: 2 },
  { id: "toy-paint", name: "Paint Set", word: "paint", kind: "paint-set", shape: "box", color: "#fef3c7", accent: "#22c55e", price: 2 },
  { id: "toy-xylophone", name: "Xylophone", word: "xylophone", kind: "xylophone", shape: "box", color: "#f97316", accent: "#38bdf8", price: 3 },
  { id: "toy-guitar", name: "Star Guitar", word: "guitar", kind: "guitar", shape: "bottle", color: "#d97706", accent: "#78350f", price: 4 },
  { id: "toy-piano", name: "Mini Piano", word: "piano", kind: "piano", shape: "box", color: "#ec4899", accent: "#f8fafc", price: 4 },
  { id: "toy-trumpet", name: "Gold Trumpet", word: "trumpet", kind: "trumpet", shape: "cone", color: "#facc15", accent: "#b45309", price: 2 },
  { id: "toy-crayons", name: "Crayon Box", word: "crayons", kind: "crayons", shape: "box", color: "#ef4444", accent: "#facc15", price: 1 },
  { id: "toy-easel", name: "Art Easel", word: "easel", kind: "easel", shape: "box", color: "#a855f7", accent: "#fde047", price: 3 },

  // Block 4 (Rows 17–20): Sports & Outdoor Arena
  { id: "toy-ball", name: "Soccer Ball", word: "ball", kind: "soccer-ball", shape: "apple", color: "#f8fafc", accent: "#0f172a", price: 1 },
  { id: "toy-kite", name: "Rainbow Kite", word: "kite", kind: "kite", shape: "leaf", color: "#38bdf8", accent: "#f43f5e", price: 1 },
  { id: "toy-yacht", name: "Toy Boat", word: "boat", kind: "yacht", shape: "loaf", color: "#0ea5e9", accent: "#ffffff", price: 2 },
  { id: "toy-basketball", name: "Basketball", word: "basketball", kind: "basketball", shape: "apple", color: "#f97316", accent: "#1e293b", price: 2 },
  { id: "toy-skateboard", name: "Skateboard", word: "skateboard", kind: "skateboard", shape: "loaf", color: "#10b981", accent: "#f43f5e", price: 3 },
  { id: "toy-tricycle", name: "Red Tricycle", word: "tricycle", kind: "tricycle", shape: "box", color: "#ef4444", accent: "#facc15", price: 4 },
  { id: "toy-bowling", name: "Bowling Set", word: "bowling", kind: "bowling", shape: "bottle", color: "#f8fafc", accent: "#ef4444", price: 2 },
  { id: "toy-bucket", name: "Sand Bucket", word: "bucket", kind: "bucket", shape: "can", color: "#facc15", accent: "#38bdf8", price: 1 },

  // Block 5 (Rows 21–24): Builders & Brain Puzzles
  { id: "toy-book", name: "Story Book", word: "book", kind: "storybook", shape: "box", color: "#3b82f6", accent: "#fbbf24", price: 2 },
  { id: "toy-blocks", name: "ABC Blocks", word: "blocks", kind: "blocks", shape: "box", color: "#f87171", accent: "#60a5fa", price: 2 },
  { id: "toy-castle", name: "Block Castle", word: "castle", kind: "castle", shape: "box", color: "#a855f7", accent: "#f472b6", price: 4 },
  { id: "toy-rings", name: "Stacking Rings", word: "rings", kind: "rings", shape: "cone", color: "#22c55e", accent: "#f59e0b", price: 2 },
  { id: "toy-shapesorter", name: "Shape Sorter", word: "shapes", kind: "shapesorter", shape: "box", color: "#38bdf8", accent: "#ef4444", price: 3 },
  { id: "toy-globe", name: "World Globe", word: "globe", kind: "globe", shape: "apple", color: "#0ea5e9", accent: "#22c55e", price: 3 },
  { id: "toy-abacus", name: "Bead Abacus", word: "abacus", kind: "abacus", shape: "box", color: "#f59e0b", accent: "#ef4444", price: 2 },
  { id: "toy-magnifying", name: "Magnifier", word: "magnifier", kind: "magnifying", shape: "apple", color: "#14b8a6", accent: "#fde047", price: 1 },

  // Block 6 (Rows 25–28): Little Chef Kitchen Mart
  { id: "toy-teapot", name: "Tea Party Set", word: "teapot", kind: "teapot", shape: "apple", color: "#f472b6", accent: "#fef08a", price: 3 },
  { id: "toy-mixer", name: "Cake Mixer", word: "mixer", kind: "mixer", shape: "can", color: "#38bdf8", accent: "#f8fafc", price: 3 },
  { id: "toy-cupcake-stand", name: "Cupcake Tower", word: "cupcake", kind: "cupcake-stand", shape: "cone", color: "#fb7185", accent: "#fde68a", price: 2 },
  { id: "toy-icecream-cart", name: "Ice Cream Cart", word: "icecream", kind: "icecream-cart", shape: "box", color: "#f9a8d4", accent: "#38bdf8", price: 4 },
  { id: "toy-cashregister", name: "Cash Register", word: "register", kind: "cashregister", shape: "box", color: "#ef4444", accent: "#fde047", price: 3 },
  { id: "toy-shoppingbasket", name: "Fruit Basket", word: "basket", kind: "shoppingbasket", shape: "bag", color: "#22c55e", accent: "#f97316", price: 2 },
  { id: "toy-popcorn-maker", name: "Popcorn Maker", word: "popcorn", kind: "popcorn-maker", shape: "can", color: "#dc2626", accent: "#fef08a", price: 3 },
  { id: "toy-juice-blender", name: "Juice Blender", word: "blender", kind: "juice-blender", shape: "bottle", color: "#10b981", accent: "#fb923c", price: 2 },

  // Block 7 (Rows 29–30): Grand Treasure Showcase
  { id: "toy-ferriswheel", name: "Ferris Wheel", word: "wheel", kind: "ferriswheel", shape: "donut", color: "#ec4899", accent: "#facc15", price: 4 },
  { id: "toy-carousel", name: "Royal Carousel", word: "carousel", kind: "carousel", shape: "cone", color: "#8b5cf6", accent: "#fde047", price: 4 },
  { id: "toy-treasurechest", name: "Treasure Chest", word: "treasure", kind: "treasurechest", shape: "box", color: "#92400e", accent: "#facc15", price: 3 },
  { id: "toy-crown", name: "Golden Crown", word: "crown", kind: "crown", shape: "donut", color: "#facc15", accent: "#ef4444", price: 4 },
];

const EDITION_SUFFIXES = [
  { prefix: "Royal", colorShift: "#f59e0b", priceDelta: 1 },
  { prefix: "Deluxe", colorShift: "#38bdf8", priceDelta: 0 },
];

export function buildCoinAisle(): ShopToy[] {
  const totalSlots = SHOP_ROWS * TOYS_PER_ROW; // 30 rows * 4 slots (Left/Right x Lower/Upper) = 120 shelf items
  const items: ShopToy[] = [];
  for (let index = 0; index < totalSlots; index++) {
    const base = UNIQUE_TOYS[index % UNIQUE_TOYS.length];
    const cycle = Math.floor(index / UNIQUE_TOYS.length);
    const section = Math.floor(index / TOYS_PER_ROW);
    const slot = index % TOYS_PER_ROW;
    const blockIdx = Math.min(
      MART_DEPARTMENTS.length - 1,
      Math.floor(section / CROSSROADS_INTERVAL),
    );
    if (cycle === 0) {
      items.push({
        ...base,
        section,
        slot,
        department: MART_DEPARTMENTS[blockIdx].title,
      });
    } else {
      const edition = EDITION_SUFFIXES[(cycle - 1) % EDITION_SUFFIXES.length];
      items.push({
        ...base,
        id: `${base.id}-r${section + 1}-s${slot + 1}`,
        name: `${edition.prefix} ${base.name}`,
        accent: edition.colorShift,
        price: Math.min(5, Math.max(1, base.price + (index % 2 === 0 ? edition.priceDelta : 0))),
        section,
        slot,
        department: MART_DEPARTMENTS[blockIdx].title,
      });
    }
  }
  return items;
}

export const SHOP_TOYS = buildCoinAisle();

/**
 * Z coordinate for a given row index (0..29).
 * Includes a wide cross-aisle corridor gap after every 4 rows (rows 3, 7, 11, 15, 19, 23, 27).
 */
export function rowZ(rowIndex: number): number {
  const block = Math.floor(rowIndex / CROSSROADS_INTERVAL);
  return -2.4 - rowIndex * ROW_SPAN - block * CROSSROADS_GAP;
}

/**
 * Z coordinate of the crossroads junction immediately after block `blockIndex` (0..6).
 * Block 0 ends after row 3; junction 0 sits between row 3 and row 4.
 */
export function junctionZ(blockIndex: number): number {
  const lastRowInBlock = (blockIndex + 1) * CROSSROADS_INTERVAL - 1;
  const firstRowNextBlock = lastRowInBlock + 1;
  return (rowZ(lastRowInBlock) + rowZ(firstRowNextBlock)) / 2;
}

/** Total number of crossroads junctions along the 30 rows (after rows 4, 8, 12, 16, 20, 24, 28). */
export const JUNCTION_COUNT = Math.floor((SHOP_ROWS - 1) / CROSSROADS_INTERVAL);

/**
 * Compute the X center of the aisle for a given block (0..7) based on the player's Left/Right path choices at junctions.
 */
export function blockAisleX(blockIndex: number, pathChoices: Record<number, MartPathChoice>): number {
  let x = 0;
  for (let j = 0; j < blockIndex; j++) {
    const choice = pathChoices[j];
    if (choice === "left") {
      x = Math.max(-PATH_SHIFT_X, x - PATH_SHIFT_X);
      if (x === 0) x = -PATH_SHIFT_X;
    } else if (choice === "right") {
      x = Math.min(PATH_SHIFT_X, x + PATH_SHIFT_X);
      if (x === 0) x = PATH_SHIFT_X;
    }
  }
  return x;
}

export function toyPosition(
  toy: ShopToy,
  pathChoices: Record<number, MartPathChoice> = {},
): [number, number, number] {
  // slot 0 = Left Lower, slot 1 = Right Lower, slot 2 = Left Upper, slot 3 = Right Upper
  const side = toy.slot % 2 === 0 ? -1 : 1;
  const tier = Math.floor(toy.slot / 2); // 0 = lower plank (y=0.58), 1 = upper plank (y=1.48)
  const block = Math.floor(toy.section / CROSSROADS_INTERVAL);
  const centerX = blockAisleX(block, pathChoices);
  const x = centerX + side * 1.72;
  const y = tier === 0 ? 0.58 : 1.48;
  const z = rowZ(toy.section) + (tier === 0 ? 0.48 : -0.48);
  return [x, y, z];
}

export function shopGateZ(): number {
  return rowZ(SHOP_ROWS - 1) - 2.4;
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
  return `${toy.name} is ${toy.price} ${coins}! Drop ${toy.price} gold ${coins} to buy it!`;
}
