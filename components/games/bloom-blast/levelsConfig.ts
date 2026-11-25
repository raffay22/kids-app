/** Bloom Blast — Groups 1–3 (Tiny Explorers, Curious Minds, Master Champions). */

export type BloomCategory = "fruit" | "vegetable" | "vehicle";
export type BloomPlantPart = "leaf" | "root" | "petal" | "seed" | "stem";
export type BloomMatterState = "solid" | "liquid" | "gas";
export type BloomSpeechPart = "adjective" | "verb" | "noun";

export type BloomShapeKind =
  | "circle"
  | "square"
  | "triangle"
  | "star"
  | "heart"
  | "oval"
  | "diamond"
  | "sun"
  | "moon"
  | "flower"
  | "tree"
  | "leaf"
  | "mountain"
  | "cloud"
  | "rainbow"
  | "bird"
  | "bamboo"
  /** Level 4 height / tiny icons (not used for plain BIG/SMALL shapes) */
  | "boy"
  | "girl"
  | "house"
  | "building"
  | "chair"
  | "bug"
  | "seed"
  | "button"
  /** Group 2 — fruits */
  | "apple"
  | "banana"
  | "strawberry"
  | "orange_fruit"
  | "grapes"
  | "watermelon"
  | "mango"
  | "pear"
  | "cherry"
  | "pineapple"
  | "kiwi"
  | "peach"
  | "lemon"
  | "blueberry"
  /** Group 2 — vegetables */
  | "carrot"
  | "broccoli"
  | "tomato"
  | "corn"
  | "peas"
  | "pumpkin"
  | "cucumber"
  | "potato"
  | "onion"
  | "cabbage"
  | "spinach"
  | "pepper"
  | "radish"
  | "eggplant"
  /** Group 2 — vehicles */
  | "car"
  | "airplane"
  | "rocket"
  | "train"
  | "boat"
  | "bicycle"
  | "bus"
  | "truck"
  | "helicopter"
  | "scooter"
  | "submarine"
  | "taxi"
  /** Group 3 — space / science / matter / grammar */
  | "earth_planet"
  | "saturn"
  | "shooting_star"
  | "rain_cloud"
  | "roots"
  | "petal"
  | "stem_plant"
  | "human"
  | "fish"
  | "rock"
  | "book"
  | "ice_cube"
  | "wood_block"
  | "water_splash"
  | "juice_bottle"
  | "milk_bottle"
  | "steam"
  | "helium_balloon"
  | "smoke"
  | "word_gem"
  | "math_bubble";

export type BloomTileSize = "big" | "small";

export type BloomChallenge =
  | { type: "none" }
  | { type: "color"; colorKey: string; banner: string }
  | {
      type: "size";
      size: BloomTileSize;
      /** Kid-facing word on the chip (BIG / TALL / SHORT / TINY…) */
      sizeLabel?: string;
      banner: string;
    }
  | {
      type: "category";
      categoryKey: BloomCategory;
      banner: string;
    }
  | {
      type: "colorCategory";
      colorKey: string;
      categoryKey: BloomCategory;
      banner: string;
    }
  | {
      type: "plantPart";
      partKey: BloomPlantPart;
      banner: string;
    }
  | {
      type: "living";
      living: boolean;
      banner: string;
    }
  | {
      type: "matter";
      state: BloomMatterState;
      banner: string;
    }
  | {
      type: "speechPart";
      part: "adjective" | "verb";
      banner: string;
    }
  | {
      type: "mathTarget";
      target: number;
      banner: string;
    };

export type BloomTileKind = {
  id: string;
  colorName: string;
  /** lowercase key for color challenges, e.g. "blue" */
  colorKey: string;
  shapeName: string;
  shape: BloomShapeKind;
  size: BloomTileSize;
  fill: string;
  glow: string;
  speakLabel: string;
  /** Group 2 food / transport category */
  category?: BloomCategory;
  /** Group 3 science tags */
  living?: boolean;
  matterState?: BloomMatterState;
  speechPart?: BloomSpeechPart;
  plantPart?: BloomPlantPart;
  /** Level 15 crystal word gem text / Level 16 equation text */
  displayWord?: string;
  /** Level 16 equation result */
  mathValue?: number;
};

export type BloomLevelConfig = {
  id: number;
  group: 1 | 2 | 3;
  groupLevel: number;
  title: string;
  blurb: string;
  enabled: boolean;
  gridSize: number;
  targetMatches: number;
  tiles: BloomTileKind[];
  challenge: BloomChallenge;
};

export type BloomAgeGroup = {
  id: 1 | 2 | 3;
  title: string;
  ages: string;
  blurb: string;
  enabled: boolean;
  levelIds: number[];
};

function tile(
  partial: Omit<BloomTileKind, "size" | "colorKey"> & {
    colorKey: string;
    size?: BloomTileSize;
    category?: BloomCategory;
    living?: boolean;
    matterState?: BloomMatterState;
    speechPart?: BloomSpeechPart;
    plantPart?: BloomPlantPart;
    displayWord?: string;
    mathValue?: number;
  },
): BloomTileKind {
  return { size: partial.size ?? "big", ...partial };
}

/** Level 1 — Primary Shapes (game.md: Circle, Square, Triangle + Green Star) */
export const LEVEL1_TILES: BloomTileKind[] = [
  tile({
    id: "red-circle",
    colorName: "Red",
    colorKey: "red",
    shapeName: "Circle",
    shape: "circle",
    fill: "#ef4444",
    glow: "#fb7185",
    speakLabel: "Red Circle",
  }),
  tile({
    id: "blue-square",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Square",
    shape: "square",
    fill: "#3b82f6",
    glow: "#60a5fa",
    speakLabel: "Blue Square",
  }),
  tile({
    id: "yellow-triangle",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Triangle",
    shape: "triangle",
    fill: "#eab308",
    glow: "#fde047",
    speakLabel: "Yellow Triangle",
  }),
  tile({
    id: "green-star",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Star",
    shape: "star",
    fill: "#22c55e",
    glow: "#4ade80",
    speakLabel: "Green Star",
  }),
];

/** Level 2 — Extended Shapes */
export const LEVEL2_TILES: BloomTileKind[] = [
  tile({
    id: "yellow-star",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Star",
    shape: "star",
    fill: "#facc15",
    glow: "#fde047",
    speakLabel: "Yellow Star",
  }),
  tile({
    id: "pink-heart",
    colorName: "Pink",
    colorKey: "pink",
    shapeName: "Heart",
    shape: "heart",
    fill: "#ec4899",
    glow: "#f9a8d4",
    speakLabel: "Pink Heart",
  }),
  tile({
    id: "purple-oval",
    colorName: "Purple",
    colorKey: "purple",
    shapeName: "Oval",
    shape: "oval",
    fill: "#a855f7",
    glow: "#d8b4fe",
    speakLabel: "Purple Oval",
  }),
  tile({
    id: "cyan-diamond",
    colorName: "Cyan",
    colorKey: "cyan",
    shapeName: "Diamond",
    shape: "diamond",
    fill: "#06b6d4",
    glow: "#67e8f9",
    speakLabel: "Cyan Diamond",
  }),
];

/** Level 3 — colour mix (each rotate-colour has several shapes so kids can always make a line) */
export const LEVEL3_TILES: BloomTileKind[] = [
  // Blue
  tile({
    id: "blue-circle",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Circle",
    shape: "circle",
    fill: "#2563eb",
    glow: "#93c5fd",
    speakLabel: "Blue Circle",
  }),
  tile({
    id: "blue-square",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Square",
    shape: "square",
    fill: "#3b82f6",
    glow: "#60a5fa",
    speakLabel: "Blue Square",
  }),
  tile({
    id: "blue-triangle",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Triangle",
    shape: "triangle",
    fill: "#3b82f6",
    glow: "#93c5fd",
    speakLabel: "Blue Triangle",
  }),
  // Yellow
  tile({
    id: "yellow-circle",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Circle",
    shape: "circle",
    fill: "#eab308",
    glow: "#fde047",
    speakLabel: "Yellow Circle",
  }),
  tile({
    id: "yellow-triangle",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Triangle",
    shape: "triangle",
    fill: "#ca8a04",
    glow: "#fde047",
    speakLabel: "Yellow Triangle",
  }),
  tile({
    id: "yellow-star",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Star",
    shape: "star",
    fill: "#facc15",
    glow: "#fde047",
    speakLabel: "Yellow Star",
  }),
  // Red
  tile({
    id: "red-circle",
    colorName: "Red",
    colorKey: "red",
    shapeName: "Circle",
    shape: "circle",
    fill: "#ef4444",
    glow: "#fb7185",
    speakLabel: "Red Circle",
  }),
  tile({
    id: "red-square",
    colorName: "Red",
    colorKey: "red",
    shapeName: "Square",
    shape: "square",
    fill: "#dc2626",
    glow: "#fb7185",
    speakLabel: "Red Square",
  }),
  tile({
    id: "red-triangle",
    colorName: "Red",
    colorKey: "red",
    shapeName: "Triangle",
    shape: "triangle",
    fill: "#f87171",
    glow: "#fecaca",
    speakLabel: "Red Triangle",
  }),
  // Green
  tile({
    id: "green-circle",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Circle",
    shape: "circle",
    fill: "#22c55e",
    glow: "#86efac",
    speakLabel: "Green Circle",
  }),
  tile({
    id: "green-square",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Square",
    shape: "square",
    fill: "#16a34a",
    glow: "#4ade80",
    speakLabel: "Green Square",
  }),
  tile({
    id: "green-star",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Star",
    shape: "star",
    fill: "#22c55e",
    glow: "#4ade80",
    speakLabel: "Green Star",
  }),
];

/** Level 4 helper — big + small pair for one icon */
function sizePair(opts: {
  shape: BloomShapeKind;
  shapeName: string;
  colorName: string;
  colorKey: string;
  fill: string;
  glow: string;
  bigWord?: string;
  smallWord?: string;
}): BloomTileKind[] {
  const {
    shape,
    shapeName,
    colorName,
    colorKey,
    fill,
    glow,
    bigWord = "Big",
    smallWord = "Small",
  } = opts;
  return [
    tile({
      id: `${colorKey}-${shape}-big`,
      colorName,
      colorKey,
      shapeName,
      shape,
      size: "big",
      fill,
      glow,
      speakLabel: `${bigWord} ${shapeName}`,
    }),
    tile({
      id: `${colorKey}-${shape}-small`,
      colorName,
      colorKey,
      shapeName,
      shape,
      size: "small",
      fill,
      glow,
      speakLabel: `${smallWord} ${shapeName}`,
    }),
  ];
}

/** BIG / SMALL — geometric shapes (clear size difference) */
export const LEVEL4_SHAPE_TILES: BloomTileKind[] = [
  ...sizePair({
    shape: "circle",
    shapeName: "Circle",
    colorName: "Red",
    colorKey: "red",
    fill: "#ef4444",
    glow: "#fb7185",
  }),
  ...sizePair({
    shape: "square",
    shapeName: "Square",
    colorName: "Blue",
    colorKey: "blue",
    fill: "#3b82f6",
    glow: "#60a5fa",
  }),
  ...sizePair({
    shape: "triangle",
    shapeName: "Triangle",
    colorName: "Yellow",
    colorKey: "yellow",
    fill: "#eab308",
    glow: "#fde047",
  }),
  ...sizePair({
    shape: "star",
    shapeName: "Star",
    colorName: "Green",
    colorKey: "green",
    fill: "#22c55e",
    glow: "#4ade80",
  }),
  ...sizePair({
    shape: "heart",
    shapeName: "Heart",
    colorName: "Pink",
    colorKey: "pink",
    fill: "#ec4899",
    glow: "#f9a8d4",
  }),
  ...sizePair({
    shape: "oval",
    shapeName: "Oval",
    colorName: "Purple",
    colorKey: "purple",
    fill: "#a855f7",
    glow: "#d8b4fe",
  }),
];

