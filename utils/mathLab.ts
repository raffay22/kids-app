/** Early 3D Math Lab — toddler, explorer, and Pro (7–8) challenge math. */

export const FREE_MATH_ROUNDS_PER_SESSION = 3;
export const STARS_PER_MATH_SOLVE = 5;

export type MathAgeMode = "toddler" | "explorer" | "pro";
export type ExplorerKind = "addition" | "subtraction" | "groups";
export type ProKind =
  | "multiply"
  | "hardAdd"
  | "hardSub"
  | "missingFactor";

/** Countable phonics friends reused from alphabet_phonics_3d_schema / public/phonics. */
export type MathFruitId =
  | "strawberry"
  | "apple"
  | "banana"
  | "grapes"
  | "orange"
  | "lemon"
  | "mango"
  | "ball"
  | "fish"
  | "flower"
  | "duck"
  | "cat"
  | "dog"
  | "bear"
  | "butterfly"
  | "car"
  | "bus"
  | "kite"
  | "lion"
  | "monkey"
  | "mouse"
  | "owl"
  | "panda"
  | "penguin"
  | "frog"
  | "gift"
  | "hat"
  | "icecream"
  | "cupcake"
  | "lollipop"
  | "egg"
  | "leaf";

export type MathFruitVisual = {
  id: MathFruitId;
  label: string;
  singular: string;
  emoji: string;
  /** Re-used phonics 3D loop from alphabet_phonics_3d_schema. */
  videoSrc: string;
  face: string;
  rim: string;
};

