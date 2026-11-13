/** 3D Picture Frame Puzzle — static phonics stills, cardboard-style boards. */

export const FREE_PICTURE_PUZZLE_ROUNDS = 3;
export const STARS_PER_PICTURE_PUZZLE = 5;
export const PICTURE_SNAP_RADIUS_PX = 48;

/** Basic = 4 pieces (2×2). Advanced = 8 pieces (2×4). */
export type PictureGridSize = "2x2" | "2x4";

export type PicturePuzzleItem = {
  id: string;
  word: string;
  letter: string;
  /** Static JPG grabbed from the phonics video (not a video tile). */
  imageSrc: string;
};

export type PicturePuzzleRound = {
  item: PicturePuzzleItem;
  grid: PictureGridSize;
  rows: number;
  cols: number;
  pieceIds: string[];
};

export type PicturePieceCoord = {
  id: string;
  row: number;
  col: number;
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function titleFromId(id: string): string {
  const raw = id.includes("_") ? id.split("_").slice(1).join("_") : id;
  const spaced = raw.replace(/_/g, " ").trim();
  if (!spaced) return id;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * All phonics stills under /puzzle-stills (extracted from MP4s).
 * Split into two disjoint 60-image banks so Basic and Advanced never share art.
 */
const ALL_STILL_IDS = [
  "a1_apple",
  "a2_aeroplane",
  "a3_ant",
  "a4_alligator",
  "a5_astronaut",
  "b1_ball",
  "b2_bus",
  "b3_bear",
  "b4_butterfly",
  "b5_banana",
  "c1_cat",
  "c2_car",
  "c3_cupcake",
  "c4_cow",
  "c5_clock",
  "d1_dog",
  "d2_duck",
  "d3_drum",
  "d4_dolphin",
  "d5_dinosaur",
  "e1_elephant",
  "e2_egg",
  "e3_eagle",
  "e4_engine",
  "e5_earth",
  "f1_fish",
  "f2_frog",
  "f3_flower",
  "f4_fox",
  "f5_fireengine",
  "g1_giraffe",
  "g2_guitar",
  "g3_grapes",
  "g4_gift",
  "g5_gorilla",
  "h1_horse",
  "h2_hat",
  "h3_house",
  "h4_helicopter",
  "h5_hippo",
  "i1_icecream",
  "i2_igloo",
  "i3_iguana",
  "i4_island",
  "i5_ink",
  "j1_juice",
  "j2_jellyfish",
  "j3_jet",
  "j4_jaguar",
  "j5_jug",
  "k1_kite",
  "k2_kangaroo",
  "k3_koala",
  "k4_king",
  "k5_key",
  "l1_lion",
  "l2_lamp",
  "l3_lemon",
  "l4_leaf",
  "l5_lollipop",
  "m1_monkey",
  "m2_moon",
  "m3_mango",
  "m4_milk",
  "m5_mouse",
  "n1_nest",
  "n2_net",
  "n3_nut",
  "n4_night",
  "n5_needle",
  "o1_owl",
  "o2_orange",
  "o3_octopus",
  "o4_ostrich",
  "o5_onion",
  "p1_panda",
  "p2_penguin",
  "p3_parrot",
  "p4_pencil",
  "p5_pizza",
  "q1_queen",
  "q2_quail",
  "q3_quilt",
  "q4_question",
  "q5_quarter",
  "r1_rabbit",
  "r2_rocket",
  "r3_rainbow",
  "r4_ring",
  "r5_robot",
  "s1_sun",
  "s2_star",
  "s3_ship",
  "s4_snake",
  "s5_strawberry",
  "t1_tiger",
  "t2_train",
  "t3_turtle",
  "t4_tree",
  "t5_telephone",
  "u1_umbrella",
  "u2_unicorn",
  "u3_uniform",
  "u4_urn",
  "u5_underwater",
  "v1_van",
  "v2_violin",
  "v3_vase",
  "v4_volcano",
  "v5_vegetables",
  "w1_whale",
  "w2_watermelon",
  "w3_watch",
  "w4_windmill",
  "w5_wolf",
  "x1_xylophone",
  "x2_xray",
  "x3_xmas_tree",
  "x4_xenops",
  "x5_xiphosura",
  "y1_yacht",
  "y2_yoyo",
  "y3_yak",
  "y4_yogurt",
  "y5_yarn",
  "z1_zebra",
  "z2_zipper",
  "z3_zoo",
  "z4_zero",
  "z5_zucchini",
] as const;

const POOL_SIZE = 60;

function toItem(id: string): PicturePuzzleItem {
  return {
    id,
    word: titleFromId(id),
    letter: id.charAt(0).toUpperCase(),
    imageSrc: `/puzzle-stills/${id}.jpg`,
  };
}

/** Basic 4-piece bank — first 60 stills. */
export const BASIC_PUZZLE_ITEMS: PicturePuzzleItem[] = ALL_STILL_IDS.slice(
  0,
  POOL_SIZE,
).map(toItem);

/** Advanced 8-piece bank — next 60 stills (no overlap with basic). */
export const ADVANCED_PUZZLE_ITEMS: PicturePuzzleItem[] = ALL_STILL_IDS.slice(
  POOL_SIZE,
  POOL_SIZE * 2,
).map(toItem);

const recentByGrid: Record<PictureGridSize, string[]> = {
  "2x2": [],
  "2x4": [],
};
const RECENT_LIMIT = 14;

export function gridDims(size: PictureGridSize): { rows: number; cols: number } {
  return size === "2x2" ? { rows: 2, cols: 2 } : { rows: 2, cols: 4 };
}

export function buildPieceCoords(size: PictureGridSize): PicturePieceCoord[] {
  const { rows, cols } = gridDims(size);
  const out: PicturePieceCoord[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      out.push({ id: `p-${r}-${c}`, row: r, col: c });
    }
  }
  return out;
}

function poolFor(size: PictureGridSize): PicturePuzzleItem[] {
  return size === "2x2" ? BASIC_PUZZLE_ITEMS : ADVANCED_PUZZLE_ITEMS;
}

export function pickPicturePuzzle(size: PictureGridSize): PicturePuzzleRound {
  const all = poolFor(size);
  const recent = recentByGrid[size];
  const fresh = all.filter((item) => !recent.includes(item.id));
  const source = fresh.length > 0 ? fresh : all;
  const item =
    source[Math.floor(Math.random() * source.length)] ?? BASIC_PUZZLE_ITEMS[0];

  recent.push(item.id);
  if (recent.length > RECENT_LIMIT) recent.shift();

  const { rows, cols } = gridDims(size);
  const coords = buildPieceCoords(size);
  return {
    item,
    grid: size,
    rows,
    cols,
    pieceIds: shuffle(coords.map((c) => c.id)),
  };
}

export const GRID_META: Record<
  PictureGridSize,
  {
    title: string;
    blurb: string;
    freeAllowed: boolean;
    pieces: number;
    poolSize: number;
  }
> = {
  "2x2": {
    title: "Basic Puzzle",
    blurb: "4 cardboard pieces · 60 picture cards",
    freeAllowed: true,
    pieces: 4,
    poolSize: BASIC_PUZZLE_ITEMS.length,
  },
  "2x4": {
    title: "Advanced Puzzle",
    blurb: "8 cardboard pieces · 60 different picture cards",
    freeAllowed: false,
    pieces: 8,
    poolSize: ADVANCED_PUZZLE_ITEMS.length,
  },
};
