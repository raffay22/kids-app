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
  | "ice"
  | "cupcake"
  | "chocolate"
  | "teddy"
  | "ball"
  | "toy";

export type TrolleyShelfItem = {
  id: string;
  word: string;
  letter: string;
  isTarget: boolean;
  shape: GroceryShape;
  color: string;
  locked?: boolean;
};

type GroceryFood = {
  word: string;
  shape: GroceryShape;
  color: string;
};

const GROCERIES: Record<string, GroceryFood[]> = {
  A: [
    { word: "Apple", shape: "apple", color: "#ef4444" },
    { word: "Airplane", shape: "toy", color: "#38bdf8" },
    { word: "Animal crackers", shape: "box", color: "#f59e0b" },
    { word: "Apricot", shape: "apple", color: "#fb923c" },
    { word: "Art set", shape: "box", color: "#a855f7" },
  ],
  B: [
    { word: "Banana", shape: "banana", color: "#facc15" },
    { word: "Butter", shape: "box", color: "#fde68a" },
    { word: "Ball", shape: "ball", color: "#ef4444" },
    { word: "Bear", shape: "teddy", color: "#d97706" },
    { word: "Brownie", shape: "chocolate", color: "#78350f" },
  ],
  C: [
    { word: "Cupcake", shape: "cupcake", color: "#f9a8d4" },
    { word: "Chocolate", shape: "chocolate", color: "#7c2d12" },
    { word: "Cookie", shape: "cylinder", color: "#d97706" },
    { word: "Cheese", shape: "box", color: "#fbbf24" },
    { word: "Car", shape: "toy", color: "#ef4444" },
  ],
  D: [
    { word: "Donut", shape: "donut", color: "#f9a8d4" },
    { word: "Doll", shape: "teddy", color: "#fb7185" },
    { word: "Drum", shape: "toy", color: "#f97316" },
    { word: "Dates", shape: "bag", color: "#7c2d12" },
    { word: "Dice", shape: "box", color: "#ffffff" },
  ],
  E: [
    { word: "Eggs", shape: "egg", color: "#fef3c7" },
    { word: "Eclair", shape: "cylinder", color: "#fcd34d" },
    { word: "Elephant", shape: "teddy", color: "#94a3b8" },
    { word: "Eraser", shape: "box", color: "#f472b6" },
    { word: "Easter egg", shape: "egg", color: "#a3e635" },
  ],
  F: [
    { word: "Fries", shape: "box", color: "#f59e0b" },
    { word: "Fruit snacks", shape: "bag", color: "#ef4444" },
    { word: "Football", shape: "ball", color: "#92400e" },
    { word: "Fig bar", shape: "box", color: "#7f1d1d" },
    { word: "Flute", shape: "toy", color: "#facc15" },
  ],
  G: [
    { word: "Grapes", shape: "berry", color: "#7c3aed" },
    { word: "Gummy bears", shape: "bag", color: "#22c55e" },
    { word: "Guitar", shape: "toy", color: "#b45309" },
    { word: "Granola", shape: "bag", color: "#ca8a04" },
    { word: "Game", shape: "box", color: "#2563eb" },
  ],
  H: [
    { word: "Honey", shape: "bottle", color: "#f59e0b" },
    { word: "Hot dog", shape: "cylinder", color: "#ef4444" },
    { word: "Helicopter", shape: "toy", color: "#38bdf8" },
    { word: "Hamburger", shape: "cylinder", color: "#d97706" },
    { word: "Hair bow", shape: "toy", color: "#ec4899" },
  ],
  I: [
    { word: "Ice cream", shape: "ice", color: "#fbcfe8" },
    { word: "Icing", shape: "bag", color: "#f9a8d4" },
    { word: "Ice pop", shape: "cone", color: "#22d3ee" },
    { word: "Igloo toy", shape: "toy", color: "#e0f2fe" },
    { word: "Italian ice", shape: "cupcake", color: "#fb7185" },
  ],
  J: [
    { word: "Juice", shape: "bottle", color: "#fb923c" },
    { word: "Jam", shape: "bottle", color: "#be123c" },
    { word: "Jelly beans", shape: "bag", color: "#e11d48" },
    { word: "Jump rope", shape: "toy", color: "#facc15" },
    { word: "Jello", shape: "box", color: "#f472b6" },
  ],
  K: [
    { word: "Kiwi", shape: "apple", color: "#84cc16" },
    { word: "Ketchup", shape: "bottle", color: "#dc2626" },
    { word: "Kite", shape: "toy", color: "#f43f5e" },
    { word: "Kettle corn", shape: "bag", color: "#facc15" },
    { word: "Koala", shape: "teddy", color: "#a8a29e" },
  ],
  L: [
    { word: "Lollipop", shape: "apple", color: "#ec4899" },
    { word: "Lemon", shape: "apple", color: "#facc15" },
    { word: "Lion", shape: "teddy", color: "#f59e0b" },
    { word: "Lime", shape: "apple", color: "#84cc16" },
    { word: "Lunch box", shape: "box", color: "#2563eb" },
  ],
  M: [
    { word: "Milk", shape: "carton", color: "#f8fafc" },
    { word: "Mango", shape: "apple", color: "#f59e0b" },
    { word: "Muffin", shape: "cupcake", color: "#d97706" },
    { word: "Monkey", shape: "teddy", color: "#a16207" },
    { word: "Macaroni", shape: "box", color: "#fbbf24" },
  ],
  N: [
    { word: "Noodles", shape: "box", color: "#f59e0b" },
    { word: "Nachos", shape: "bag", color: "#f97316" },
    { word: "Notebook", shape: "box", color: "#fde68a" },
    { word: "Nectarine", shape: "apple", color: "#fb7185" },
    { word: "Nest toy", shape: "toy", color: "#86efac" },
  ],
  O: [
    { word: "Orange", shape: "apple", color: "#f97316" },
    { word: "Onion", shape: "apple", color: "#f5e6c8" },
    { word: "Oatmeal", shape: "cylinder", color: "#e7d3a1" },
    { word: "Octopus", shape: "teddy", color: "#c026d3" },
    { word: "Oat bar", shape: "box", color: "#d6d3d1" },
  ],
  P: [
    { word: "Pizza", shape: "pizza", color: "#ef4444" },
    { word: "Popcorn", shape: "bag", color: "#fef3c7" },
    { word: "Popsicle", shape: "ice", color: "#22d3ee" },
    { word: "Puppy", shape: "teddy", color: "#fdba74" },
    { word: "Peach", shape: "apple", color: "#fdba74" },
  ],
  Q: [
    { word: "Quesadilla", shape: "cylinder", color: "#fbbf24" },
    { word: "Queen doll", shape: "teddy", color: "#e9d5ff" },
    { word: "Quiche", shape: "cylinder", color: "#fde68a" },
    { word: "Quilt", shape: "box", color: "#f472b6" },
    { word: "Quiz cards", shape: "box", color: "#38bdf8" },
  ],
  R: [
    { word: "Raspberry", shape: "berry", color: "#e11d48" },
    { word: "Robot", shape: "toy", color: "#64748b" },
    { word: "Race car", shape: "toy", color: "#ef4444" },
    { word: "Rice cakes", shape: "cylinder", color: "#f8fafc" },
    { word: "Raisins", shape: "bag", color: "#7c2d12" },
  ],
  S: [
    { word: "Strawberry", shape: "berry", color: "#f43f5e" },
    { word: "Sandwich", shape: "box", color: "#eab308" },
    { word: "Soccer ball", shape: "ball", color: "#ffffff" },
    { word: "Stickers", shape: "box", color: "#a855f7" },
    { word: "Soup", shape: "can", color: "#ef4444" },
  ],
  T: [
    { word: "Teddy", shape: "teddy", color: "#d97706" },
    { word: "Train", shape: "toy", color: "#2563eb" },
    { word: "Taco", shape: "cylinder", color: "#f59e0b" },
    { word: "Tangerine", shape: "apple", color: "#fb923c" },
    { word: "Tomato", shape: "apple", color: "#ef4444" },
  ],
  U: [
    { word: "Unicorn", shape: "teddy", color: "#f0abfc" },
    { word: "Udon", shape: "box", color: "#f8fafc" },
    { word: "Ube cake", shape: "cupcake", color: "#7e22ce" },
    { word: "Umbrella", shape: "toy", color: "#38bdf8" },
    { word: "Ugli fruit", shape: "apple", color: "#84cc16" },
  ],
  V: [
    { word: "Vanilla", shape: "ice", color: "#fef3c7" },
    { word: "Volleyball", shape: "ball", color: "#ffffff" },
    { word: "Violin", shape: "toy", color: "#92400e" },
    { word: "Veggies", shape: "bag", color: "#22c55e" },
    { word: "Video game", shape: "box", color: "#4f46e5" },
  ],
  W: [
    { word: "Watermelon", shape: "apple", color: "#16a34a" },
    { word: "Waffle", shape: "box", color: "#d97706" },
    { word: "Wagon", shape: "toy", color: "#ef4444" },
    { word: "Water", shape: "bottle", color: "#38bdf8" },
    { word: "Whistle", shape: "toy", color: "#facc15" },
  ],
  X: [
    { word: "Xylophone", shape: "toy", color: "#f43f5e" },
    { word: "Xigua", shape: "apple", color: "#ef4444" },
    { word: "Xylitol gum", shape: "box", color: "#e0f2fe" },
    { word: "XO sauce", shape: "bottle", color: "#7f1d1d" },
    { word: "Ximenia", shape: "apple", color: "#f97316" },
  ],
  Y: [
    { word: "Yogurt", shape: "carton", color: "#fdf2f8" },
    { word: "Yo-yo", shape: "ball", color: "#ef4444" },
    { word: "Yellow pepper", shape: "apple", color: "#facc15" },
    { word: "Yacht", shape: "toy", color: "#38bdf8" },
    { word: "Yam", shape: "cylinder", color: "#a16207" },
  ],
  Z: [
    { word: "Zebra", shape: "teddy", color: "#e5e7eb" },
    { word: "Zucchini", shape: "cylinder", color: "#65a30d" },
    { word: "Zip pouch", shape: "bag", color: "#2563eb" },
    { word: "Ziti", shape: "box", color: "#f59e0b" },
    { word: "Zwieback", shape: "box", color: "#e7c8a0" },
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

/** Put the 5 letter matches on the nearest shelf spots. */
export function arrangeShelf(items: TrolleyShelfItem[]): TrolleyShelfItem[] {
  const targets = items.filter((item) => item.isTarget);
  const extras = items.filter((item) => !item.isTarget);
  const placed: TrolleyShelfItem[] = new Array(ITEMS_PER_ROW);
  const frontSlots = [0, 4, 8, 12, 1];
  targets.forEach((item, index) => {
    placed[frontSlots[index] ?? index] = item;
  });
  let extraIndex = 0;
  for (let slot = 0; slot < ITEMS_PER_ROW; slot++) {
    if (!placed[slot]) placed[slot] = extras[extraIndex++];
  }
  return placed;
}

/**
 * Two shelf heights, both within a child's reach.
 * Eight spots on the left, seven on the right.
 */
export function shelfSlot(
  index: number,
  section: number,
): [number, number, number] {
  const onLeft = index < 8;
  const local = onLeft ? index : index - 8;
  const col = local % 4;
  const row = Math.floor(local / 4);
  const side = onLeft ? -1 : 1;
  const x = side * 1.78;
  const y = row === 0 ? 0.72 : 1.62;
  const z = -1.15 - section * AISLE_SPAN - col * 1.48;
  return [x, y, z];
}
