/**
 * Grocery shelves for the 3D supermarket trolley.
 * Every word is a food a child could put in a cart. Five foods per letter.
 */
export const TROLLEY_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const TARGETS_PER_ROW = 5;
export const DISTRACTORS_PER_ROW = 10;
export const ITEMS_PER_ROW = TARGETS_PER_ROW + DISTRACTORS_PER_ROW;
export const AISLE_SPAN = 8;
export type ShopperChoice = "boy" | "girl";

export type GroceryShape =
  | "apple"
  | "berry"
  | "banana"
  | "carton"
  | "bottle"
  | "can"
  | "box"
  | "loaf"
  | "bag"
  | "cone"
  | "cylinder"
  | "leaf"
  | "egg"
  | "donut"
  | "pizza"
  | "ice";

export type TrolleyShelfItem = {
  id: string;
  word: string;
  letter: string;
  isTarget: boolean;
  shape: GroceryShape;
  color: string;
};

type GroceryFood = {
  word: string;
  shape: GroceryShape;
  color: string;
};

const GROCERIES: Record<string, GroceryFood[]> = {
  A: [
    { word: "Apple", shape: "apple", color: "#ef4444" },
    { word: "Avocado", shape: "apple", color: "#4d7c0f" },
    { word: "Apricot", shape: "apple", color: "#fb923c" },
    { word: "Asparagus", shape: "cylinder", color: "#65a30d" },
    { word: "Almonds", shape: "bag", color: "#d6b48a" },
  ],
  B: [
    { word: "Banana", shape: "banana", color: "#facc15" },
    { word: "Bread", shape: "loaf", color: "#e7c59a" },
    { word: "Butter", shape: "box", color: "#fde68a" },
    { word: "Blueberry", shape: "berry", color: "#3b82f6" },
    { word: "Bagel", shape: "donut", color: "#f3c99b" },
  ],
  C: [
    { word: "Carrot", shape: "cone", color: "#f97316" },
    { word: "Cheese", shape: "box", color: "#fbbf24" },
    { word: "Cereal", shape: "box", color: "#f43f5e" },
    { word: "Cucumber", shape: "cylinder", color: "#16a34a" },
    { word: "Cookie", shape: "cylinder", color: "#d97706" },
  ],
  D: [
    { word: "Donut", shape: "donut", color: "#f9a8d4" },
    { word: "Dates", shape: "bag", color: "#7c2d12" },
    { word: "Drumstick", shape: "ice", color: "#fde68a" },
    { word: "Dill", shape: "leaf", color: "#65a30d" },
    { word: "Dried mango", shape: "bag", color: "#ea580c" },
  ],
  E: [
    { word: "Eggs", shape: "egg", color: "#fef3c7" },
    { word: "Eggplant", shape: "apple", color: "#6d28d9" },
    { word: "Edamame", shape: "bag", color: "#84cc16" },
    { word: "Eclair", shape: "cylinder", color: "#fcd34d" },
    { word: "Endive", shape: "leaf", color: "#86efac" },
  ],
  F: [
    { word: "Fish", shape: "box", color: "#fb7185" },
    { word: "Flour", shape: "bag", color: "#f8fafc" },
    { word: "Fries", shape: "box", color: "#f59e0b" },
    { word: "Fig", shape: "apple", color: "#7f1d1d" },
    { word: "Frozen peas", shape: "bag", color: "#22c55e" },
  ],
  G: [
    { word: "Grapes", shape: "berry", color: "#7c3aed" },
    { word: "Garlic", shape: "apple", color: "#f5f5f4" },
    { word: "Ginger", shape: "cylinder", color: "#d97706" },
    { word: "Granola", shape: "bag", color: "#b45309" },
    { word: "Green beans", shape: "cylinder", color: "#15803d" },
  ],
  H: [
    { word: "Honey", shape: "bottle", color: "#f59e0b" },
    { word: "Ham", shape: "box", color: "#fda4af" },
    { word: "Hot dog", shape: "cylinder", color: "#ef4444" },
    { word: "Hummus", shape: "cylinder", color: "#eab308" },
    { word: "Hash brown", shape: "box", color: "#ca8a04" },
  ],
  I: [
    { word: "Ice cream", shape: "ice", color: "#fbcfe8" },
    { word: "Icing", shape: "bag", color: "#f9a8d4" },
    { word: "Iced tea", shape: "bottle", color: "#65a30d" },
    { word: "Italian soda", shape: "bottle", color: "#ef4444" },
    { word: "Instant rice", shape: "box", color: "#f8fafc" },
  ],
  J: [
    { word: "Juice", shape: "bottle", color: "#fb923c" },
    { word: "Jam", shape: "bottle", color: "#be123c" },
    { word: "Jelly", shape: "bottle", color: "#e11d48" },
    { word: "Jerky", shape: "bag", color: "#9a3412" },
    { word: "Jello", shape: "box", color: "#f472b6" },
  ],
  K: [
    { word: "Kiwi", shape: "apple", color: "#84cc16" },
    { word: "Ketchup", shape: "bottle", color: "#dc2626" },
    { word: "Kale", shape: "leaf", color: "#166534" },
    { word: "Kettle corn", shape: "bag", color: "#facc15" },
    { word: "Kumquat", shape: "apple", color: "#f97316" },
  ],
  L: [
    { word: "Lemon", shape: "apple", color: "#facc15" },
    { word: "Lettuce", shape: "leaf", color: "#4ade80" },
    { word: "Lime", shape: "apple", color: "#84cc16" },
    { word: "Lasagna", shape: "box", color: "#b45309" },
    { word: "Lollipop", shape: "apple", color: "#ec4899" },
  ],
  M: [
    { word: "Milk", shape: "carton", color: "#f8fafc" },
    { word: "Mango", shape: "apple", color: "#f59e0b" },
    { word: "Muffin", shape: "cylinder", color: "#d97706" },
    { word: "Mushroom", shape: "apple", color: "#e7e5e4" },
    { word: "Macaroni", shape: "box", color: "#fbbf24" },
  ],
  N: [
    { word: "Noodles", shape: "box", color: "#f59e0b" },
    { word: "Nuts", shape: "bag", color: "#a16207" },
    { word: "Nectarine", shape: "apple", color: "#fb7185" },
    { word: "Nachos", shape: "bag", color: "#f97316" },
    { word: "Naan", shape: "loaf", color: "#f5deb3" },
  ],
  O: [
    { word: "Orange", shape: "apple", color: "#f97316" },
    { word: "Oats", shape: "cylinder", color: "#e7d3a1" },
    { word: "Onion", shape: "apple", color: "#f5e6c8" },
    { word: "Olive oil", shape: "bottle", color: "#84cc16" },
    { word: "Oatmeal", shape: "cylinder", color: "#d6d3d1" },
  ],
  P: [
    { word: "Pizza", shape: "pizza", color: "#ef4444" },
    { word: "Pasta", shape: "box", color: "#f59e0b" },
    { word: "Peach", shape: "apple", color: "#fdba74" },
    { word: "Pear", shape: "apple", color: "#bef264" },
    { word: "Popcorn", shape: "bag", color: "#fef3c7" },
  ],
  Q: [
    { word: "Quinoa", shape: "bag", color: "#d6d3d1" },
    { word: "Quesadilla", shape: "cylinder", color: "#fbbf24" },
    { word: "Quiche", shape: "cylinder", color: "#fde68a" },
    { word: "Queso", shape: "bottle", color: "#f59e0b" },
    { word: "Quick oats", shape: "cylinder", color: "#e7e5e4" },
  ],
  R: [
    { word: "Rice", shape: "bag", color: "#f8fafc" },
    { word: "Raisins", shape: "bag", color: "#7c2d12" },
    { word: "Raspberry", shape: "berry", color: "#e11d48" },
    { word: "Rolls", shape: "loaf", color: "#f3d5b0" },
    { word: "Ravioli", shape: "box", color: "#fbbf24" },
  ],
  S: [
    { word: "Soup", shape: "can", color: "#ef4444" },
    { word: "Strawberry", shape: "berry", color: "#f43f5e" },
    { word: "Soda", shape: "can", color: "#22c55e" },
    { word: "Spinach", shape: "leaf", color: "#15803d" },
    { word: "Sandwich", shape: "box", color: "#eab308" },
  ],
  T: [
    { word: "Tomato", shape: "apple", color: "#ef4444" },
    { word: "Tea", shape: "box", color: "#166534" },
    { word: "Tortilla", shape: "cylinder", color: "#f5deb3" },
    { word: "Turkey", shape: "box", color: "#d6a07a" },
    { word: "Tangerine", shape: "apple", color: "#fb923c" },
  ],
  U: [
    { word: "Udon", shape: "box", color: "#f8fafc" },
    { word: "Ugli fruit", shape: "apple", color: "#84cc16" },
    { word: "Ube", shape: "apple", color: "#7e22ce" },
    { word: "Unagi", shape: "box", color: "#fb7185" },
    { word: "Ube cake", shape: "box", color: "#6b21a8" },
  ],
  V: [
    { word: "Vanilla", shape: "bottle", color: "#f5f5f4" },
    { word: "Vinegar", shape: "bottle", color: "#a3e635" },
    { word: "Veggies", shape: "bag", color: "#22c55e" },
    { word: "Vermicelli", shape: "box", color: "#fef9c3" },
    { word: "Vienna", shape: "cylinder", color: "#fca5a5" },
  ],
  W: [
    { word: "Watermelon", shape: "apple", color: "#16a34a" },
    { word: "Waffle", shape: "box", color: "#d97706" },
    { word: "Water", shape: "bottle", color: "#38bdf8" },
    { word: "Walnut", shape: "apple", color: "#78350f" },
    { word: "Wrap", shape: "cylinder", color: "#86efac" },
  ],
  X: [
    { word: "Xigua", shape: "apple", color: "#ef4444" },
    { word: "XO sauce", shape: "bottle", color: "#7f1d1d" },
    { word: "Ximenia", shape: "apple", color: "#f97316" },
    { word: "Xylitol", shape: "bag", color: "#e0f2fe" },
    { word: "Xoconostle", shape: "apple", color: "#be123c" },
  ],
  Y: [
    { word: "Yogurt", shape: "carton", color: "#fdf2f8" },
    { word: "Yam", shape: "cylinder", color: "#a16207" },
    { word: "Yellow pepper", shape: "apple", color: "#facc15" },
    { word: "Yeast", shape: "bag", color: "#fde68a" },
    { word: "Yolk", shape: "egg", color: "#facc15" },
  ],
  Z: [
    { word: "Zucchini", shape: "cylinder", color: "#65a30d" },
    { word: "Ziti", shape: "box", color: "#f59e0b" },
    { word: "Zest", shape: "bottle", color: "#facc15" },
    { word: "Zwieback", shape: "box", color: "#e7c8a0" },
    { word: "Ziti bake", shape: "box", color: "#ea580c" },
  ],
};