/** TALL / SHORT — icons that fit height (boy, girl, house, building, chair) */
export const LEVEL4_HEIGHT_TILES: BloomTileKind[] = [
  ...sizePair({
    shape: "boy",
    shapeName: "Boy",
    colorName: "Blue",
    colorKey: "boy",
    fill: "#3b82f6",
    glow: "#93c5fd",
    bigWord: "Tall",
    smallWord: "Short",
  }),
  ...sizePair({
    shape: "girl",
    shapeName: "Girl",
    colorName: "Pink",
    colorKey: "girl",
    fill: "#ec4899",
    glow: "#f9a8d4",
    bigWord: "Tall",
    smallWord: "Short",
  }),
  ...sizePair({
    shape: "building",
    shapeName: "Building",
    colorName: "Slate",
    colorKey: "building",
    fill: "#64748b",
    glow: "#cbd5e1",
    bigWord: "Tall",
    smallWord: "Short",
  }),
  ...sizePair({
    shape: "house",
    shapeName: "House",
    colorName: "Orange",
    colorKey: "house",
    fill: "#f97316",
    glow: "#fdba74",
    bigWord: "Tall",
    smallWord: "Short",
  }),
  ...sizePair({
    shape: "chair",
    shapeName: "Chair",
    colorName: "Brown",
    colorKey: "chair",
    fill: "#a16207",
    glow: "#fde047",
    bigWord: "Tall",
    smallWord: "Short",
  }),
];

/**
 * TINY — tall/thin nature & buildings (bamboo, tree, building, house).
 * Heart/star felt “small shapes”, not teeny versions of real tall things.
 */
export const LEVEL4_TINY_TILES: BloomTileKind[] = [
  ...sizePair({
    shape: "bamboo",
    shapeName: "Bamboo",
    colorName: "Green",
    colorKey: "bamboo",
    fill: "#65a30d",
    glow: "#bef264",
    bigWord: "Big",
    smallWord: "Tiny",
  }),
  ...sizePair({
    shape: "tree",
    shapeName: "Tree",
    colorName: "Green",
    colorKey: "tinytree",
    fill: "#16a34a",
    glow: "#86efac",
    bigWord: "Big",
    smallWord: "Tiny",
  }),
  ...sizePair({
    shape: "building",
    shapeName: "Building",
    colorName: "Slate",
    colorKey: "tinybuilding",
    fill: "#64748b",
    glow: "#cbd5e1",
    bigWord: "Big",
    smallWord: "Tiny",
  }),
  ...sizePair({
    shape: "house",
    shapeName: "House",
    colorName: "Orange",
    colorKey: "tinyhouse",
    fill: "#f97316",
    glow: "#fdba74",
    bigWord: "Big",
    smallWord: "Tiny",
  }),
  ...sizePair({
    shape: "chair",
    shapeName: "Chair",
    colorName: "Brown",
    colorKey: "tinychair",
    fill: "#a16207",
    glow: "#fde047",
    bigWord: "Big",
    smallWord: "Tiny",
  }),
];

/** Default Level 4 pack (BIG/SMALL). Session swaps packs for TALL/SHORT/TINY. */
export const LEVEL4_TILES: BloomTileKind[] = LEVEL4_SHAPE_TILES;

/** Pick Level 4 icon pack that fits the adjective (visual teaching, not word tags). */
export function level4TilesForLabel(sizeLabel: string): BloomTileKind[] {
  const label = sizeLabel.toUpperCase();
  if (label === "TALL" || label === "SHORT") return LEVEL4_HEIGHT_TILES;
  if (label === "TINY") return LEVEL4_TINY_TILES;
  // BIG / SMALL / FAT / THIN — shapes with strong size/width contrast
  return LEVEL4_SHAPE_TILES;
}

/** Level 5 — full nature pool (session picks a rotating mix so each play feels new) */
export const LEVEL5_ALL_NATURE: BloomTileKind[] = [
  tile({
    id: "sunny-sun",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Sun",
    shape: "sun",
    fill: "#f59e0b",
    glow: "#fde68a",
    speakLabel: "Sun",
  }),
  tile({
    id: "silver-moon",
    colorName: "Silver",
    colorKey: "silver",
    shapeName: "Moon",
    shape: "moon",
    fill: "#94a3b8",
    glow: "#e2e8f0",
    speakLabel: "Moon",
  }),
  tile({
    id: "pink-flower",
    colorName: "Pink",
    colorKey: "pink",
    shapeName: "Flower",
    shape: "flower",
    fill: "#ec4899",
    glow: "#f9a8d4",
    speakLabel: "Flower",
  }),
  tile({
    id: "green-tree",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Tree",
    shape: "tree",
    fill: "#16a34a",
    glow: "#86efac",
    speakLabel: "Tree",
  }),
  tile({
    id: "lime-leaf",
    colorName: "Lime",
    colorKey: "lime",
    shapeName: "Leaf",
    shape: "leaf",
    fill: "#65a30d",
    glow: "#bef264",
    speakLabel: "Leaf",
  }),
  tile({
    id: "rocky-mountain",
    colorName: "Brown",
    colorKey: "brown",
    shapeName: "Mountain",
    shape: "mountain",
    fill: "#78716c",
    glow: "#a8a29e",
    speakLabel: "Mountain",
  }),
  tile({
    id: "sky-cloud",
    colorName: "White",
    colorKey: "white",
    shapeName: "Cloud",
    shape: "cloud",
    fill: "#e2e8f0",
    glow: "#f8fafc",
    speakLabel: "Cloud",
  }),
  tile({
    id: "bright-rainbow",
    colorName: "Rainbow",
    colorKey: "rainbow",
    shapeName: "Rainbow",
    shape: "rainbow",
    fill: "#a855f7",
    glow: "#f472b6",
    speakLabel: "Rainbow",
  }),
  tile({
    id: "blue-bird",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Bird",
    shape: "bird",
    fill: "#0ea5e9",
    glow: "#7dd3fc",
    speakLabel: "Bird",
  }),
];

/** Default export for level config — full pool; play session rotates a mix. */
export const LEVEL5_TILES: BloomTileKind[] = LEVEL5_ALL_NATURE;

/** Each Level 5 play uses 6 nature things, rotating through the bigger pool. */
export function level5TilesForPlay(playIndex: number): BloomTileKind[] {
  const pool = LEVEL5_ALL_NATURE;
  const take = 6;
  const start = (playIndex * 3) % pool.length;
  const out: BloomTileKind[] = [];
  for (let i = 0; i < take; i++) {
    out.push(pool[(start + i) % pool.length]!);
  }
  return out;
}

/* ——— Group 2 Curious Minds (Ages 4–6) ——— */

function fruitTile(
  id: string,
  name: string,
  shape: BloomShapeKind,
  colorName: string,
  colorKey: string,
  fill: string,
  glow: string,
  adjective: string,
): BloomTileKind {
  return tile({
    id,
    colorName,
    colorKey,
    shapeName: name,
    shape,
    fill,
    glow,
    speakLabel: `${adjective} ${name}`,
    category: "fruit",
  });
}

function veggieTile(
  id: string,
  name: string,
  shape: BloomShapeKind,
  colorName: string,
  colorKey: string,
  fill: string,
  glow: string,
  adjective: string,
): BloomTileKind {
  return tile({
    id,
    colorName,
    colorKey,
    shapeName: name,
    shape,
    fill,
    glow,
    speakLabel: `${adjective} ${name}`,
    category: "vegetable",
  });
}

function vehicleTile(
  id: string,
  name: string,
  shape: BloomShapeKind,
  colorName: string,
  colorKey: string,
  fill: string,
  glow: string,
  adjective: string,
): BloomTileKind {
  return tile({
    id,
    colorName,
    colorKey,
    shapeName: name,
    shape,
    fill,
    glow,
    speakLabel: `${adjective} ${name}`,
    category: "vehicle",
  });
}

/** Level 6 — Sweet & Crunchy Fruits (expanded set) */
export const LEVEL6_FRUITS: BloomTileKind[] = [
  fruitTile("fruit-apple", "Apple", "apple", "Red", "red", "#ef4444", "#fb7185", "Crunchy"),
  fruitTile("fruit-banana", "Banana", "banana", "Yellow", "yellow", "#eab308", "#fde047", "Tasty"),
  fruitTile("fruit-strawberry", "Strawberry", "strawberry", "Red", "red", "#dc2626", "#f87171", "Sweet"),
  fruitTile("fruit-orange", "Orange", "orange_fruit", "Orange", "orange", "#f97316", "#fdba74", "Juicy"),
  fruitTile("fruit-grapes", "Grapes", "grapes", "Purple", "purple", "#7c3aed", "#c4b5fd", "Yummy"),
  fruitTile("fruit-watermelon", "Watermelon", "watermelon", "Green", "green", "#16a34a", "#86efac", "Juicy"),
  fruitTile("fruit-mango", "Mango", "mango", "Orange", "orange", "#ea580c", "#fdba74", "Sweet"),
  fruitTile("fruit-pear", "Pear", "pear", "Green", "green", "#65a30d", "#bef264", "Fresh"),
  fruitTile("fruit-cherry", "Cherry", "cherry", "Red", "red", "#be123c", "#fb7185", "Sweet"),
  fruitTile("fruit-pineapple", "Pineapple", "pineapple", "Yellow", "yellow", "#ca8a04", "#facc15", "Tangy"),
  fruitTile("fruit-kiwi", "Kiwi", "kiwi", "Green", "green", "#4d7c0f", "#a3e635", "Fuzzy"),
  fruitTile("fruit-peach", "Peach", "peach", "Orange", "orange", "#fb923c", "#fdba74", "Soft"),
  fruitTile("fruit-lemon", "Lemon", "lemon", "Yellow", "yellow", "#facc15", "#fef08a", "Zesty"),
  fruitTile("fruit-blueberry", "Blueberry", "blueberry", "Blue", "blue", "#2563eb", "#93c5fd", "Tiny"),
];

/** Level 7 — Healthy Garden Vegetables (expanded set) */
export const LEVEL7_VEGGIES: BloomTileKind[] = [
  veggieTile("veg-carrot", "Carrot", "carrot", "Orange", "orange", "#f97316", "#fdba74", "Fresh"),
  veggieTile("veg-broccoli", "Broccoli", "broccoli", "Green", "green", "#16a34a", "#86efac", "Green"),
  veggieTile("veg-tomato", "Tomato", "tomato", "Red", "red", "#ef4444", "#fb7185", "Bright"),
  veggieTile("veg-corn", "Corn", "corn", "Yellow", "yellow", "#eab308", "#fde047", "Yummy"),
  veggieTile("veg-peas", "Peas", "peas", "Green", "green", "#22c55e", "#4ade80", "Little"),
  veggieTile("veg-pumpkin", "Pumpkin", "pumpkin", "Orange", "orange", "#ea580c", "#fb923c", "Round"),
  veggieTile("veg-cucumber", "Cucumber", "cucumber", "Green", "green", "#15803d", "#4ade80", "Cool"),
  veggieTile("veg-potato", "Potato", "potato", "Brown", "brown", "#a16207", "#fbbf24", "Tasty"),
  veggieTile("veg-onion", "Onion", "onion", "Purple", "purple", "#a855f7", "#d8b4fe", "Crunchy"),
  veggieTile("veg-cabbage", "Cabbage", "cabbage", "Green", "green", "#4d7c0f", "#a3e635", "Leafy"),
  veggieTile("veg-spinach", "Spinach", "spinach", "Green", "green", "#166534", "#86efac", "Leafy"),
  veggieTile("veg-pepper", "Pepper", "pepper", "Red", "red", "#dc2626", "#f87171", "Spicy"),
  veggieTile("veg-radish", "Radish", "radish", "Red", "red", "#e11d48", "#fb7185", "Crispy"),
  veggieTile("veg-eggplant", "Eggplant", "eggplant", "Purple", "purple", "#7c3aed", "#c4b5fd", "Shiny"),
];