export const MATH_FRUITS: Record<MathFruitId, MathFruitVisual> = {
  strawberry: {
    id: "strawberry",
    label: "Strawberries",
    singular: "Strawberry",
    emoji: "🍓",
    videoSrc: "/phonics/S/s5_strawberry.mp4",
    face: "from-rose-300 via-red-300 to-pink-400",
    rim: "border-rose-200",
  },
  apple: {
    id: "apple",
    label: "Apples",
    singular: "Apple",
    emoji: "🍎",
    videoSrc: "/phonics/A/a1_apple.mp4",
    face: "from-rose-300 via-red-300 to-orange-300",
    rim: "border-rose-200",
  },
  banana: {
    id: "banana",
    label: "Bananas",
    singular: "Banana",
    emoji: "🍌",
    videoSrc: "/phonics/B/b5_banana.mp4",
    face: "from-yellow-200 via-amber-300 to-lime-300",
    rim: "border-amber-200",
  },
  grapes: {
    id: "grapes",
    label: "Grapes",
    singular: "Grape bunch",
    emoji: "🍇",
    videoSrc: "/phonics/G/g3_grapes.mp4",
    face: "from-violet-300 via-purple-300 to-fuchsia-400",
    rim: "border-violet-200",
  },
  orange: {
    id: "orange",
    label: "Oranges",
    singular: "Orange",
    emoji: "🍊",
    videoSrc: "/phonics/O/o2_orange.mp4",
    face: "from-orange-300 via-amber-300 to-yellow-400",
    rim: "border-orange-200",
  },
  lemon: {
    id: "lemon",
    label: "Lemons",
    singular: "Lemon",
    emoji: "🍋",
    videoSrc: "/phonics/L/l3_lemon.mp4",
    face: "from-yellow-200 via-amber-200 to-lime-300",
    rim: "border-yellow-200",
  },
  mango: {
    id: "mango",
    label: "Mangos",
    singular: "Mango",
    emoji: "🥭",
    videoSrc: "/phonics/M/m3_mango.mp4",
    face: "from-orange-300 via-amber-300 to-yellow-400",
    rim: "border-orange-200",
  },
  ball: {
    id: "ball",
    label: "Balls",
    singular: "Ball",
    emoji: "⚽",
    videoSrc: "/phonics/B/b1_ball.mp4",
    face: "from-slate-200 via-white to-emerald-300",
    rim: "border-slate-200",
  },
  fish: {
    id: "fish",
    label: "Fish",
    singular: "Fish",
    emoji: "🐟",
    videoSrc: "/phonics/F/f1_fish.mp4",
    face: "from-cyan-300 via-sky-300 to-teal-400",
    rim: "border-cyan-200",
  },
  flower: {
    id: "flower",
    label: "Flowers",
    singular: "Flower",
    emoji: "🌸",
    videoSrc: "/phonics/F/f3_flower.mp4",
    face: "from-pink-200 via-rose-300 to-fuchsia-300",
    rim: "border-pink-200",
  },
  duck: {
    id: "duck",
    label: "Ducks",
    singular: "Duck",
    emoji: "🦆",
    videoSrc: "/phonics/D/d2_duck.mp4",
    face: "from-yellow-200 via-amber-300 to-lime-300",
    rim: "border-amber-200",
  },
  cat: {
    id: "cat",
    label: "Cats",
    singular: "Cat",
    emoji: "🐱",
    videoSrc: "/phonics/C/c1_cat.mp4",
    face: "from-orange-200 via-amber-100 to-rose-200",
    rim: "border-orange-200",
  },
  dog: {
    id: "dog",
    label: "Dogs",
    singular: "Dog",
    emoji: "🐶",
    videoSrc: "/phonics/D/d1_dog.mp4",
    face: "from-amber-200 via-orange-200 to-rose-200",
    rim: "border-amber-200",
  },
  bear: {
    id: "bear",
    label: "Bears",
    singular: "Bear",
    emoji: "🐻",
    videoSrc: "/phonics/B/b3_bear.mp4",
    face: "from-amber-200 via-orange-200 to-rose-300",
    rim: "border-amber-200",
  },
  butterfly: {
    id: "butterfly",
    label: "Butterflies",
    singular: "Butterfly",
    emoji: "🦋",
    videoSrc: "/phonics/B/b4_butterfly.mp4",
    face: "from-sky-200 via-violet-300 to-fuchsia-300",
    rim: "border-violet-200",
  },
  car: {
    id: "car",
    label: "Cars",
    singular: "Car",
    emoji: "🚗",
    videoSrc: "/phonics/C/c2_car.mp4",
    face: "from-sky-300 via-blue-300 to-indigo-400",
    rim: "border-sky-200",
  },
  bus: {
    id: "bus",
    label: "Buses",
    singular: "Bus",
    emoji: "🚌",
    videoSrc: "/phonics/B/b2_bus.mp4",
    face: "from-amber-300 via-yellow-300 to-orange-400",
    rim: "border-amber-200",
  },
  kite: {
    id: "kite",
    label: "Kites",
    singular: "Kite",
    emoji: "🪁",
    videoSrc: "/phonics/K/k1_kite.mp4",
    face: "from-sky-200 via-violet-300 to-rose-300",
    rim: "border-sky-200",
  },
  lion: {
    id: "lion",
    label: "Lions",
    singular: "Lion",
    emoji: "🦁",
    videoSrc: "/phonics/L/l1_lion.mp4",
    face: "from-amber-300 via-orange-300 to-yellow-400",
    rim: "border-amber-200",
  },
  monkey: {
    id: "monkey",
    label: "Monkeys",
    singular: "Monkey",
    emoji: "🐵",
    videoSrc: "/phonics/M/m1_monkey.mp4",
    face: "from-amber-200 via-orange-200 to-rose-200",
    rim: "border-amber-200",
  },
  mouse: {
    id: "mouse",
    label: "Mice",
    singular: "Mouse",
    emoji: "🐭",
    videoSrc: "/phonics/M/m5_mouse.mp4",
    face: "from-slate-100 via-rose-100 to-amber-100",
    rim: "border-slate-200",
  },
  owl: {
    id: "owl",
    label: "Owls",
    singular: "Owl",
    emoji: "🦉",
    videoSrc: "/phonics/O/o1_owl.mp4",
    face: "from-amber-200 via-stone-200 to-indigo-200",
    rim: "border-amber-200",
  },
  panda: {
    id: "panda",
    label: "Pandas",
    singular: "Panda",
    emoji: "🐼",
    videoSrc: "/phonics/P/p1_panda.mp4",
    face: "from-white via-slate-100 to-slate-300",
    rim: "border-slate-300",
  },
  penguin: {
    id: "penguin",
    label: "Penguins",
    singular: "Penguin",
    emoji: "🐧",
    videoSrc: "/phonics/P/p2_penguin.mp4",
    face: "from-slate-200 via-white to-sky-200",
    rim: "border-slate-300",
  },
  frog: {
    id: "frog",
    label: "Frogs",
    singular: "Frog",
    emoji: "🐸",
    videoSrc: "/phonics/F/f2_frog.mp4",
    face: "from-lime-300 via-emerald-300 to-teal-400",
    rim: "border-lime-200",
  },
  gift: {
    id: "gift",
    label: "Gifts",
    singular: "Gift",
    emoji: "🎁",
    videoSrc: "/phonics/G/g4_gift.mp4",
    face: "from-rose-300 via-pink-300 to-amber-300",
    rim: "border-rose-200",
  },
  hat: {
    id: "hat",
    label: "Hats",
    singular: "Hat",
    emoji: "🎩",
    videoSrc: "/phonics/H/h2_hat.mp4",
    face: "from-slate-300 via-indigo-200 to-violet-300",
    rim: "border-slate-300",
  },
  icecream: {
    id: "icecream",
    label: "Ice Creams",
    singular: "Ice Cream",
    emoji: "🍦",
    videoSrc: "/phonics/I/i1_icecream.mp4",
    face: "from-pink-100 via-rose-200 to-amber-100",
    rim: "border-pink-200",
  },
  cupcake: {
    id: "cupcake",
    label: "Cupcakes",
    singular: "Cupcake",
    emoji: "🧁",
    videoSrc: "/phonics/C/c3_cupcake.mp4",
    face: "from-pink-200 via-rose-300 to-amber-200",
    rim: "border-pink-200",
  },
  lollipop: {
    id: "lollipop",
    label: "Lollipops",
    singular: "Lollipop",
    emoji: "🍭",
    videoSrc: "/phonics/L/l5_lollipop.mp4",
    face: "from-pink-200 via-violet-200 to-sky-200",
    rim: "border-pink-200",
  },
  egg: {
    id: "egg",
    label: "Eggs",
    singular: "Egg",
    emoji: "🥚",
    videoSrc: "/phonics/E/e2_egg.mp4",
    face: "from-amber-50 via-white to-yellow-100",
    rim: "border-amber-100",
  },
  leaf: {
    id: "leaf",
    label: "Leaves",
    singular: "Leaf",
    emoji: "🍃",
    videoSrc: "/phonics/L/l4_leaf.mp4",
    face: "from-lime-200 via-green-300 to-emerald-400",
    rim: "border-lime-200",
  },
};