export function getTargetWordsForLetter(letter: string): string[] {
  const key = letter.trim().toUpperCase();
  return (GROCERIES[key] ?? []).map((food) => food.word);
}

function foodsFor(letter: string): GroceryFood[] {
  return GROCERIES[letter.trim().toUpperCase()] ?? [];
}

function seededShuffle<T>(items: T[], seedStr: string): T[] {
  const arr = [...items];
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  for (let i = arr.length - 1; i > 0; i--) {
    hash = Math.imul(hash ^ i, 1103515245) + 12345;
    const j = Math.abs(hash) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Five target groceries plus ten foods from other letters. */
export function buildShelfRow(
  targetLetter: string,
  seedKey = "ride",
): TrolleyShelfItem[] {
  const upper = targetLetter.trim().toUpperCase();
  const targets: TrolleyShelfItem[] = foodsFor(upper)
    .slice(0, TARGETS_PER_ROW)
    .map((food, index) => ({
      id: `target-${upper}-${index}-${food.word.toLowerCase().replace(/\s+/g, "-")}`,
      word: food.word,
      letter: upper,
      isTarget: true,
      shape: food.shape,
      color: food.color,
    }));

  const otherPool: TrolleyShelfItem[] = [];
  for (const letter of TROLLEY_LETTERS) {
    if (letter === upper) continue;
    foodsFor(letter).forEach((food, index) => {
      otherPool.push({
        id: `pool-${letter}-${index}-${food.word.toLowerCase().replace(/\s+/g, "-")}`,
        word: food.word,
        letter,
        isTarget: false,
        shape: food.shape,
        color: food.color,
      });
    });
  }

  const distractors = seededShuffle(otherPool, `${upper}-distractors-${seedKey}`)
    .slice(0, DISTRACTORS_PER_ROW)
    .map((entry, index) => ({
      ...entry,
      id: `dist-${upper}-${index}-${entry.letter}-${entry.word.toLowerCase().replace(/\s+/g, "-")}`,
    }));

  return seededShuffle([...targets, ...distractors], `${upper}-row-${seedKey}`);
}

/** Shelf slot in aisle space. Nine foods on the left, six on the right. */
export function shelfSlot(
  index: number,
  section: number,
): [number, number, number] {
  const onLeft = index < 9;
  const local = onLeft ? index : index - 9;
  const col = local % 3;
  const row = Math.floor(local / 3);
  const side = onLeft ? -1 : 1;
  const x = side * 1.42;
  const y = [0.78, 1.55, 2.3][row] ?? 0.78;
  const z = -1.15 - section * AISLE_SPAN - col * 1.55;
  return [x, y, z];
}