/** Level 8 — Vehicles & Fast Transport (expanded set) */
export const LEVEL8_VEHICLES: BloomTileKind[] = [
  vehicleTile("veh-car", "Car", "car", "Red", "red", "#ef4444", "#fb7185", "Speedy"),
  vehicleTile("veh-airplane", "Airplane", "airplane", "Blue", "blue", "#3b82f6", "#93c5fd", "Flying"),
  vehicleTile("veh-rocket", "Rocket", "rocket", "Orange", "orange", "#f97316", "#fdba74", "Fast"),
  vehicleTile("veh-train", "Train", "train", "Green", "green", "#16a34a", "#86efac", "Choo-Choo"),
  vehicleTile("veh-boat", "Boat", "boat", "Cyan", "cyan", "#06b6d4", "#67e8f9", "Sailing"),
  vehicleTile("veh-bicycle", "Bicycle", "bicycle", "Yellow", "yellow", "#eab308", "#fde047", "Pedaling"),
  vehicleTile("veh-bus", "Bus", "bus", "Yellow", "yellow", "#ca8a04", "#facc15", "Big"),
  vehicleTile("veh-truck", "Truck", "truck", "Blue", "blue", "#2563eb", "#60a5fa", "Heavy"),
  vehicleTile("veh-helicopter", "Helicopter", "helicopter", "Red", "red", "#dc2626", "#f87171", "Spinning"),
  vehicleTile("veh-scooter", "Scooter", "scooter", "Green", "green", "#22c55e", "#4ade80", "Zippy"),
  vehicleTile("veh-submarine", "Submarine", "submarine", "Purple", "purple", "#7c3aed", "#c4b5fd", "Deep"),
  vehicleTile("veh-taxi", "Taxi", "taxi", "Yellow", "yellow", "#facc15", "#fef08a", "Busy"),
];

/** Level 9 / 10 shared food pool (fruits + vegetables) */
export const LEVEL9_FOOD: BloomTileKind[] = [
  ...LEVEL6_FRUITS,
  ...LEVEL7_VEGGIES,
];

/** Rotate 6 fruits each Level 6 play so boards stay readable. */
export function level6TilesForPlay(playIndex: number): BloomTileKind[] {
  const pool = LEVEL6_FRUITS;
  const take = 6;
  const start = (playIndex * 2) % pool.length;
  const out: BloomTileKind[] = [];
  for (let i = 0; i < take; i++) out.push(pool[(start + i) % pool.length]!);
  return out;
}

export function level7TilesForPlay(playIndex: number): BloomTileKind[] {
  const pool = LEVEL7_VEGGIES;
  const take = 6;
  const start = (playIndex * 2) % pool.length;
  const out: BloomTileKind[] = [];
  for (let i = 0; i < take; i++) out.push(pool[(start + i) % pool.length]!);
  return out;
}

export function level8TilesForPlay(playIndex: number): BloomTileKind[] {
  const pool = LEVEL8_VEHICLES;
  const take = 6;
  const start = (playIndex * 2) % pool.length;
  const out: BloomTileKind[] = [];
  for (let i = 0; i < take; i++) out.push(pool[(start + i) % pool.length]!);
  return out;
}

const CATEGORY_ROTATION: Extract<BloomChallenge, { type: "category" }>[] = [
  {
    type: "category",
    categoryKey: "vegetable",
    banner: "Blast only VEGETABLES!",
  },
  {
    type: "category",
    categoryKey: "fruit",
    banner: "Blast only FRUITS!",
  },
];

const COLOR_CATEGORY_ROTATION: Extract<
  BloomChallenge,
  { type: "colorCategory" }
>[] = [
  {
    type: "colorCategory",
    colorKey: "green",
    categoryKey: "vegetable",
    banner: "Blast only GREEN VEGETABLES!",
  },
  {
    type: "colorCategory",
    colorKey: "red",
    categoryKey: "fruit",
    banner: "Blast only RED FRUITS!",
  },
  {
    type: "colorCategory",
    colorKey: "yellow",
    categoryKey: "fruit",
    banner: "Blast only YELLOW FRUITS!",
  },
  {
    type: "colorCategory",
    colorKey: "orange",
    categoryKey: "vegetable",
    banner: "Blast only ORANGE VEGETABLES!",
  },
  {
    type: "colorCategory",
    colorKey: "red",
    categoryKey: "vegetable",
    banner: "Blast only RED VEGETABLES!",
  },
  {
    type: "colorCategory",
    colorKey: "purple",
    categoryKey: "fruit",
    banner: "Blast only PURPLE FRUITS!",
  },
];

/* ——— Group 3 Master Champions (Ages 6–9) ——— */

export const LEVEL11_SPACE: BloomTileKind[] = [
  tile({
    id: "space-sun",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Sun",
    shape: "sun",
    fill: "#f59e0b",
    glow: "#fde047",
    speakLabel: "Sun... Hot Star",
  }),
  tile({
    id: "space-earth",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Earth",
    shape: "earth_planet",
    fill: "#2563eb",
    glow: "#22c55e",
    speakLabel: "Planet Earth... Our Home",
  }),
  tile({
    id: "space-moon",
    colorName: "Silver",
    colorKey: "silver",
    shapeName: "Moon",
    shape: "moon",
    fill: "#e2e8f0",
    glow: "#94a3b8",
    speakLabel: "Moon... Night Light",
  }),
  tile({
    id: "space-saturn",
    colorName: "Gold",
    colorKey: "gold",
    shapeName: "Saturn",
    shape: "saturn",
    fill: "#d97706",
    glow: "#fbbf24",
    speakLabel: "Saturn... Beautiful Rings",
  }),
  tile({
    id: "space-shooting-star",
    colorName: "Cyan",
    colorKey: "cyan",
    shapeName: "Shooting Star",
    shape: "shooting_star",
    fill: "#67e8f9",
    glow: "#a5f3fc",
    speakLabel: "Shooting Star... Speedy Light",
  }),
  tile({
    id: "space-rain-cloud",
    colorName: "Gray",
    colorKey: "gray",
    shapeName: "Rain Cloud",
    shape: "rain_cloud",
    fill: "#64748b",
    glow: "#38bdf8",
    speakLabel: "Rain Cloud... Water Cycle",
  }),
  tile({
    id: "space-cloud",
    colorName: "White",
    colorKey: "white",
    shapeName: "Cloud",
    shape: "cloud",
    fill: "#f8fafc",
    glow: "#cbd5e1",
    speakLabel: "Cloud... Soft Sky",
  }),
  tile({
    id: "space-star",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Star",
    shape: "star",
    fill: "#facc15",
    glow: "#fef08a",
    speakLabel: "Bright Star... Far Away",
  }),
];

export function level11TilesForPlay(playIndex: number): BloomTileKind[] {
  const pool = LEVEL11_SPACE;
  const take = 6;
  const start = (playIndex * 2) % pool.length;
  const out: BloomTileKind[] = [];
  for (let i = 0; i < take; i++) out.push(pool[(start + i) % pool.length]!);
  return out;
}

export const LEVEL12_PLANTS: BloomTileKind[] = [
  tile({
    id: "plant-leaf",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Green Leaf",
    shape: "leaf",
    fill: "#16a34a",
    glow: "#86efac",
    speakLabel: "Green Leaf makes food",
    plantPart: "leaf",
  }),
  tile({
    id: "plant-roots",
    colorName: "Brown",
    colorKey: "brown",
    shapeName: "Roots",
    shape: "roots",
    fill: "#92400e",
    glow: "#fbbf24",
    speakLabel: "Roots drink water",
    plantPart: "root",
  }),
  tile({
    id: "plant-petal",
    colorName: "Pink",
    colorKey: "pink",
    shapeName: "Flower Petal",
    shape: "petal",
    fill: "#ec4899",
    glow: "#f9a8d4",
    speakLabel: "Flower Petal attracts bees",
    plantPart: "petal",
  }),
  tile({
    id: "plant-seed",
    colorName: "Tan",
    colorKey: "tan",
    shapeName: "Seed",
    shape: "seed",
    fill: "#a16207",
    glow: "#fde68a",
    speakLabel: "Seed grows a plant",
    plantPart: "seed",
  }),
  tile({
    id: "plant-stem",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Stem",
    shape: "stem_plant",
    fill: "#15803d",
    glow: "#4ade80",
    speakLabel: "Stem holds the plant",
    plantPart: "stem",
  }),
];

const PLANT_PART_ROTATION: Extract<BloomChallenge, { type: "plantPart" }>[] = [
  {
    type: "plantPart",
    partKey: "root",
    banner: "Blast the parts that absorb water!",
  },
  {
    type: "plantPart",
    partKey: "leaf",
    banner: "Blast the Green Leaf!",
  },
  {
    type: "plantPart",
    partKey: "petal",
    banner: "Blast the Flower Petal!",
  },
  {
    type: "plantPart",
    partKey: "seed",
    banner: "Blast the Seed!",
  },
  {
    type: "plantPart",
    partKey: "stem",
    banner: "Blast the Stem!",
  },
];

export const LEVEL13_LIVING: BloomTileKind[] = [
  tile({
    id: "live-human",
    colorName: "Peach",
    colorKey: "peach",
    shapeName: "Human",
    shape: "human",
    fill: "#fdba74",
    glow: "#fed7aa",
    speakLabel: "Living thing",
    living: true,
  }),
  tile({
    id: "live-fish",
    colorName: "Cyan",
    colorKey: "cyan",
    shapeName: "Fish",
    shape: "fish",
    fill: "#06b6d4",
    glow: "#67e8f9",
    speakLabel: "Living thing",
    living: true,
  }),
  tile({
    id: "live-bird",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Bird",
    shape: "bird",
    fill: "#0ea5e9",
    glow: "#7dd3fc",
    speakLabel: "Living thing",
    living: true,
  }),
  tile({
    id: "live-tree",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Tree",
    shape: "tree",
    fill: "#16a34a",
    glow: "#86efac",
    speakLabel: "Living thing",
    living: true,
  }),
  tile({
    id: "live-flower",
    colorName: "Pink",
    colorKey: "pink",
    shapeName: "Flower",
    shape: "flower",
    fill: "#ec4899",
    glow: "#f9a8d4",
    speakLabel: "Living thing",
    living: true,
  }),
  tile({
    id: "live-bug",
    colorName: "Green",
    colorKey: "green",
    shapeName: "Bug",
    shape: "bug",
    fill: "#65a30d",
    glow: "#bef264",
    speakLabel: "Living thing",
    living: true,
  }),
  tile({
    id: "live-boy",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Boy",
    shape: "boy",
    fill: "#3b82f6",
    glow: "#93c5fd",
    speakLabel: "Living thing",
    living: true,
  }),
  tile({
    id: "live-girl",
    colorName: "Pink",
    colorKey: "pink",
    shapeName: "Girl",
    shape: "girl",
    fill: "#f472b6",
    glow: "#fbcfe8",
    speakLabel: "Living thing",
    living: true,
  }),
];

