import {
  AISLE_SPAN,
  ITEMS_PER_ROW,
  TROLLEY_LETTERS,
  buildShelfRow,
  shelfSlot,
  type GroceryShape,
  type TrolleyShelfItem,
} from "@/utils/trolleyCatalog";

/** One finished purchase awards 5 stars, and 5 stars convert to 2 coins. */
export const STARS_PER_TOY = 5;
export const COINS_PER_FIVE_STARS = 2;
export const COIN_TRAY_SIZE = 6;
export const SHOP_BAYS = 4;

export function coinsFromStars(stars: number): number {
  return Math.floor(Math.max(0, stars) / STARS_PER_TOY) * COINS_PER_FIVE_STARS;
}

export type ShopToy = {
  id: string;
  name: string;
  word: string;
  shape: GroceryShape;
  color: string;
  price: number;
  section: number;
  slot: number;
};

function coinPrice(word: string): number {
  let hash = 0;
  for (let i = 0; i < word.length; i++) hash = (hash + word.charCodeAt(i) * 17) % 4;
  return hash + 1;
}

function mixItems<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  for (let i = arr.length - 1; i > 0; i--) {
    hash = Math.imul(hash ^ i, 1103515245) + 12345;
    const j = Math.abs(hash) % (i + 1);
    const swap = arr[i];
    arr[i] = arr[j];
    arr[j] = swap;
  }
  return arr;
}

/** Same supermarket foods and toys, mixed along the aisle instead of grouped by letter. */
export function buildCoinAisle(seed = "coin-shop"): ShopToy[] {
  const seen = new Set<string>();
  const pool: TrolleyShelfItem[] = [];
  for (const letter of TROLLEY_LETTERS) {
    for (const item of buildShelfRow(letter, seed)) {
      if (!item.isTarget || seen.has(item.word)) continue;
      if (/pig/i.test(item.word)) continue;
      seen.add(item.word);
      pool.push(item);
    }
  }
  return mixItems(pool, seed)
    .slice(0, SHOP_BAYS * ITEMS_PER_ROW)
    .map((item, index) => ({
      id: item.id,
      name: item.word,
      word: item.word,
      shape: item.shape,
      color: item.color,
      price: coinPrice(item.word),
      section: Math.floor(index / ITEMS_PER_ROW),
      slot: index % ITEMS_PER_ROW,
    }));
}

export const SHOP_TOYS = buildCoinAisle();

export function toyPosition(toy: ShopToy): [number, number, number] {
  return shelfSlot(toy.slot, toy.section);
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