const MATH_ITEM_IDS = Object.keys(MATH_FRUITS) as MathFruitId[];

export type ToddlerPuzzle = {
  id: string;
  fruit: MathFruitId;
  left: number;
  right: number;
  answer: number;
  choices: number[];
  prompt: string;
};

export type ExplorerAdditionPuzzle = {
  id: string;
  kind: "addition";
  left: number;
  right: number;
  answer: number;
  choices: number[];
  prompt: string;
};

export type ExplorerSubtractionPuzzle = {
  id: string;
  kind: "subtraction";
  start: number;
  takeAway: number;
  answer: number;
  choices: number[];
  prompt: string;
};

export type ExplorerGroupsPuzzle = {
  id: string;
  kind: "groups";
  fruit: MathFruitId;
  groups: number;
  perGroup: number;
  answer: number;
  choices: number[];
  prompt: string;
};

export type ExplorerPuzzle =
  | ExplorerAdditionPuzzle
  | ExplorerSubtractionPuzzle
  | ExplorerGroupsPuzzle;

export type ProPuzzle = {
  id: string;
  kind: ProKind;
  /** First operand (or known factor). */
  left: number;
  /** Second operand (or product for missingFactor). */
  right: number;
  answer: number;
  choices: number[];
  prompt: string;
  fruit: MathFruitId;
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Build number options around the correct answer (allows 0 for leftovers). */
function choiceSet(answer: number, max = 10, count = 5, min = 0): number[] {
  const pool = new Set<number>([answer]);
  let guard = 0;
  while (pool.size < count && guard < 60) {
    guard += 1;
    const delta = Math.floor(Math.random() * 5) + 1;
    const candidate =
      Math.random() > 0.5
        ? Math.min(max, answer + delta)
        : Math.max(min, answer - delta);
    if (candidate !== answer) pool.add(candidate);
  }
  let n = min;
  while (pool.size < count && n <= max) {
    if (n !== answer) pool.add(n);
    n += 1;
  }
  return shuffle([...pool]).slice(0, count);
}

const recentMathItems: MathFruitId[] = [];
const RECENT_MATH_ITEM_LIMIT = 10;

function pickFreshItem(): MathFruitId {
  const fresh = MATH_ITEM_IDS.filter((id) => !recentMathItems.includes(id));
  const source = fresh.length > 0 ? fresh : MATH_ITEM_IDS;
  const id = source[Math.floor(Math.random() * source.length)];
  recentMathItems.push(id);
  if (recentMathItems.length > RECENT_MATH_ITEM_LIMIT) recentMathItems.shift();
  return id;
}

const TODDLER_PAIRINGS: Array<{ left: number; right: number }> = [
  { left: 1, right: 1 },
  { left: 1, right: 2 },
  { left: 2, right: 1 },
  { left: 2, right: 2 },
  { left: 1, right: 3 },
  { left: 3, right: 1 },
  { left: 2, right: 3 },
  { left: 3, right: 2 },
  { left: 1, right: 4 },
  { left: 4, right: 1 },
  { left: 3, right: 3 },
  { left: 2, right: 4 },
];

const ADDITION_POOL: Array<Omit<ExplorerAdditionPuzzle, "kind" | "choices" | "prompt">> = [
  { id: "e-add-2-4", left: 2, right: 4, answer: 6 },
  { id: "e-add-1-3", left: 1, right: 3, answer: 4 },
  { id: "e-add-3-3", left: 3, right: 3, answer: 6 },
  { id: "e-add-2-3", left: 2, right: 3, answer: 5 },
  { id: "e-add-1-4", left: 1, right: 4, answer: 5 },
  { id: "e-add-4-2", left: 4, right: 2, answer: 6 },
  { id: "e-add-3-4", left: 3, right: 4, answer: 7 },
  { id: "e-add-5-2", left: 5, right: 2, answer: 7 },
  { id: "e-add-4-4", left: 4, right: 4, answer: 8 },
  { id: "e-add-1-5", left: 1, right: 5, answer: 6 },
];

const SUBTRACTION_POOL: Array<
  Omit<ExplorerSubtractionPuzzle, "kind" | "choices" | "prompt">
> = [
  { id: "e-sub-2-1", start: 2, takeAway: 1, answer: 1 },
  { id: "e-sub-3-1", start: 3, takeAway: 1, answer: 2 },
  { id: "e-sub-4-2", start: 4, takeAway: 2, answer: 2 },
  { id: "e-sub-5-2", start: 5, takeAway: 2, answer: 3 },
  { id: "e-sub-3-2", start: 3, takeAway: 2, answer: 1 },
  { id: "e-sub-6-2", start: 6, takeAway: 2, answer: 4 },
  { id: "e-sub-5-3", start: 5, takeAway: 3, answer: 2 },
  { id: "e-sub-6-3", start: 6, takeAway: 3, answer: 3 },
  { id: "e-sub-4-1", start: 4, takeAway: 1, answer: 3 },
  { id: "e-sub-7-3", start: 7, takeAway: 3, answer: 4 },
];

const GROUP_PAIRINGS: Array<{ groups: number; perGroup: number }> = [
  { groups: 2, perGroup: 2 },
  { groups: 2, perGroup: 3 },
  { groups: 3, perGroup: 2 },
  { groups: 3, perGroup: 1 },
  { groups: 2, perGroup: 4 },
  { groups: 4, perGroup: 2 },
  { groups: 3, perGroup: 3 },
];

export function pickToddlerPuzzle(): ToddlerPuzzle {
  // Prefer classic fruit examples from games.md, then rotate other phonics friends.
  const classic: MathFruitId[] = ["strawberry", "apple", "banana"];
  const preferClassic = Math.random() < 0.45;
  const fruitId = preferClassic
    ? classic[Math.floor(Math.random() * classic.length)]
    : pickFreshItem();
  if (preferClassic) {
    recentMathItems.push(fruitId);
    if (recentMathItems.length > RECENT_MATH_ITEM_LIMIT) recentMathItems.shift();
  }
  const fruit = MATH_FRUITS[fruitId];
  // Lead with the games.md example pairing often: 2 + 2
  const pairing =
    Math.random() < 0.35
      ? { left: 2, right: 2 }
      : TODDLER_PAIRINGS[Math.floor(Math.random() * TODDLER_PAIRINGS.length)];
  const answer = pairing.left + pairing.right;
  return {
    id: `t-${fruitId}-${pairing.left}-${pairing.right}-${Date.now().toString(36)}`,
    fruit: fruitId,
    left: pairing.left,
    right: pairing.right,
    answer,
    // games.md: three tactile number cards
    choices: choiceSet(answer, 6, 3),
    prompt: `Count the ${fruit.label.toLowerCase()}. How many altogether?`,
  };
}

export function speakToddlerSolve(puzzle: ToddlerPuzzle): string {
  const fruit = MATH_FRUITS[puzzle.fruit];
  const leftWord = puzzle.left === 1 ? fruit.singular : fruit.label;
  const rightWord = puzzle.right === 1 ? fruit.singular : fruit.label;
  const totalWord = puzzle.answer === 1 ? fruit.singular : fruit.label;
  return `${puzzle.left} ${leftWord} plus ${puzzle.right} ${rightWord} equals ${puzzle.answer} ${totalWord}!`;
}

let explorerKindCursor = 0;
const EXPLORER_KIND_ORDER: ExplorerKind[] = ["addition", "subtraction", "groups"];

export function pickExplorerPuzzle(): ExplorerPuzzle {
  const kind = EXPLORER_KIND_ORDER[explorerKindCursor % EXPLORER_KIND_ORDER.length];
  explorerKindCursor += 1;

  if (kind === "addition") {
    // Prefer games.md example: 2 + 4 = 6
    const base =
      Math.random() < 0.35
        ? ADDITION_POOL.find((p) => p.left === 2 && p.right === 4) ??
          ADDITION_POOL[0]
        : ADDITION_POOL[Math.floor(Math.random() * ADDITION_POOL.length)];
    return {
      ...base,
      kind: "addition",
      choices: choiceSet(base.answer, 9, 3),
      prompt: `How many gold coins altogether? ${base.left} plus ${base.right}.`,
    };
  }

  if (kind === "subtraction") {
    const base =
      SUBTRACTION_POOL[Math.floor(Math.random() * SUBTRACTION_POOL.length)];
    return {
      ...base,
      kind: "subtraction",
      choices: choiceSet(base.answer, 7, 3),
      prompt: `You have ${base.start} coins! Drag ${base.takeAway} ${
        base.takeAway === 1 ? "coin" : "coins"
      } into the Saving Box. How many are left?`,
    };
  }

  // games.md groups lead example: 2 groups of 2 apples
  const useAppleClassic = Math.random() < 0.4;
  const fruitId = useAppleClassic ? "apple" : pickFreshItem();
  if (useAppleClassic) {
    recentMathItems.push(fruitId);
    if (recentMathItems.length > RECENT_MATH_ITEM_LIMIT) recentMathItems.shift();
  }
  const fruit = MATH_FRUITS[fruitId];
  const pairing = useAppleClassic
    ? { groups: 2, perGroup: 2 }
    : GROUP_PAIRINGS[Math.floor(Math.random() * GROUP_PAIRINGS.length)];
  const answer = pairing.groups * pairing.perGroup;
  return {
    id: `e-grp-${fruitId}-${pairing.groups}x${pairing.perGroup}-${Date.now().toString(36)}`,
    kind: "groups",
    fruit: fruitId,
    groups: pairing.groups,
    perGroup: pairing.perGroup,
    answer,
    choices: choiceSet(answer, 10, 3),
    prompt: `${pairing.groups} groups of ${pairing.perGroup} ${fruit.label.toLowerCase()}. How many altogether?`,
  };
}

export function speakExplorerSolve(puzzle: ExplorerPuzzle): string {
  if (puzzle.kind === "addition") {
    return `${puzzle.left} gold coins plus ${puzzle.right} gold coins equals ${puzzle.answer} gold coins!`;
  }
  if (puzzle.kind === "subtraction") {
    return `${puzzle.start} coins take away ${puzzle.takeAway} leaves ${puzzle.answer}!`;
  }
  const fruit = MATH_FRUITS[puzzle.fruit];
  return `${puzzle.groups} groups of ${puzzle.perGroup} ${fruit.label.toLowerCase()} make ${puzzle.answer} ${fruit.label.toLowerCase()}!`;
}

const PRO_MULTIPLY_POOL: Array<{ left: number; right: number }> = [
  { left: 2, right: 3 },
  { left: 2, right: 4 },
  { left: 2, right: 5 },
  { left: 2, right: 6 },
  { left: 2, right: 7 },
  { left: 2, right: 8 },
  { left: 2, right: 9 },
  { left: 3, right: 3 },
  { left: 3, right: 4 },
  { left: 3, right: 5 },
  { left: 3, right: 6 },
  { left: 3, right: 7 },
  { left: 4, right: 4 },
  { left: 4, right: 5 },
  { left: 4, right: 6 },
  { left: 5, right: 5 },
  { left: 5, right: 6 },
  { left: 6, right: 6 },
  { left: 7, right: 3 },
  { left: 8, right: 3 },
  { left: 9, right: 3 },
];

const PRO_HARD_ADD_POOL: Array<{ left: number; right: number }> = [
  { left: 8, right: 7 },
  { left: 9, right: 6 },
  { left: 12, right: 5 },
  { left: 11, right: 8 },
  { left: 14, right: 7 },
  { left: 13, right: 9 },
  { left: 15, right: 6 },
  { left: 16, right: 8 },
  { left: 18, right: 7 },
  { left: 19, right: 5 },
  { left: 17, right: 9 },
  { left: 21, right: 4 },
  { left: 23, right: 6 },
  { left: 24, right: 8 },
];

const PRO_HARD_SUB_POOL: Array<{ left: number; right: number }> = [
  { left: 12, right: 5 },
  { left: 14, right: 6 },
  { left: 15, right: 7 },
  { left: 16, right: 9 },
  { left: 18, right: 8 },
  { left: 19, right: 6 },
  { left: 20, right: 7 },
  { left: 21, right: 9 },
  { left: 22, right: 8 },
  { left: 24, right: 6 },
  { left: 25, right: 9 },
  { left: 27, right: 8 },
  { left: 28, right: 9 },
  { left: 30, right: 12 },
];

let proKindCursor = 0;
const PRO_KIND_ORDER: ProKind[] = [
  "multiply",
  "hardAdd",
  "hardSub",
  "missingFactor",
  "multiply",
];

export function pickProPuzzle(): ProPuzzle {
  const kind = PRO_KIND_ORDER[proKindCursor % PRO_KIND_ORDER.length];
  proKindCursor += 1;
  const fruitId = pickFreshItem();
  const fruit = MATH_FRUITS[fruitId];

  if (kind === "multiply") {
    const base =
      PRO_MULTIPLY_POOL[Math.floor(Math.random() * PRO_MULTIPLY_POOL.length)];
    const answer = base.left * base.right;
    return {
      id: `p-mul-${base.left}x${base.right}-${Date.now().toString(36)}`,
      kind: "multiply",
      left: base.left,
      right: base.right,
      answer,
      choices: choiceSet(answer, 40, 4, 1),
      prompt: `What is ${base.left} times ${base.right}? Count the array!`,
      fruit: fruitId,
    };
  }

  if (kind === "hardAdd") {
    const base =
      PRO_HARD_ADD_POOL[Math.floor(Math.random() * PRO_HARD_ADD_POOL.length)];
    const answer = base.left + base.right;
    return {
      id: `p-add-${base.left}+${base.right}-${Date.now().toString(36)}`,
      kind: "hardAdd",
      left: base.left,
      right: base.right,
      answer,
      choices: choiceSet(answer, 45, 4, 1),
      prompt: `${base.left} plus ${base.right}. How many altogether?`,
      fruit: fruitId,
    };
  }

  if (kind === "hardSub") {
    const base =
      PRO_HARD_SUB_POOL[Math.floor(Math.random() * PRO_HARD_SUB_POOL.length)];
    const answer = base.left - base.right;
    return {
      id: `p-sub-${base.left}-${base.right}-${Date.now().toString(36)}`,
      kind: "hardSub",
      left: base.left,
      right: base.right,
      answer,
      choices: choiceSet(answer, 35, 4, 0),
      prompt: `You have ${base.left}. Take away ${base.right}. How many are left?`,
      fruit: fruitId,
    };
  }

  // missingFactor — e.g. 5 × ? = 20
  const mul =
    PRO_MULTIPLY_POOL[Math.floor(Math.random() * PRO_MULTIPLY_POOL.length)];
  const product = mul.left * mul.right;
  return {
    id: `p-miss-${mul.left}x-${product}-${Date.now().toString(36)}`,
    kind: "missingFactor",
    left: mul.left,
    right: product,
    answer: mul.right,
    choices: choiceSet(mul.right, 12, 4, 1),
    prompt: `${mul.left} times what number makes ${product}?`,
    fruit: fruitId,
  };
}

export function speakProSolve(puzzle: ProPuzzle): string {
  const fruit = MATH_FRUITS[puzzle.fruit];
  if (puzzle.kind === "multiply") {
    return `${puzzle.left} times ${puzzle.right} equals ${puzzle.answer}! That is ${puzzle.answer} ${fruit.label.toLowerCase()}!`;
  }
  if (puzzle.kind === "hardAdd") {
    return `${puzzle.left} plus ${puzzle.right} equals ${puzzle.answer}!`;
  }
  if (puzzle.kind === "hardSub") {
    return `${puzzle.left} take away ${puzzle.right} leaves ${puzzle.answer}!`;
  }
  return `${puzzle.left} times ${puzzle.answer} equals ${puzzle.right}!`;
}

export const AGE_MODE_META: Record<
  MathAgeMode,
  {
    title: string;
    blurb: string;
    emoji: string;
    accent: string;
    ageLabel: string;
    requiresPro: boolean;
  }
> = {
  toddler: {
    title: "Toddler Visual Math",
    blurb: "Mode A · Under 3 — tap fruits to count, then pick the total.",
    emoji: "👶",
    accent: "from-rose-400 to-orange-400",
    ageLabel: "Under 3 Years",
    requiresPro: false,
  },
  explorer: {
    title: "Explorer Coin Math & Subtraction",
    blurb: "Mode B · 3+ — coin add, Saving Box take-away, and apple groups.",
    emoji: "👦",
    accent: "from-amber-400 to-yellow-500",
    ageLabel: "3+ Years",
    requiresPro: false,
  },
  pro: {
    title: "Pro Challenge Math",
    blurb: "Mode C · 7–8 — times tables, tougher add/sub, and missing factors.",
    emoji: "🧠",
    accent: "from-violet-500 to-indigo-600",
    ageLabel: "7–8 Years · Pro",
    requiresPro: true,
  },
};