export const LEVEL13_NONLIVING: BloomTileKind[] = [
  tile({
    id: "nl-rock",
    colorName: "Gray",
    colorKey: "gray",
    shapeName: "Rock",
    shape: "rock",
    fill: "#78716c",
    glow: "#a8a29e",
    speakLabel: "Non living thing",
    living: false,
  }),
  tile({
    id: "nl-car",
    colorName: "Red",
    colorKey: "red",
    shapeName: "Car",
    shape: "car",
    fill: "#ef4444",
    glow: "#fb7185",
    speakLabel: "Non living thing",
    living: false,
  }),
  tile({
    id: "nl-sun",
    colorName: "Yellow",
    colorKey: "yellow",
    shapeName: "Sun",
    shape: "sun",
    fill: "#f59e0b",
    glow: "#fde047",
    speakLabel: "Non living thing",
    living: false,
  }),
  tile({
    id: "nl-mountain",
    colorName: "Slate",
    colorKey: "slate",
    shapeName: "Mountain",
    shape: "mountain",
    fill: "#64748b",
    glow: "#94a3b8",
    speakLabel: "Non living thing",
    living: false,
  }),
  tile({
    id: "nl-cloud",
    colorName: "White",
    colorKey: "white",
    shapeName: "Cloud",
    shape: "cloud",
    fill: "#f1f5f9",
    glow: "#cbd5e1",
    speakLabel: "Non living thing",
    living: false,
  }),
  tile({
    id: "nl-book",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Book",
    shape: "book",
    fill: "#2563eb",
    glow: "#93c5fd",
    speakLabel: "Non living thing",
    living: false,
  }),
  tile({
    id: "nl-house",
    colorName: "Orange",
    colorKey: "orange",
    shapeName: "House",
    shape: "house",
    fill: "#ea580c",
    glow: "#fdba74",
    speakLabel: "Non living thing",
    living: false,
  }),
  tile({
    id: "nl-chair",
    colorName: "Brown",
    colorKey: "brown",
    shapeName: "Chair",
    shape: "chair",
    fill: "#a16207",
    glow: "#fbbf24",
    speakLabel: "Non living thing",
    living: false,
  }),
];

export const LEVEL13_MIX: BloomTileKind[] = [
  ...LEVEL13_LIVING,
  ...LEVEL13_NONLIVING,
];

const LIVING_ROTATION: Extract<BloomChallenge, { type: "living" }>[] = [
  {
    type: "living",
    living: true,
    banner: "Blast only LIVING things!",
  },
  {
    type: "living",
    living: false,
    banner: "Blast only NON-LIVING things!",
  },
];

export const LEVEL14_MATTER: BloomTileKind[] = [
  tile({
    id: "matter-ice",
    colorName: "Cyan",
    colorKey: "cyan",
    shapeName: "Ice",
    shape: "ice_cube",
    fill: "#67e8f9",
    glow: "#a5f3fc",
    speakLabel: "Ice is a Solid",
    matterState: "solid",
  }),
  tile({
    id: "matter-wood",
    colorName: "Brown",
    colorKey: "brown",
    shapeName: "Wood",
    shape: "wood_block",
    fill: "#92400e",
    glow: "#fbbf24",
    speakLabel: "Wood is a Solid",
    matterState: "solid",
  }),
  tile({
    id: "matter-rock",
    colorName: "Gray",
    colorKey: "gray",
    shapeName: "Rock",
    shape: "rock",
    fill: "#57534e",
    glow: "#a8a29e",
    speakLabel: "Rock is a Solid",
    matterState: "solid",
  }),
  tile({
    id: "matter-water",
    colorName: "Blue",
    colorKey: "blue",
    shapeName: "Water",
    shape: "water_splash",
    fill: "#2563eb",
    glow: "#93c5fd",
    speakLabel: "Water is a Liquid",
    matterState: "liquid",
  }),
  tile({
    id: "matter-juice",
    colorName: "Orange",
    colorKey: "orange",
    shapeName: "Juice",
    shape: "juice_bottle",
    fill: "#f97316",
    glow: "#fdba74",
    speakLabel: "Juice is a Liquid",
    matterState: "liquid",
  }),
  tile({
    id: "matter-milk",
    colorName: "White",
    colorKey: "white",
    shapeName: "Milk",
    shape: "milk_bottle",
    fill: "#f8fafc",
    glow: "#e2e8f0",
    speakLabel: "Milk is a Liquid",
    matterState: "liquid",
  }),
  tile({
    id: "matter-steam",
    colorName: "Gray",
    colorKey: "gray",
    shapeName: "Steam",
    shape: "steam",
    fill: "#94a3b8",
    glow: "#cbd5e1",
    speakLabel: "Steam is a Gas",
    matterState: "gas",
  }),
  tile({
    id: "matter-balloon",
    colorName: "Red",
    colorKey: "red",
    shapeName: "Balloon",
    shape: "helium_balloon",
    fill: "#ef4444",
    glow: "#fb7185",
    speakLabel: "Balloon is a Gas",
    matterState: "gas",
  }),
  tile({
    id: "matter-smoke",
    colorName: "Slate",
    colorKey: "slate",
    shapeName: "Smoke",
    shape: "smoke",
    fill: "#64748b",
    glow: "#94a3b8",
    speakLabel: "Smoke is a Gas",
    matterState: "gas",
  }),
];

const MATTER_ROTATION: Extract<BloomChallenge, { type: "matter" }>[] = [
  {
    type: "matter",
    state: "liquid",
    banner: "Blast only LIQUIDS!",
  },
  {
    type: "matter",
    state: "solid",
    banner: "Blast only SOLIDS!",
  },
  {
    type: "matter",
    state: "gas",
    banner: "Blast only GASES!",
  },
];

function wordGem(
  word: string,
  speechPart: BloomSpeechPart,
  fill: string,
  glow: string,
): BloomTileKind {
  const partLabel =
    speechPart === "adjective"
      ? "an Adjective"
      : speechPart === "verb"
        ? "an Action Verb"
        : "a Noun";
  return tile({
    id: `word-${word.toLowerCase()}`,
    colorName: speechPart,
    colorKey: speechPart,
    shapeName: word,
    shape: "word_gem",
    fill,
    glow,
    speakLabel: `${word} is ${partLabel}`,
    speechPart,
    displayWord: word,
  });
}

export const LEVEL15_WORDS: BloomTileKind[] = [
  wordGem("Fluffy", "adjective", "#a855f7", "#d8b4fe"),
  wordGem("Shiny", "adjective", "#eab308", "#fde047"),
  wordGem("Cold", "adjective", "#06b6d4", "#67e8f9"),
  wordGem("Loud", "adjective", "#ef4444", "#fb7185"),
  wordGem("Quick", "adjective", "#22c55e", "#86efac"),
  wordGem("Sweet", "adjective", "#ec4899", "#f9a8d4"),
  wordGem("Running", "verb", "#3b82f6", "#93c5fd"),
  wordGem("Jumping", "verb", "#f97316", "#fdba74"),
  wordGem("Singing", "verb", "#8b5cf6", "#c4b5fd"),
  wordGem("Dancing", "verb", "#db2777", "#f9a8d4"),
  wordGem("Sleeping", "verb", "#6366f1", "#a5b4fc"),
  wordGem("Swimming", "verb", "#0ea5e9", "#7dd3fc"),
  wordGem("Book", "noun", "#64748b", "#94a3b8"),
  wordGem("Chair", "noun", "#78716c", "#a8a29e"),
  wordGem("Dog", "noun", "#a16207", "#fbbf24"),
  wordGem("Tree", "noun", "#166534", "#86efac"),
];

const SPEECH_ROTATION: Extract<BloomChallenge, { type: "speechPart" }>[] = [
  {
    type: "speechPart",
    part: "adjective",
    banner: "Blast the ADJECTIVES!",
  },
  {
    type: "speechPart",
    part: "verb",
    banner: "Blast the VERBS!",
  },
];

function mathEq(
  expr: string,
  value: number,
  speak: string,
  fill: string,
  glow: string,
): BloomTileKind {
  const slug = expr.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return tile({
    id: `math-${slug}-${value}`,
    colorName: "Math",
    colorKey: "math",
    shapeName: expr,
    shape: "math_bubble",
    fill,
    glow,
    speakLabel: speak,
    displayWord: expr,
    mathValue: value,
  });
}

/** Level 16 — equation bubbles for rotating targets 10 / 12 / 15 / 20 / 30 */
export const LEVEL16_MATH: BloomTileKind[] = [
  // Target 10
  mathEq("5 × 2", 10, "5 times 2 is 10", "#3b82f6", "#93c5fd"),
  mathEq("7 + 3", 10, "7 plus 3 is 10", "#22c55e", "#86efac"),
  mathEq("20 ÷ 2", 10, "20 divided by 2 is 10", "#a855f7", "#d8b4fe"),
  mathEq("14 - 4", 10, "14 minus 4 is 10", "#f97316", "#fdba74"),
  mathEq("6 + 4", 10, "6 plus 4 is 10", "#06b6d4", "#67e8f9"),
  // Target 12
  mathEq("6 × 2", 12, "6 times 2 is 12", "#2563eb", "#60a5fa"),
  mathEq("9 + 3", 12, "9 plus 3 is 12", "#16a34a", "#4ade80"),
  mathEq("15 - 3", 12, "15 minus 3 is 12", "#ea580c", "#fb923c"),
  mathEq("4 × 3", 12, "4 times 3 is 12", "#7c3aed", "#c4b5fd"),
  mathEq("10 + 2", 12, "10 plus 2 is 12", "#0891b2", "#22d3ee"),
  // Target 15
  mathEq("5 × 3", 15, "5 times 3 is 15", "#1d4ed8", "#93c5fd"),
  mathEq("10 + 5", 15, "10 plus 5 is 15", "#15803d", "#86efac"),
  mathEq("20 - 5", 15, "20 minus 5 is 15", "#c2410c", "#fdba74"),
  mathEq("3 × 5", 15, "3 times 5 is 15", "#6d28d9", "#c4b5fd"),
  mathEq("12 + 3", 15, "12 plus 3 is 15", "#0e7490", "#67e8f9"),
  // Target 20
  mathEq("4 × 5", 20, "4 times 5 is 20", "#1e40af", "#60a5fa"),
  mathEq("10 + 10", 20, "10 plus 10 is 20", "#166534", "#4ade80"),
  mathEq("25 - 5", 20, "25 minus 5 is 20", "#9a3412", "#fb923c"),
  mathEq("2 × 10", 20, "2 times 10 is 20", "#5b21b6", "#a78bfa"),
  mathEq("16 + 4", 20, "16 plus 4 is 20", "#155e75", "#22d3ee"),
  // Target 30
  mathEq("5 × 6", 30, "5 times 6 is 30", "#1e3a8a", "#93c5fd"),
  mathEq("20 + 10", 30, "20 plus 10 is 30", "#14532d", "#86efac"),
  mathEq("35 - 5", 30, "35 minus 5 is 30", "#7c2d12", "#fdba74"),
  mathEq("3 × 10", 30, "3 times 10 is 30", "#4c1d95", "#c4b5fd"),
  mathEq("15 + 15", 30, "15 plus 15 is 30", "#164e63", "#67e8f9"),
  // Distractors (never equal 10/12/15/20/30 — always blockers vs those targets)
  mathEq("3 × 3", 9, "3 times 3 is 9", "#64748b", "#94a3b8"),
  mathEq("5 + 4", 9, "5 plus 4 is 9", "#78716c", "#a8a29e"),
  mathEq("2 × 4", 8, "2 times 4 is 8", "#57534e", "#a8a29e"),
  mathEq("12 - 5", 7, "12 minus 5 is 7", "#44403c", "#a8a29e"),
  mathEq("4 + 2", 6, "4 plus 2 is 6", "#52525b", "#a1a1aa"),
  mathEq("11 + 2", 13, "11 plus 2 is 13", "#71717a", "#d4d4d8"),
  mathEq("8 × 2", 16, "8 times 2 is 16", "#6b7280", "#d1d5db"),
  mathEq("9 + 9", 18, "9 plus 9 is 18", "#737373", "#d4d4d4"),
];

const MATH_TARGET_ROTATION: Extract<
  BloomChallenge,
  { type: "mathTarget" }
>[] = [
  { type: "mathTarget", target: 10, banner: "Target: 10" },
  { type: "mathTarget", target: 12, banner: "Target: 12" },
  { type: "mathTarget", target: 15, banner: "Target: 15" },
  { type: "mathTarget", target: 20, banner: "Target: 20" },
  { type: "mathTarget", target: 30, banner: "Target: 30" },
];

export const BLOOM_AGE_GROUPS: BloomAgeGroup[] = [
  {
    id: 1,
    title: "Tiny Explorers",
    ages: "Ages 2 to 4",
    blurb: "Primary shapes, colors, and big vs small — 5 fun levels!",
    enabled: true,
    levelIds: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    title: "Curious Minds",
    ages: "Ages 4 to 6",
    blurb: "Fruits, veggies, vehicles & category blasts — swipe to swap!",
    enabled: true,
    levelIds: [6, 7, 8, 9, 10],
  },
  {
    id: 3,
    title: "Master Champions",
    ages: "Ages 6 to 9",
    blurb: "Space, plants, matter, grammar & math — swipe to swap!",
    enabled: true,
    levelIds: [11, 12, 13, 14, 15, 16],
  },
];

export const BLOOM_LEVELS: BloomLevelConfig[] = [
  {
    id: 1,
    group: 1,
    groupLevel: 1,
    title: "Primary Shapes",
    blurb: "Move boxes to make 3 matching shapes — Red Circle… BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 10,
    tiles: LEVEL1_TILES,
    challenge: { type: "none" },
  },
  {
    id: 2,
    group: 1,
    groupLevel: 2,
    title: "Extended Shapes",
    blurb: "Stars, hearts, ovals & diamonds — Yellow Star… BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 10,
    tiles: LEVEL2_TILES,
    challenge: { type: "none" },
  },
  {
    id: 3,
    group: 1,
    groupLevel: 3,
    title: "Blue Only!",
    blurb: "Blast only BLUE shapes — ignore the other colors!",
    enabled: true,
    gridSize: 5,
    targetMatches: 8,
    tiles: LEVEL3_TILES,
    challenge: {
      type: "color",
      colorKey: "blue",
      banner: "Blast only BLUE! 💙",
    },
  },
  {
    id: 4,
    group: 1,
    groupLevel: 4,
    title: "Big vs Small",
    blurb:
      "Line up any 3 BIG / TALL (or SHORT / SMALL / TINY) shapes — many shapes each play!",
    enabled: true,
    gridSize: 5,
    targetMatches: 6,
    tiles: LEVEL4_TILES,
    challenge: {
      type: "size",
      size: "big",
      sizeLabel: "BIG",
      banner: "Blast only BIG shapes! 🔲",
    },
  },
  {
    id: 5,
    group: 1,
    groupLevel: 5,
    title: "Nature Mix",
    blurb:
      "Nature friends — Sun, Moon, Flower, Tree, Leaf, Mountain, Cloud, Rainbow, Bird! Each play mixes new ones. 12 BOOMs to win!",
    enabled: true,
    gridSize: 5,
    targetMatches: 12,
    tiles: LEVEL5_TILES,
    challenge: { type: "none" },
  },
  {
    id: 6,
    group: 2,
    groupLevel: 1,
    title: "Sweet & Crunchy Fruits",
    blurb: "Match 3 of the same fruit — Crunchy Apple… BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 10,
    tiles: LEVEL6_FRUITS,
    challenge: { type: "none" },
  },
  {
    id: 7,
    group: 2,
    groupLevel: 2,
    title: "Healthy Garden Vegetables",
    blurb: "Match 3 of the same veggie — Fresh Carrot… BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 10,
    tiles: LEVEL7_VEGGIES,
    challenge: { type: "none" },
  },
  {
    id: 8,
    group: 2,
    groupLevel: 3,
    title: "Vehicles & Fast Transport",
    blurb: "Match 3 of the same vehicle — Speedy Car… BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 10,
    tiles: LEVEL8_VEHICLES,
    challenge: { type: "none" },
  },
  {
    id: 9,
    group: 2,
    groupLevel: 4,
    title: "Category Challenge",
    blurb: "Blast only VEGETABLES or only FRUITS — it changes each play!",
    enabled: true,
    gridSize: 5,
    targetMatches: 8,
    tiles: LEVEL9_FOOD,
    challenge: {
      type: "category",
      categoryKey: "vegetable",
      banner: "Blast only VEGETABLES!",
    },
  },
  {
    id: 10,
    group: 2,
    groupLevel: 5,
    title: "Color + Category Combo",
    blurb: "Blast only GREEN VEGETABLES or RED FRUITS — two clues at once!",
    enabled: true,
    gridSize: 5,
    targetMatches: 8,
    tiles: LEVEL9_FOOD,
    challenge: {
      type: "colorCategory",
      colorKey: "green",
      categoryKey: "vegetable",
      banner: "Blast only GREEN VEGETABLES!",
    },
  },
  {
    id: 11,
    group: 3,
    groupLevel: 1,
    title: "Outer Space and Sky",
    blurb: "Match space friends — Sun... Hot Star... BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 10,
    tiles: LEVEL11_SPACE,
    challenge: { type: "none" },
  },
  {
    id: 12,
    group: 3,
    groupLevel: 2,
    title: "Plant Biology",
    blurb: "Blast the plant part on the banner — Roots drink water… BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 8,
    tiles: LEVEL12_PLANTS,
    challenge: {
      type: "plantPart",
      partKey: "root",
      banner: "Blast the parts that absorb water!",
    },
  },
  {
    id: 13,
    group: 3,
    groupLevel: 3,
    title: "Living and Non-Living",
    blurb: "Blast only living or non-living things — it changes each play!",
    enabled: true,
    gridSize: 5,
    targetMatches: 8,
    tiles: LEVEL13_MIX,
    challenge: {
      type: "living",
      living: true,
      banner: "Blast only LIVING things!",
    },
  },
  {
    id: 14,
    group: 3,
    groupLevel: 4,
    title: "States of Matter",
    blurb: "Blast only solids, liquids, or gases — learn the science!",
    enabled: true,
    gridSize: 5,
    targetMatches: 8,
    tiles: LEVEL14_MATTER,
    challenge: {
      type: "matter",
      state: "liquid",
      banner: "Blast only LIQUIDS!",
    },
  },
  {
    id: 15,
    group: 3,
    groupLevel: 5,
    title: "Parts of Speech",
    blurb: "Blast adjectives or verbs — Fluffy is an Adjective… BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 8,
    tiles: LEVEL15_WORDS,
    challenge: {
      type: "speechPart",
      part: "adjective",
      banner: "Blast the ADJECTIVES!",
    },
  },
  {
    id: 16,
    group: 3,
    groupLevel: 6,
    title: "Rapid Equation Balloons",
    blurb: "Blast equations that equal the Target number… BOOM!",
    enabled: true,
    gridSize: 5,
    targetMatches: 8,
    tiles: LEVEL16_MATH,
    challenge: {
      type: "mathTarget",
      target: 10,
      banner: "Target: 10",
    },
  },
];

export function getBloomLevel(id: number): BloomLevelConfig | undefined {
  return BLOOM_LEVELS.find((l) => l.id === id);
}

export function getBloomAgeGroup(id: number): BloomAgeGroup | undefined {
  return BLOOM_AGE_GROUPS.find((g) => g.id === id);
}

export function getLevelsForGroup(groupId: number): BloomLevelConfig[] {
  return BLOOM_LEVELS.filter((l) => l.group === groupId);
}

const UNLOCK_KEY = "bloom-blast-unlocked-level";

export function readUnlockedLevel(): number {
  if (typeof window === "undefined") return 1;
  try {
    const n = Number(localStorage.getItem(UNLOCK_KEY) || "1");
    return Number.isFinite(n) && n >= 1 ? Math.min(16, Math.floor(n)) : 1;
  } catch {
    return 1;
  }
}

export function writeUnlockedLevel(levelId: number) {
  if (typeof window === "undefined") return;
  try {
    const prev = readUnlockedLevel();
    const next = Math.max(prev, Math.min(16, Math.floor(levelId)));
    localStorage.setItem(UNLOCK_KEY, String(next));
  } catch {
    // ignore
  }
}

/** Rotate learning focus each time the kid starts the same level (all groups). */
const PLAY_ROTATION_KEY = "bloom-blast-play-rotation";

const COLOR_ROTATION: Extract<BloomChallenge, { type: "color" }>[] = [
  { type: "color", colorKey: "blue", banner: "Blast only BLUE! 💙" },
  { type: "color", colorKey: "yellow", banner: "Blast only YELLOW! 💛" },
  { type: "color", colorKey: "red", banner: "Blast only RED! ❤️" },
  { type: "color", colorKey: "green", banner: "Blast only GREEN! 💚" },
];

const SIZE_ROTATION: Extract<BloomChallenge, { type: "size" }>[] = [
  {
    type: "size",
    size: "big",
    sizeLabel: "BIG",
    banner: "Find the BIG ones! (look — much bigger)",
  },
  {
    type: "size",
    size: "big",
    sizeLabel: "TALL",
    banner: "Find the TALL ones! (look — much taller)",
  },
  {
    type: "size",
    size: "small",
    sizeLabel: "SHORT",
    banner: "Find the SHORT ones! (look — much shorter)",
  },
  {
    type: "size",
    size: "small",
    sizeLabel: "SMALL",
    banner: "Find the SMALL ones! (look — much smaller)",
  },
  {
    type: "size",
    size: "small",
    sizeLabel: "TINY",
    banner: "Find the TINY ones! (look — teeny tiny)",
  },
  {
    type: "size",
    size: "big",
    sizeLabel: "FAT",
    banner: "Find the FAT ones! (look — much wider)",
  },
  {
    type: "size",
    size: "small",
    sizeLabel: "THIN",
    banner: "Find the THIN ones! (look — much skinnier)",
  },
];

function readRotationIndex(levelId: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(PLAY_ROTATION_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const n = Number(map[String(levelId)] ?? 0);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function writeRotationIndex(levelId: number, index: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PLAY_ROTATION_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    map[String(levelId)] = index;
    localStorage.setItem(PLAY_ROTATION_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Level 1: unlock more shapes each replay (shape names only for TTS). */
function level1TilesForPlay(playIndex: number): BloomTileKind[] {
  const circle = LEVEL1_TILES[0]!;
  const square = LEVEL1_TILES[1]!;
  const triangle = LEVEL1_TILES[2]!;
  const star = LEVEL1_TILES[3]!;
  const heart = LEVEL2_TILES[1]!;
  const oval = LEVEL2_TILES[2]!;
  const diamond = LEVEL2_TILES[3]!;
  const stages: BloomTileKind[][] = [
    [circle, square, triangle],
    [circle, square, triangle, star],
    [circle, square, triangle, star, heart],
    [circle, square, triangle, star, heart, oval],
    [circle, square, triangle, star, heart, oval, diamond],
  ];
  const stage = stages[Math.min(playIndex, stages.length - 1)]!;
  // Voice / UI label = shape only (Circle… BOOM!) — no color adjective
  return stage.map((t) => ({ ...t, speakLabel: t.shapeName }));
}

/**
 * Boom TTS text for this level’s learning focus.
 * L1 = shape only · L2 = adjective+shape · L3 = colour · L6–8 = adjective+item ·
 * L9 category = "Blast vegetables/fruits" only (not each item name) ·
 * L10 = color + category · else speakLabel
 */
export function boomVoiceLabel(
  level: BloomLevelConfig,
  kind: BloomTileKind,
): string {
  if (level.id === 1) return kind.shapeName;
  if (level.challenge.type === "color") {
    const key = level.challenge.colorKey;
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
  if (level.challenge.type === "size") {
    // Level 4 teaches size words only: "Small… BOOM!" / "Tall… BOOM!"
    const label =
      level.challenge.sizeLabel ??
      (level.challenge.size === "big" ? "Big" : "Small");
    return label.charAt(0) + label.slice(1).toLowerCase();
  }
  // Group 2 Level 4 (L9): mixed board — say the category only
  if (level.challenge.type === "category") {
    if (level.challenge.categoryKey === "fruit") return "Blast fruits";
    if (level.challenge.categoryKey === "vegetable") return "Blast vegetables";
    return "Blast vehicles";
  }
  if (level.challenge.type === "colorCategory") {
    const color =
      level.challenge.colorKey.charAt(0).toUpperCase() +
      level.challenge.colorKey.slice(1);
    const cat =
      level.challenge.categoryKey === "fruit"
        ? "fruits"
        : level.challenge.categoryKey === "vegetable"
          ? "vegetables"
          : "vehicles";
    return `Blast ${color.toLowerCase()} ${cat}`;
  }
  if (level.challenge.type === "living") {
    return level.challenge.living ? "Living thing" : "Non living thing";
  }
  if (level.challenge.type === "plantPart") {
    return kind.speakLabel;
  }
  if (level.challenge.type === "matter") {
    return kind.speakLabel;
  }
  if (level.challenge.type === "speechPart") {
    return kind.speakLabel;
  }
  if (level.challenge.type === "mathTarget") {
    return kind.speakLabel;
  }
  // TTS misreads bare "Sun" as "Sunday" — keep Group 1/5 safe; L11 uses fact labels
  if (kind.shape === "sun" && /^sun$/i.test(kind.speakLabel.trim())) {
    return "Bright sun";
  }
  return kind.speakLabel;
}

/**
 * Each time a level starts, advance learning focus.
 * L1: more shapes each play · L3: rotate colour · L4: rotate size word · L2 unchanged style
 */
export function beginPlaySession(levelId: number): BloomLevelConfig {
  const base = getBloomLevel(levelId) ?? getBloomLevel(1)!;
  const playIndex = readRotationIndex(levelId);

  // Level 1 — progressive shapes; TTS is shape-only
  if (base.id === 1) {
    const tiles = level1TilesForPlay(playIndex);
    writeRotationIndex(levelId, playIndex + 1);
    const names = tiles.map((t) => t.shapeName).join(", ");
    return {
      ...base,
      tiles,
      blurb: `Make 3 matching shapes — ${names}!`,
    };
  }

  // Level 5 — rotate nature mix (includes Cloud, Rainbow, Bird) so each play feels new
  if (base.id === 5) {
    const tiles = level5TilesForPlay(playIndex);
    writeRotationIndex(levelId, playIndex + 1);
    const names = tiles.map((t) => t.shapeName).join(", ");
    return {
      ...base,
      tiles,
      blurb: `This nature mix: ${names} — make 3 of the same… BOOM!`,
    };
  }

  // Level 6 — rotate fruit pack
  if (base.id === 6) {
    const tiles = level6TilesForPlay(playIndex);
    writeRotationIndex(levelId, playIndex + 1);
    const names = tiles.map((t) => t.shapeName).join(", ");
    return {
      ...base,
      tiles,
      blurb: `This fruit mix: ${names} — match 3 of the same… BOOM!`,
    };
  }

  // Level 7 — rotate vegetable pack
  if (base.id === 7) {
    const tiles = level7TilesForPlay(playIndex);
    writeRotationIndex(levelId, playIndex + 1);
    const names = tiles.map((t) => t.shapeName).join(", ");
    return {
      ...base,
      tiles,
      blurb: `This veggie mix: ${names} — match 3 of the same… BOOM!`,
    };
  }

  // Level 8 — rotate vehicle pack
  if (base.id === 8) {
    const tiles = level8TilesForPlay(playIndex);
    writeRotationIndex(levelId, playIndex + 1);
    const names = tiles.map((t) => t.shapeName).join(", ");
    return {
      ...base,
      tiles,
      blurb: `This vehicle mix: ${names} — match 3 of the same… BOOM!`,
    };
  }

  // Level 9 — rotate Blast only VEGETABLES ↔ FRUITS
  if (base.challenge.type === "category") {
    const challenge = CATEGORY_ROTATION[playIndex % CATEGORY_ROTATION.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    const word =
      challenge.categoryKey === "fruit"
        ? "FRUITS"
        : challenge.categoryKey === "vegetable"
          ? "VEGETABLES"
          : "VEHICLES";
    return {
      ...base,
      challenge,
      title: `Blast only ${word}!`,
      blurb: `Mixed fruits and veggies — blast only ${word}!`,
    };
  }

  // Level 10 — rotate color + category double filter
  if (base.challenge.type === "colorCategory") {
    const challenge =
      COLOR_CATEGORY_ROTATION[playIndex % COLOR_CATEGORY_ROTATION.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    return {
      ...base,
      challenge,
      title: challenge.banner.replace(/!$/, ""),
      blurb: challenge.banner,
    };
  }

  // Level 11 — rotate space / sky pack
  if (base.id === 11) {
    const tiles = level11TilesForPlay(playIndex);
    writeRotationIndex(levelId, playIndex + 1);
    const names = tiles.map((t) => t.shapeName).join(", ");
    return {
      ...base,
      tiles,
      blurb: `This space mix: ${names} — match 3 of the same… BOOM!`,
    };
  }

  // Level 12 — rotate plant-part challenge
  if (base.challenge.type === "plantPart") {
    const challenge =
      PLANT_PART_ROTATION[playIndex % PLANT_PART_ROTATION.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    return {
      ...base,
      challenge,
      title: challenge.banner.replace(/!$/, ""),
      blurb: challenge.banner,
    };
  }

  // Level 13 — rotate living ↔ non-living
  if (base.challenge.type === "living") {
    const challenge = LIVING_ROTATION[playIndex % LIVING_ROTATION.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    return {
      ...base,
      challenge,
      title: challenge.banner.replace(/!$/, ""),
      blurb: challenge.banner,
    };
  }

  // Level 14 — rotate solid / liquid / gas
  if (base.challenge.type === "matter") {
    const challenge = MATTER_ROTATION[playIndex % MATTER_ROTATION.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    return {
      ...base,
      challenge,
      title: challenge.banner.replace(/!$/, ""),
      blurb: challenge.banner,
    };
  }

  // Level 15 — rotate adjectives ↔ verbs
  if (base.challenge.type === "speechPart") {
    const challenge = SPEECH_ROTATION[playIndex % SPEECH_ROTATION.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    return {
      ...base,
      challenge,
      title: challenge.banner.replace(/!$/, ""),
      blurb: challenge.banner,
    };
  }

  // Level 16 — rotate math target number
  if (base.challenge.type === "mathTarget") {
    const challenge =
      MATH_TARGET_ROTATION[playIndex % MATH_TARGET_ROTATION.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    return {
      ...base,
      challenge,
      title: challenge.banner,
      blurb: `Blast equations that equal ${challenge.target}… BOOM!`,
    };
  }

  if (base.challenge.type === "color") {
    const available = new Set(base.tiles.map((t) => t.colorKey));
    const options = COLOR_ROTATION.filter((c) => available.has(c.colorKey));
    const pool = options.length ? options : [base.challenge];
    // Always advance so the colour MUST change next play
    const challenge = pool[playIndex % pool.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    const colorWord =
      challenge.colorKey.charAt(0).toUpperCase() + challenge.colorKey.slice(1);
    // TTS / boom text = colour only (Blue… BOOM!) — not square/circle
    const tiles = base.tiles.map((t) => ({
      ...t,
      speakLabel: t.colorName,
    }));
    return {
      ...base,
      tiles,
      challenge,
      blurb: `Blast only ${colorWord}!`,
      title: `${colorWord} Only!`,
    };
  }

  if (base.challenge.type === "size") {
    const challenge = SIZE_ROTATION[playIndex % SIZE_ROTATION.length]!;
    writeRotationIndex(levelId, playIndex + 1);
    const label =
      challenge.sizeLabel ?? (challenge.size === "big" ? "BIG" : "SMALL");
    const nice = label.charAt(0) + label.slice(1).toLowerCase();
    // BIG/SMALL → shapes · TALL/SHORT → boy/girl/house… · TINY → bug/seed…
    const pack = level4TilesForLabel(label);
    const tiles = pack.map((t) => ({
      ...t,
      speakLabel: `${nice} ${t.shapeName}`,
    }));
    const title =
      label === "TALL" || label === "SHORT"
        ? "Tall vs Short"
        : label === "FAT" || label === "THIN"
          ? "Fat vs Thin"
          : label === "TINY"
            ? "Tiny Things"
            : "Big vs Small";
    return {
      ...base,
      tiles,
      challenge,
      title,
      blurb: `Look at the picture — blast the ${nice} ones you can SEE (not by reading).`,
    };
  }

  // Level 2 / Nature Mix etc. — keep adjective+shape speakLabels as configured
  writeRotationIndex(levelId, playIndex + 1);
  return base;
}

export function randomTile(tiles: BloomTileKind[]): BloomTileKind {
  return tiles[Math.floor(Math.random() * tiles.length)]!;
}

export function tilePassesChallenge(
  tile: BloomTileKind,
  challenge: BloomChallenge,
): boolean {
  if (challenge.type === "none") return true;
  if (challenge.type === "color") return tile.colorKey === challenge.colorKey;
  if (challenge.type === "size") return tile.size === challenge.size;
  if (challenge.type === "category")
    return tile.category === challenge.categoryKey;
  if (challenge.type === "colorCategory")
    return (
      tile.colorKey === challenge.colorKey &&
      tile.category === challenge.categoryKey
    );
  if (challenge.type === "plantPart")
    return tile.plantPart === challenge.partKey;
  if (challenge.type === "living") return tile.living === challenge.living;
  if (challenge.type === "matter") return tile.matterState === challenge.state;
  if (challenge.type === "speechPart")
    return tile.speechPart === challenge.part;
  if (challenge.type === "mathTarget")
    return tile.mathValue === challenge.target;
  return true;
}

/** 8-way adjacency (game.md: horizontal, vertical, or diagonal). */
export function isAdjacent8(a: { r: number; c: number }, b: { r: number; c: number }) {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c)) === 1;
}

/**
 * What makes tiles “the same” for a level:
 * - Level 1–2 / 6–8 (none): same tile id
 * - Level 3 (color): same colorKey
 * - Level 4 (size): same size
 * - Level 9 (category): same food category
 * - Level 10 (colorCategory): same color + category
 */
export function matchKey(
  tile: BloomTileKind,
  challenge: BloomChallenge = { type: "none" },
): string {
  if (challenge.type === "color") return `color:${tile.colorKey}`;
  if (challenge.type === "size") return `size:${tile.size}`;
  if (challenge.type === "category")
    return `category:${tile.category ?? "none"}`;
  if (challenge.type === "colorCategory")
    return `cc:${tile.colorKey}:${tile.category ?? "none"}`;
  if (challenge.type === "plantPart")
    return `plant:${tile.plantPart ?? "none"}`;
  if (challenge.type === "living")
    return `living:${tile.living === true ? "yes" : "no"}`;
  if (challenge.type === "matter")
    return `matter:${tile.matterState ?? "none"}`;
  if (challenge.type === "speechPart")
    return `speech:${tile.speechPart ?? "none"}`;
  if (challenge.type === "mathTarget")
    return `math:${tile.mathValue ?? "none"}`;
  return `id:${tile.id}`;
}

/**
 * Match rule for swap play: straight lines only (row or column), length >= 3.
 */
function orthoLineLen(
  grid: (BloomTileKind | null)[][],
  r: number,
  c: number,
  key: string,
  challenge: BloomChallenge,
  dr: number,
  dc: number,
): number {
  const size = grid.length;
  let n = 0;
  let rr = r;
  let cc = c;
  while (rr >= 0 && cc >= 0 && rr < size && cc < size) {
    const t = grid[rr]![cc];
    if (!t || matchKey(t, challenge) !== key) break;
    n++;
    rr += dr;
    cc += dc;
  }
  return n;
}

/** Longest orthogonal run through (r,c) using the level's match key. */
function maxOrthoRunAt(
  grid: (BloomTileKind | null)[][],
  r: number,
  c: number,
  challenge: BloomChallenge = { type: "none" },
): number {
  const t = grid[r]![c];
  if (!t) return 0;
  const key = matchKey(t, challenge);
  const horiz =
    orthoLineLen(grid, r, c, key, challenge, 0, -1) +
    orthoLineLen(grid, r, c, key, challenge, 0, 1) -
    1;
  const vert =
    orthoLineLen(grid, r, c, key, challenge, -1, 0) +
    orthoLineLen(grid, r, c, key, challenge, 1, 0) -
    1;
  return Math.max(horiz, vert);
}

/** True if a free blastable 3+ already sits on the board (kid must not get free BOOMs). */
function boardHasMatch3(
  grid: (BloomTileKind | null)[][],
  challenge: BloomChallenge = { type: "none" },
): boolean {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const t = grid[r]![c];
      if (!t) continue;
      if (!tilePassesChallenge(t, challenge)) continue;
      if (maxOrthoRunAt(grid, r, c, challenge) >= 3) return true;
    }
  }
  return false;
}

/** Used by pickSafeTile / sanitize — blastable run length at a cell. */
function connectedSameCount(
  grid: (BloomTileKind | null)[][],
  r: number,
  c: number,
  challenge: BloomChallenge = { type: "none" },
): number {
  const t = grid[r]![c];
  if (!t) return 0;
  if (!tilePassesChallenge(t, challenge)) return 0;
  return maxOrthoRunAt(grid, r, c, challenge);
}

function cloneKinds(grid: BloomTileKind[][]): BloomTileKind[][] {
  return grid.map((row) => row.slice());
}

function swapKinds(
  grid: BloomTileKind[][],
  a: { r: number; c: number },
  b: { r: number; c: number },
): BloomTileKind[][] {
  const next = cloneKinds(grid);
  const tmp = next[a.r]![a.c]!;
  next[a.r]![a.c] = next[b.r]![b.c]!;
  next[b.r]![b.c] = tmp;
  return next;
}

/** True if swapping a↔b would create a blastable 3+ match touching a or b. */
function swapCreatesMatch(
  grid: BloomTileKind[][],
  a: { r: number; c: number },
  b: { r: number; c: number },
  challenge: BloomChallenge,
): boolean {
  const swapped = swapKinds(grid, a, b);
  for (const cell of [a, b]) {
    if (connectedSameCount(swapped, cell.r, cell.c, challenge) >= 3) return true;
  }
  return false;
}

/**
 * Board must always have at least one neighbor-swap that makes a 3-match.
 * (No free 3-match sitting already — kid must drag to create it.)
 */
export function hasPlayableSwap(
  grid: BloomTileKind[][],
  challenge: BloomChallenge = { type: "none" },
): boolean {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const n of [
        { r, c: c + 1 },
        { r: r + 1, c },
      ]) {
        if (n.r >= size || n.c >= size) continue;
        if (swapCreatesMatch(grid, { r, c }, n, challenge)) return true;
      }
    }
  }
  return false;
}

/**
 * Guaranteed one-swap setup (no free match yet):
 *   A A B
 *   X Y A   → swap B↔A (below) makes A A A on the top row.
 * For color/size levels, A tiles share the challenge key; B/X/Y must NOT.
 */
function plantNearMatch(
  grid: BloomTileKind[][],
  r: number,
  c: number,
  a: BloomTileKind,
  a2: BloomTileKind,
  a3: BloomTileKind,
  filler: BloomTileKind,
  other: BloomTileKind,
  challenge: BloomChallenge,
) {
  const size = grid.length;
  if (r + 1 >= size || c + 2 >= size) return false;
  const aKey = matchKey(a, challenge);
  if (matchKey(filler, challenge) === aKey) return false;
  if (matchKey(other, challenge) === aKey) return false;
  if (matchKey(a2, challenge) !== aKey || matchKey(a3, challenge) !== aKey)
    return false;
  grid[r]![c] = a;
  grid[r]![c + 1] = a2;
  grid[r]![c + 2] = filler;
  grid[r + 1]![c] = other;
  grid[r + 1]![c + 1] = other;
  grid[r + 1]![c + 2] = a3;
  return true;
}

/** Same idea, vertical: A/A/B in a column, A beside the B. */
function plantNearMatchVertical(
  grid: BloomTileKind[][],
  r: number,
  c: number,
  a: BloomTileKind,
  a2: BloomTileKind,
  a3: BloomTileKind,
  filler: BloomTileKind,
  other: BloomTileKind,
  challenge: BloomChallenge,
) {
  const size = grid.length;
  if (r + 2 >= size || c + 1 >= size) return false;
  const aKey = matchKey(a, challenge);
  if (matchKey(filler, challenge) === aKey) return false;
  if (matchKey(other, challenge) === aKey) return false;
  if (matchKey(a2, challenge) !== aKey || matchKey(a3, challenge) !== aKey)
    return false;
  grid[r]![c] = a;
  grid[r + 1]![c] = a2;
  grid[r + 2]![c] = filler;
  grid[r]![c + 1] = other;
  grid[r + 1]![c + 1] = other;
  grid[r + 2]![c + 1] = a3;
  return true;
}

/**
 * Pick match tiles (pass challenge) + two blockers (fail challenge / different key).
 * Color level: match = blues (can be different shapes); blockers = non-blue.
 */
function distinctPlantTiles(
  tiles: BloomTileKind[],
  challenge: BloomChallenge,
): {
  a: BloomTileKind;
  a2: BloomTileKind;
  a3: BloomTileKind;
  filler: BloomTileKind;
  other: BloomTileKind;
} {
  const pool = tiles.filter((t) => tilePassesChallenge(t, challenge));
  const blockers = tiles.filter((t) => !tilePassesChallenge(t, challenge));
  const a = pool[0] ?? tiles[0]!;
  // Color/size: different shapes/tiles OK if they share the challenge key.
  // Level 1–2 (none): all three must be the same tile id.
  const a2 =
    challenge.type === "none"
      ? a
      : (pool.find((t) => matchKey(t, challenge) === matchKey(a, challenge) && t.id !== a.id) ??
        a);
  const a3 =
    challenge.type === "none"
      ? a
      : (pool.find(
          (t) =>
            matchKey(t, challenge) === matchKey(a, challenge) &&
            t.id !== a.id &&
            t.id !== a2.id,
        ) ?? a);

  let filler: BloomTileKind;
  let other: BloomTileKind;
  if (blockers.length >= 2) {
    filler = blockers[0]!;
    other = blockers[1]!;
  } else if (blockers.length === 1) {
    filler = blockers[0]!;
    other =
      tiles.find(
        (t) =>
          matchKey(t, challenge) !== matchKey(a, challenge) &&
          t.id !== filler.id,
      ) ?? filler;
  } else {
    // No blockers (challenge none): use different ids from `a`
    const rest = tiles.filter((t) => t.id !== a.id);
    filler = rest[0] ?? a;
    other = rest[1] ?? rest[0] ?? a;
  }

  return { a, a2, a3, filler, other };
}

function shuffleTiles<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

function countChallengeTiles(
  grid: BloomTileKind[][],
  challenge: BloomChallenge,
): number {
  let n = 0;
  for (const row of grid) {
    for (const t of row) {
      if (tilePassesChallenge(t, challenge)) n++;
    }
  }
  return n;
}

/**
 * Colour (L3) + size (L4) — pack MOSTLY target tiles (~60%+),
 * one clear swap, randomized each build (never sparse target / never identical loop).
 * Do NOT use the old “blocker checker” fill — that made boards unplayable.
 */
function buildGuaranteedChallengeBoard(
  size: number,
  tiles: BloomTileKind[],
  challenge: BloomChallenge,
): BloomTileKind[][] {
  const { a, a2, a3, filler, other } = distinctPlantTiles(
    shuffleTiles(tiles),
    challenge,
  );
  const targets = shuffleTiles(
    tiles.filter((t) => tilePassesChallenge(t, challenge)),
  );
  const blockers = shuffleTiles(
    tiles.filter((t) => !tilePassesChallenge(t, challenge)),
  );
  const targetPool = targets.length ? targets : [a, a2, a3];
  const blockerPool = blockers.length ? blockers : [filler, other];
  const pickTarget = () =>
    targetPool[Math.floor(Math.random() * targetPool.length)]!;
  const pickBlocker = () =>
    blockerPool[Math.floor(Math.random() * blockerPool.length)]!;

  // 1) Start ALL targets (blue / big / …) so kids can see sequences
  const grid: BloomTileKind[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => pickTarget()),
  );

  // 2) Break free 3-target lines with the fewest blockers
  let guard = 0;
  while (boardHasMatch3(grid, challenge) && guard < 60) {
    guard++;
    let fixed = false;
    for (let r = 0; r < size && !fixed; r++) {
      for (let c = 0; c < size && !fixed; c++) {
        if (connectedSameCount(grid, r, c, challenge) < 3) continue;
        grid[r]![c] = pickBlocker();
        fixed = true;
      }
    }
    if (!fixed) break;
  }

  // 3) Plant one obvious one-swap: T T B / b b T
  const spots: { r: number; c: number }[] = [];
  for (let r = 0; r + 1 < size; r++) {
    for (let c = 0; c + 2 < size; c++) spots.push({ r, c });
  }
  let plantAt: { r: number; c: number } | null = null;
  for (const spot of shuffleTiles(spots)) {
    const { a: aa, a2: bb, a3: cc, filler: ff, other: oo } = distinctPlantTiles(
      shuffleTiles(tiles),
      challenge,
    );
    if (plantNearMatch(grid, spot.r, spot.c, aa, bb, cc, ff, oo, challenge)) {
      plantAt = spot;
      break;
    }
  }
  if (!plantAt) {
    plantNearMatch(grid, 0, 0, a, a2, a3, filler, other, challenge);
    plantAt = { r: 0, c: 0 };
  }

  const blockerLock = new Set([
    `${plantAt.r},${plantAt.c + 2}`,
    `${plantAt.r + 1},${plantAt.c}`,
    `${plantAt.r + 1},${plantAt.c + 1}`,
  ]);

  // 4) Densify: upgrade blockers → targets where safe
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (blockerLock.has(`${r},${c}`)) continue;
      if (tilePassesChallenge(grid[r]![c]!, challenge)) continue;
      let placed = false;
      for (const candidate of shuffleTiles(targetPool)) {
        grid[r]![c] = candidate;
        if (maxOrthoRunAt(grid, r, c, challenge) < 3) {
          placed = true;
          break;
        }
      }
      if (!placed) grid[r]![c] = pickBlocker();
    }
  }

  {
    const { a: aa, a2: bb, a3: cc, filler: ff, other: oo } = distinctPlantTiles(
      shuffleTiles(tiles),
      challenge,
    );
    plantNearMatch(grid, plantAt.r, plantAt.c, aa, bb, cc, ff, oo, challenge);
  }

  guard = 0;
  while (boardHasMatch3(grid, challenge) && guard < 30) {
    guard++;
    let fixed = false;
    for (let r = 0; r < size && !fixed; r++) {
      for (let c = 0; c < size && !fixed; c++) {
        if (blockerLock.has(`${r},${c}`)) continue;
        if (r === plantAt.r && c >= plantAt.c && c <= plantAt.c + 1) continue;
        if (r === plantAt.r + 1 && c === plantAt.c + 2) continue;
        if (connectedSameCount(grid, r, c, challenge) < 3) continue;
        grid[r]![c] = pickBlocker();
        fixed = true;
      }
    }
    if (!fixed) break;
  }

  if (!hasPlayableSwap(grid, challenge)) {
    plantNearMatch(grid, 0, 0, a, a2, a3, filler, other, challenge);
  }

  return grid;
}

/** @deprecated name — size boards use buildGuaranteedChallengeBoard */
function buildGuaranteedSizeBoard(
  size: number,
  tiles: BloomTileKind[],
  challenge: BloomChallenge,
): BloomTileKind[][] {
  return buildGuaranteedChallengeBoard(size, tiles, challenge);
}

/**
 * Always returns a board with:
 * - ZERO ready blastable ortho 3-matches
 * - ≥1 neighbor swap that creates a challenge-valid 3-match
 */
function isDensifiedChallenge(challenge: BloomChallenge): boolean {
  return (
    challenge.type === "size" ||
    challenge.type === "color" ||
    challenge.type === "category" ||
    challenge.type === "colorCategory" ||
    challenge.type === "plantPart" ||
    challenge.type === "living" ||
    challenge.type === "matter" ||
    challenge.type === "speechPart" ||
    challenge.type === "mathTarget"
  );
}

function buildGuaranteedPlayable(
  size: number,
  tiles: BloomTileKind[],
  challenge: BloomChallenge,
): BloomTileKind[][] {
  // Colour / size / category / colorCategory: mostly-target densify
  if (isDensifiedChallenge(challenge)) {
    return buildGuaranteedChallengeBoard(size, tiles, challenge);
  }

  const { a, a2, a3, filler, other } = distinctPlantTiles(tiles, challenge);

  // none: checker fill + planted one-swap
  const grid: BloomTileKind[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, col) =>
      (r + col) % 2 === 0 ? filler : other,
    ),
  );

  const planted: boolean[] = [];
  planted.push(
    plantNearMatch(grid, 0, 0, a, a2, a3, filler, other, challenge),
  );
  if (size >= 5) {
    planted.push(
      plantNearMatch(grid, 2, 2, a2, a3, a, other, filler, challenge),
    );
    planted.push(
      plantNearMatchVertical(grid, 2, 0, a3, a, a2, filler, other, challenge),
    );
  }

  const forceCorner = () => {
    grid[0]![0] = a;
    grid[0]![1] = a2;
    grid[0]![2] = filler;
    grid[1]![0] = other;
    grid[1]![1] = other;
    grid[1]![2] = a3;
    if (size > 3) {
      grid[0]![3] = other;
      grid[1]![3] = filler;
      grid[2]![0] = filler;
      grid[2]![1] = other;
      grid[2]![2] = filler;
    }
  };

  if (!planted.some(Boolean) || !hasPlayableSwap(grid, challenge)) {
    forceCorner();
  }

  if (boardHasMatch3(grid, challenge)) {
    const protect = new Set(["0,0", "0,1", "0,2", "1,2"]);
    for (let r = 0; r < size; r++) {
      for (let col = 0; col < size; col++) {
        if (protect.has(`${r},${col}`)) continue;
        const t = grid[r]![col]!;
        if (!tilePassesChallenge(t, challenge)) continue;
        if (maxOrthoRunAt(grid, r, col, challenge) < 3) continue;
        grid[r]![col] = filler;
      }
    }
  }

  if (boardHasMatch3(grid, challenge) || !hasPlayableSwap(grid, challenge)) {
    for (let r = 0; r < size; r++) {
      for (let col = 0; col < size; col++) {
        grid[r]![col] = (r + col) % 2 === 0 ? filler : other;
      }
    }
    forceCorner();
  }

  return grid;
}

/**
 * No free blastable 3-matches, but always ≥1 swap that can make a blast.
 */
export function ensurePlayableBoard(
  grid: BloomTileKind[][],
  tiles: BloomTileKind[],
  challenge: BloomChallenge = { type: "none" },
): BloomTileKind[][] {
  const ok = (g: BloomTileKind[][]) =>
    !boardHasMatch3(g, challenge) && hasPlayableSwap(g, challenge);

  // L3 colour + L4 size + L9/L10 category — mostly TARGET tiles + a playable swap.
  // Never refill with mostly blockers (that was the dead-board loop).
  if (isDensifiedChallenge(challenge)) {
    let best: BloomTileKind[][] | null = null;
    let bestTargets = -1;
    for (let i = 0; i < 16; i++) {
      const nextBoard = buildGuaranteedChallengeBoard(
        grid.length,
        tiles,
        challenge,
      );
      if (!ok(nextBoard)) continue;
      const targets = countChallengeTiles(nextBoard, challenge);
      if (targets > bestTargets) {
        best = nextBoard;
        bestTargets = targets;
      }
      // Size levels need even more target tiles so SHORT/TINY/BIG always feel playable
      const need = challenge.type === "size" ? 17 : 16;
      if (targets >= need) return nextBoard;
    }
    return (
      best ?? buildGuaranteedChallengeBoard(grid.length, tiles, challenge)
    );
  }

  let next = sanitizeBoardNoMatches(grid, tiles, challenge);
  if (ok(next)) return next;

  // Level 1–3: random tries, then planted fallback
  const attempts = challenge.type === "none" ? 80 : 24;
  for (let i = 0; i < attempts; i++) {
    next = sanitizeBoardNoMatches(
      createBoardRaw(grid.length, tiles, challenge),
      tiles,
      challenge,
    );
    if (ok(next)) return next;
  }

  next = buildGuaranteedPlayable(grid.length, tiles, challenge);
  if (!ok(next)) {
    const { a, a2, a3, filler, other } = distinctPlantTiles(tiles, challenge);
    next = Array.from({ length: grid.length }, (_, r) =>
      Array.from({ length: grid.length }, (_, col) =>
        (r + col) % 2 === 0 ? filler : other,
      ),
    );
    next[0]![0] = a;
    next[0]![1] = a2;
    next[0]![2] = filler;
    next[1]![0] = other;
    next[1]![1] = other;
    next[1]![2] = a3;
  }
  return next;
}

/** Raw fill without playable guarantee (used by ensurePlayableBoard). */
function createBoardRaw(
  size: number,
  tiles: BloomTileKind[],
  challenge: BloomChallenge = { type: "none" },
): BloomTileKind[][] {
  const grid: (BloomTileKind | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
  const pool = tiles.filter((t) => tilePassesChallenge(t, challenge));
  const blockers = tiles.filter((t) => !tilePassesChallenge(t, challenge));
  // Bias challenge tiles onto the board so colour/size levels stay playable
  // Size (L4): heavier BIG bias. Color (L3): mild bias. L1–2: even mix.
  const bag =
    challenge.type === "none" || pool.length === 0 || blockers.length === 0
      ? tiles
      : challenge.type === "size" ||
          challenge.type === "category" ||
          challenge.type === "colorCategory" ||
          challenge.type === "plantPart" ||
          challenge.type === "living" ||
          challenge.type === "matter" ||
          challenge.type === "speechPart" ||
          challenge.type === "mathTarget"
        ? [...pool, ...pool, ...pool, ...pool, ...blockers]
        : [...pool, ...pool, ...blockers];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const shuffled = [...bag].sort(() => Math.random() - 0.5);
      let placed: BloomTileKind | null = null;
      let best: BloomTileKind | null = null;
      let bestCount = Infinity;
      for (const candidate of shuffled) {
        grid[r]![c] = candidate;
        const count = connectedSameCount(grid, r, c, challenge);
        if (count < 3) {
          placed = candidate;
          break;
        }
        if (count < bestCount) {
          bestCount = count;
          best = candidate;
        }
        grid[r]![c] = null;
      }
      grid[r]![c] = placed ?? best ?? shuffled[0] ?? tiles[0]!;
    }
  }

  return grid as BloomTileKind[][];
}

/**
 * Build a board with NO ready-made 3+ matches, but WITH possible swap moves.
 */
export function createBoard(
  size: number,
  tiles: BloomTileKind[],
  challenge: BloomChallenge = { type: "none" },
): BloomTileKind[][] {
  return ensurePlayableBoard(
    createBoardRaw(size, tiles, challenge),
    tiles,
    challenge,
  );
}

/** Pick a refill tile that won't create a blastable 3+ group at (r,c). */
export function pickSafeTile(
  grid: (BloomTileKind | null)[][],
  r: number,
  c: number,
  tiles: BloomTileKind[],
  challenge: BloomChallenge = { type: "none" },
): BloomTileKind {
  const pool = tiles.filter((t) => tilePassesChallenge(t, challenge));
  const blockers = tiles.filter((t) => !tilePassesChallenge(t, challenge));
  const bag =
    challenge.type === "none" || pool.length === 0 || blockers.length === 0
      ? tiles
      : challenge.type === "size" ||
          challenge.type === "category" ||
          challenge.type === "colorCategory" ||
          challenge.type === "plantPart" ||
          challenge.type === "living" ||
          challenge.type === "matter" ||
          challenge.type === "speechPart" ||
          challenge.type === "mathTarget"
        ? [...pool, ...pool, ...pool, ...pool, ...blockers]
        : [...pool, ...pool, ...blockers];
  const shuffled = [...bag].sort(() => Math.random() - 0.5);

  for (const candidate of shuffled) {
    grid[r]![c] = candidate;
    if (connectedSameCount(grid, r, c, challenge) < 3) {
      return candidate;
    }
    grid[r]![c] = null;
  }

  // Prefer a blocker so we don't force a free blast
  if (blockers.length) {
    const b = blockers[Math.floor(Math.random() * blockers.length)]!;
    grid[r]![c] = b;
    return b;
  }

  const neighborKeys = new Set<string>();
  const size = grid.length;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
      const t = grid[nr]![nc];
      if (t) neighborKeys.add(matchKey(t, challenge));
    }
  }
  const different = shuffled.find(
    (t) => !neighborKeys.has(matchKey(t, challenge)),
  );
  return different ?? shuffled[0] ?? tiles[0]!;
}

/**
 * Break any accidental blastable 3+ groups WITHOUT scoring.
 */
export function sanitizeBoardNoMatches(
  grid: BloomTileKind[][],
  tiles: BloomTileKind[],
  challenge: BloomChallenge = { type: "none" },
): BloomTileKind[][] {
  const size = grid.length;
  const next = grid.map((row) => row.slice());
  let guard = 0;

  while (boardHasMatch3(next, challenge) && guard < 80) {
    guard++;
    let fixed = false;
    for (let r = 0; r < size && !fixed; r++) {
      for (let c = 0; c < size && !fixed; c++) {
        if (connectedSameCount(next, r, c, challenge) < 3) continue;
        const scratch: (BloomTileKind | null)[][] = next.map((row) =>
          row.map((t) => t),
        );
        scratch[r]![c] = null;
        next[r]![c] = pickSafeTile(scratch, r, c, tiles, challenge);
        fixed = true;
      }
    }
    if (!fixed) break;
  }

  return next;
}
