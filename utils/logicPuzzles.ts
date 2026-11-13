/** Cognitive Logic Puzzles — data + session limits. */

export const FREE_LOGIC_ROUNDS_PER_SESSION = 3;
export const STARS_PER_LOGIC_SOLVE = 5;
export const TANGRAM_SNAP_RADIUS_PX = 40;
export const TANGRAM_SNAP_RADIUS_ADVANCED_PX = 14;
export const TANGRAM_SNAP_RADIUS_PRO_PX = 8;

export type LogicMode = "pattern" | "tangram" | "odd-one-out";

export type LogicDifficulty = "easy" | "advanced" | "pro";

export type LogicObjectId =
  | "star"
  | "moon"
  | "sun"
  | "cloud"
  | "rainbow"
  | "heart"
  | "circle"
  | "triangle"
  | "square"
  | "diamond"
  | "apple"
  | "banana"
  | "grapes"
  | "strawberry"
  | "orange"
  | "watermelon"
  | "cherry"
  | "pear"
  | "peach"
  | "pineapple"
  | "mango"
  | "lemon"
  | "kiwi"
  | "car"
  | "bus"
  | "train"
  | "plane"
  | "boat"
  | "bike"
  | "rocket"
  | "truck"
  | "taxi"
  | "helicopter"
  | "ambulance"
  | "firetruck"
  | "scooter"
  | "submarine"
  | "ball"
  | "block"
  | "teddy"
  | "kite"
  | "robot"
  | "dice"
  | "yo_yo"
  | "gamepad"
  | "flower"
  | "tree"
  | "leaf"
  | "cactus"
  | "mushroom"
  | "palm"
  | "seedling"
  | "snowflake"
  | "fish"
  | "bird"
  | "dog"
  | "cat"
  | "bunny"
  | "duck"
  | "frog"
  | "butterfly"
  | "bee"
  | "lion"
  | "tiger"
  | "elephant"
  | "monkey"
  | "panda"
  | "sheep"
  | "cow"
  | "horse"
  | "owl"
  | "penguin"
  | "snail"
  | "ladybug"
  | "mouse"
  | "chick"
  | "octopus"
  | "crab"
  | "whale"
  | "dolphin"
  | "cookie"
  | "cake"
  | "pizza"
  | "icecream"
  | "burger"
  | "fries"
  | "donut"
  | "popcorn"
  | "candy"
  | "bread"
  | "cheese"
  | "egg"
  | "honey"
  | "carrot"
  | "corn"
  | "tomato"
  | "broccoli"
  | "potato"
  | "book"
  | "pencil"
  | "crayon"
  | "cup"
  | "scissors"
  | "backpack"
  | "ruler"
  | "globe"
  | "hat"
  | "shoe"
  | "shirt"
  | "socks"
  | "dress"
  | "pants"
  | "gloves"
  | "scarf"
  | "glasses"
  | "crown"
  | "drum"
  | "guitar"
  | "piano"
  | "trumpet"
  | "violin"
  | "mic"
  | "headphones"
  | "notes"
  | "bell"
  | "basketball"
  | "tennis"
  | "baseball"
  | "trophy"
  | "bed"
  | "chair"
  | "lamp"
  | "clock"
  | "key"
  | "phone"
  | "camera"
  | "umbrella"
  | "snowman";

export type LogicObjectVisual = {
  id: LogicObjectId;
  label: string;
  emoji: string;
  face: string;
  rim: string;
};

export const LOGIC_OBJECTS: Record<LogicObjectId, LogicObjectVisual> = {
  star: { id: "star", label: "Star", emoji: "⭐", face: "from-amber-300 via-yellow-300 to-orange-400", rim: "border-amber-200" },
  moon: { id: "moon", label: "Moon", emoji: "🌙", face: "from-indigo-300 via-sky-300 to-violet-400", rim: "border-indigo-200" },
  sun: { id: "sun", label: "Sun", emoji: "☀️", face: "from-orange-300 via-amber-200 to-yellow-400", rim: "border-orange-200" },
  cloud: { id: "cloud", label: "Cloud", emoji: "☁️", face: "from-slate-100 via-sky-100 to-indigo-200", rim: "border-sky-200" },
  rainbow: { id: "rainbow", label: "Rainbow", emoji: "🌈", face: "from-rose-300 via-amber-200 to-sky-300", rim: "border-fuchsia-200" },
  heart: { id: "heart", label: "Heart", emoji: "❤️", face: "from-rose-300 via-pink-300 to-fuchsia-400", rim: "border-rose-200" },
  circle: { id: "circle", label: "Circle", emoji: "🔵", face: "from-sky-300 via-cyan-300 to-blue-400", rim: "border-sky-200" },
  triangle: { id: "triangle", label: "Triangle", emoji: "🔺", face: "from-orange-300 via-amber-300 to-rose-400", rim: "border-orange-200" },
  square: { id: "square", label: "Square", emoji: "🟩", face: "from-lime-300 via-emerald-300 to-teal-400", rim: "border-lime-200" },
  diamond: { id: "diamond", label: "Diamond", emoji: "💎", face: "from-cyan-200 via-sky-300 to-indigo-400", rim: "border-cyan-200" },
  apple: { id: "apple", label: "Apple", emoji: "🍎", face: "from-rose-300 via-red-300 to-orange-300", rim: "border-rose-200" },
  banana: { id: "banana", label: "Banana", emoji: "🍌", face: "from-yellow-200 via-amber-300 to-lime-300", rim: "border-amber-200" },
  grapes: { id: "grapes", label: "Grapes", emoji: "🍇", face: "from-violet-300 via-purple-300 to-fuchsia-400", rim: "border-violet-200" },
  strawberry: { id: "strawberry", label: "Strawberry", emoji: "🍓", face: "from-rose-300 via-red-300 to-pink-400", rim: "border-rose-200" },
  orange: { id: "orange", label: "Orange", emoji: "🍊", face: "from-orange-300 via-amber-300 to-yellow-400", rim: "border-orange-200" },
  watermelon: { id: "watermelon", label: "Watermelon", emoji: "🍉", face: "from-rose-300 via-lime-300 to-emerald-400", rim: "border-lime-200" },
  cherry: { id: "cherry", label: "Cherry", emoji: "🍒", face: "from-rose-400 via-red-300 to-pink-300", rim: "border-rose-200" },
  pear: { id: "pear", label: "Pear", emoji: "🍐", face: "from-lime-200 via-green-300 to-yellow-300", rim: "border-lime-200" },
  peach: { id: "peach", label: "Peach", emoji: "🍑", face: "from-orange-200 via-rose-300 to-amber-300", rim: "border-orange-200" },
  pineapple: { id: "pineapple", label: "Pineapple", emoji: "🍍", face: "from-amber-200 via-yellow-300 to-lime-400", rim: "border-amber-200" },
  mango: { id: "mango", label: "Mango", emoji: "🥭", face: "from-orange-300 via-amber-300 to-yellow-400", rim: "border-orange-200" },
  lemon: { id: "lemon", label: "Lemon", emoji: "🍋", face: "from-yellow-200 via-amber-200 to-lime-300", rim: "border-yellow-200" },
  kiwi: { id: "kiwi", label: "Kiwi", emoji: "🥝", face: "from-lime-300 via-green-400 to-emerald-500", rim: "border-lime-200" },
  car: { id: "car", label: "Toy Car", emoji: "🚗", face: "from-sky-300 via-blue-300 to-indigo-400", rim: "border-sky-200" },
  bus: { id: "bus", label: "Bus", emoji: "🚌", face: "from-amber-300 via-yellow-300 to-orange-400", rim: "border-amber-200" },
  train: { id: "train", label: "Train", emoji: "🚂", face: "from-rose-300 via-orange-300 to-amber-400", rim: "border-orange-200" },
  plane: { id: "plane", label: "Plane", emoji: "✈️", face: "from-sky-200 via-cyan-300 to-indigo-300", rim: "border-sky-200" },
  boat: { id: "boat", label: "Boat", emoji: "⛵", face: "from-cyan-300 via-sky-300 to-teal-400", rim: "border-cyan-200" },
  bike: { id: "bike", label: "Bike", emoji: "🚲", face: "from-lime-300 via-emerald-300 to-teal-400", rim: "border-lime-200" },
  rocket: { id: "rocket", label: "Rocket", emoji: "🚀", face: "from-rose-300 via-orange-300 to-sky-300", rim: "border-rose-200" },
  truck: { id: "truck", label: "Truck", emoji: "🚚", face: "from-sky-300 via-blue-300 to-indigo-400", rim: "border-sky-200" },
  taxi: { id: "taxi", label: "Taxi", emoji: "🚕", face: "from-yellow-200 via-amber-300 to-orange-400", rim: "border-amber-200" },
  helicopter: { id: "helicopter", label: "Helicopter", emoji: "🚁", face: "from-sky-200 via-cyan-300 to-teal-400", rim: "border-cyan-200" },
  ambulance: { id: "ambulance", label: "Ambulance", emoji: "🚑", face: "from-white via-rose-200 to-sky-200", rim: "border-rose-200" },
  firetruck: { id: "firetruck", label: "Fire Truck", emoji: "🚒", face: "from-rose-400 via-red-400 to-orange-400", rim: "border-rose-300" },
  scooter: { id: "scooter", label: "Scooter", emoji: "🛴", face: "from-lime-200 via-emerald-300 to-teal-400", rim: "border-lime-200" },
  submarine: { id: "submarine", label: "Submarine", emoji: "🛳️", face: "from-cyan-300 via-sky-400 to-indigo-400", rim: "border-cyan-200" },
  ball: { id: "ball", label: "Ball", emoji: "⚽", face: "from-slate-200 via-white to-emerald-300", rim: "border-slate-200" },
  block: { id: "block", label: "Block", emoji: "🧱", face: "from-orange-300 via-rose-300 to-amber-400", rim: "border-orange-200" },
  teddy: { id: "teddy", label: "Teddy Bear", emoji: "🧸", face: "from-amber-200 via-orange-200 to-rose-300", rim: "border-amber-200" },
  kite: { id: "kite", label: "Kite", emoji: "🪁", face: "from-sky-200 via-violet-300 to-rose-300", rim: "border-sky-200" },
  robot: { id: "robot", label: "Robot", emoji: "🤖", face: "from-slate-200 via-sky-300 to-indigo-400", rim: "border-slate-300" },
  dice: { id: "dice", label: "Dice", emoji: "🎲", face: "from-white via-rose-100 to-violet-200", rim: "border-slate-200" },
  yo_yo: { id: "yo_yo", label: "Yo-Yo", emoji: "🪀", face: "from-rose-300 via-orange-300 to-amber-400", rim: "border-rose-200" },
  gamepad: { id: "gamepad", label: "Gamepad", emoji: "🎮", face: "from-violet-300 via-indigo-300 to-sky-400", rim: "border-violet-200" },
  flower: { id: "flower", label: "Flower", emoji: "🌸", face: "from-pink-200 via-rose-300 to-fuchsia-300", rim: "border-pink-200" },
  tree: { id: "tree", label: "Tree", emoji: "🌳", face: "from-lime-300 via-emerald-400 to-teal-500", rim: "border-emerald-200" },
  leaf: { id: "leaf", label: "Leaf", emoji: "🍃", face: "from-lime-200 via-green-300 to-emerald-400", rim: "border-lime-200" },
  cactus: { id: "cactus", label: "Cactus", emoji: "🌵", face: "from-lime-300 via-green-400 to-emerald-500", rim: "border-lime-200" },
  mushroom: { id: "mushroom", label: "Mushroom", emoji: "🍄", face: "from-rose-300 via-red-300 to-amber-200", rim: "border-rose-200" },
  palm: { id: "palm", label: "Palm Tree", emoji: "🌴", face: "from-lime-300 via-emerald-400 to-teal-500", rim: "border-emerald-200" },
  seedling: { id: "seedling", label: "Seedling", emoji: "🌱", face: "from-lime-200 via-green-300 to-emerald-400", rim: "border-lime-200" },
  snowflake: { id: "snowflake", label: "Snowflake", emoji: "❄️", face: "from-sky-100 via-cyan-100 to-indigo-200", rim: "border-sky-200" },
  fish: { id: "fish", label: "Fish", emoji: "🐟", face: "from-cyan-300 via-sky-300 to-teal-400", rim: "border-cyan-200" },
  bird: { id: "bird", label: "Bird", emoji: "🐦", face: "from-sky-200 via-amber-200 to-orange-300", rim: "border-sky-200" },
  dog: { id: "dog", label: "Dog", emoji: "🐶", face: "from-amber-200 via-orange-200 to-rose-200", rim: "border-amber-200" },
  cat: { id: "cat", label: "Cat", emoji: "🐱", face: "from-orange-200 via-amber-100 to-rose-200", rim: "border-orange-200" },
  bunny: { id: "bunny", label: "Bunny", emoji: "🐰", face: "from-pink-100 via-rose-200 to-violet-200", rim: "border-pink-200" },
  duck: { id: "duck", label: "Duck", emoji: "🦆", face: "from-yellow-200 via-amber-300 to-lime-300", rim: "border-amber-200" },
  frog: { id: "frog", label: "Frog", emoji: "🐸", face: "from-lime-300 via-emerald-300 to-teal-400", rim: "border-lime-200" },
  butterfly: { id: "butterfly", label: "Butterfly", emoji: "🦋", face: "from-sky-200 via-violet-300 to-fuchsia-300", rim: "border-violet-200" },
  bee: { id: "bee", label: "Bee", emoji: "🐝", face: "from-amber-200 via-yellow-300 to-lime-300", rim: "border-amber-200" },
  lion: { id: "lion", label: "Lion", emoji: "🦁", face: "from-amber-300 via-orange-300 to-yellow-400", rim: "border-amber-200" },
  tiger: { id: "tiger", label: "Tiger", emoji: "🐯", face: "from-orange-300 via-amber-300 to-yellow-400", rim: "border-orange-200" },
  elephant: { id: "elephant", label: "Elephant", emoji: "🐘", face: "from-slate-200 via-sky-200 to-indigo-300", rim: "border-slate-300" },
  monkey: { id: "monkey", label: "Monkey", emoji: "🐵", face: "from-amber-200 via-orange-200 to-rose-200", rim: "border-amber-200" },
  panda: { id: "panda", label: "Panda", emoji: "🐼", face: "from-white via-slate-100 to-slate-300", rim: "border-slate-300" },
  sheep: { id: "sheep", label: "Sheep", emoji: "🐑", face: "from-white via-slate-100 to-amber-100", rim: "border-slate-200" },
  cow: { id: "cow", label: "Cow", emoji: "🐮", face: "from-white via-amber-100 to-rose-200", rim: "border-amber-200" },
  horse: { id: "horse", label: "Horse", emoji: "🐴", face: "from-amber-200 via-orange-200 to-rose-200", rim: "border-amber-200" },
  owl: { id: "owl", label: "Owl", emoji: "🦉", face: "from-amber-200 via-stone-200 to-indigo-200", rim: "border-amber-200" },
  penguin: { id: "penguin", label: "Penguin", emoji: "🐧", face: "from-slate-200 via-white to-sky-200", rim: "border-slate-300" },
  snail: { id: "snail", label: "Snail", emoji: "🐌", face: "from-amber-200 via-lime-200 to-yellow-300", rim: "border-amber-200" },
  ladybug: { id: "ladybug", label: "Ladybug", emoji: "🐞", face: "from-rose-400 via-red-400 to-orange-300", rim: "border-rose-300" },
  mouse: { id: "mouse", label: "Mouse", emoji: "🐭", face: "from-slate-100 via-rose-100 to-amber-100", rim: "border-slate-200" },
  chick: { id: "chick", label: "Chick", emoji: "🐥", face: "from-yellow-200 via-amber-300 to-orange-300", rim: "border-amber-200" },
  octopus: { id: "octopus", label: "Octopus", emoji: "🐙", face: "from-rose-300 via-fuchsia-300 to-violet-400", rim: "border-fuchsia-200" },
  crab: { id: "crab", label: "Crab", emoji: "🦀", face: "from-orange-300 via-rose-400 to-red-400", rim: "border-orange-300" },
  whale: { id: "whale", label: "Whale", emoji: "🐋", face: "from-sky-300 via-cyan-300 to-indigo-400", rim: "border-sky-200" },
  dolphin: { id: "dolphin", label: "Dolphin", emoji: "🐬", face: "from-cyan-200 via-sky-300 to-indigo-300", rim: "border-cyan-200" },
  cookie: { id: "cookie", label: "Cookie", emoji: "🍪", face: "from-amber-200 via-orange-200 to-yellow-300", rim: "border-amber-200" },
  cake: { id: "cake", label: "Cake", emoji: "🎂", face: "from-pink-200 via-rose-300 to-amber-200", rim: "border-pink-200" },
  pizza: { id: "pizza", label: "Pizza", emoji: "🍕", face: "from-orange-300 via-amber-300 to-rose-300", rim: "border-orange-200" },
  icecream: { id: "icecream", label: "Ice Cream", emoji: "🍦", face: "from-pink-100 via-rose-200 to-amber-100", rim: "border-pink-200" },
  burger: { id: "burger", label: "Burger", emoji: "🍔", face: "from-amber-300 via-orange-300 to-lime-300", rim: "border-amber-200" },
  fries: { id: "fries", label: "Fries", emoji: "🍟", face: "from-amber-200 via-yellow-300 to-orange-400", rim: "border-amber-200" },
  donut: { id: "donut", label: "Donut", emoji: "🍩", face: "from-rose-300 via-pink-300 to-amber-200", rim: "border-rose-200" },
  popcorn: { id: "popcorn", label: "Popcorn", emoji: "🍿", face: "from-amber-100 via-yellow-200 to-rose-200", rim: "border-amber-200" },
  candy: { id: "candy", label: "Candy", emoji: "🍬", face: "from-pink-200 via-violet-200 to-sky-200", rim: "border-pink-200" },
  bread: { id: "bread", label: "Bread", emoji: "🍞", face: "from-amber-200 via-orange-200 to-yellow-300", rim: "border-amber-200" },
  cheese: { id: "cheese", label: "Cheese", emoji: "🧀", face: "from-yellow-200 via-amber-300 to-orange-300", rim: "border-amber-200" },
  egg: { id: "egg", label: "Egg", emoji: "🥚", face: "from-amber-50 via-white to-yellow-100", rim: "border-amber-100" },
  honey: { id: "honey", label: "Honey", emoji: "🍯", face: "from-amber-300 via-yellow-400 to-orange-400", rim: "border-amber-300" },
  carrot: { id: "carrot", label: "Carrot", emoji: "🥕", face: "from-orange-300 via-amber-300 to-lime-300", rim: "border-orange-200" },
  corn: { id: "corn", label: "Corn", emoji: "🌽", face: "from-yellow-200 via-amber-300 to-lime-400", rim: "border-amber-200" },
  tomato: { id: "tomato", label: "Tomato", emoji: "🍅", face: "from-rose-400 via-red-400 to-orange-300", rim: "border-rose-300" },
  broccoli: { id: "broccoli", label: "Broccoli", emoji: "🥦", face: "from-lime-300 via-green-400 to-emerald-500", rim: "border-lime-200" },
  potato: { id: "potato", label: "Potato", emoji: "🥔", face: "from-amber-200 via-orange-200 to-stone-300", rim: "border-amber-200" },
  book: { id: "book", label: "Book", emoji: "📚", face: "from-sky-200 via-indigo-200 to-violet-300", rim: "border-indigo-200" },
  pencil: { id: "pencil", label: "Pencil", emoji: "✏️", face: "from-amber-200 via-yellow-200 to-rose-200", rim: "border-amber-200" },
  crayon: { id: "crayon", label: "Crayon", emoji: "🖍️", face: "from-rose-300 via-orange-300 to-yellow-300", rim: "border-rose-200" },
  cup: { id: "cup", label: "Cup", emoji: "🥤", face: "from-sky-200 via-cyan-200 to-teal-300", rim: "border-sky-200" },
  scissors: { id: "scissors", label: "Scissors", emoji: "✂️", face: "from-slate-200 via-rose-100 to-sky-200", rim: "border-slate-300" },
  backpack: { id: "backpack", label: "Backpack", emoji: "🎒", face: "from-rose-300 via-orange-300 to-amber-400", rim: "border-rose-200" },
  ruler: { id: "ruler", label: "Ruler", emoji: "📏", face: "from-amber-100 via-yellow-200 to-lime-200", rim: "border-amber-200" },
  globe: { id: "globe", label: "Globe", emoji: "🌍", face: "from-sky-300 via-emerald-300 to-lime-400", rim: "border-sky-200" },
  hat: { id: "hat", label: "Hat", emoji: "🎩", face: "from-slate-300 via-indigo-200 to-violet-300", rim: "border-slate-300" },
  shoe: { id: "shoe", label: "Shoe", emoji: "👟", face: "from-sky-300 via-blue-300 to-indigo-400", rim: "border-sky-200" },
  shirt: { id: "shirt", label: "Shirt", emoji: "👕", face: "from-sky-200 via-cyan-200 to-indigo-300", rim: "border-sky-200" },
  socks: { id: "socks", label: "Socks", emoji: "🧦", face: "from-rose-200 via-pink-200 to-violet-200", rim: "border-pink-200" },
  dress: { id: "dress", label: "Dress", emoji: "👗", face: "from-pink-200 via-rose-300 to-fuchsia-300", rim: "border-pink-200" },
  pants: { id: "pants", label: "Pants", emoji: "👖", face: "from-sky-300 via-indigo-300 to-blue-400", rim: "border-sky-200" },
  gloves: { id: "gloves", label: "Gloves", emoji: "🧤", face: "from-rose-200 via-orange-200 to-amber-300", rim: "border-rose-200" },
  scarf: { id: "scarf", label: "Scarf", emoji: "🧣", face: "from-rose-300 via-red-300 to-orange-300", rim: "border-rose-200" },
  glasses: { id: "glasses", label: "Glasses", emoji: "👓", face: "from-sky-100 via-indigo-100 to-violet-200", rim: "border-indigo-200" },
  crown: { id: "crown", label: "Crown", emoji: "👑", face: "from-amber-300 via-yellow-300 to-orange-400", rim: "border-amber-200" },
  drum: { id: "drum", label: "Drum", emoji: "🥁", face: "from-rose-300 via-orange-300 to-amber-400", rim: "border-rose-200" },
  guitar: { id: "guitar", label: "Guitar", emoji: "🎸", face: "from-orange-300 via-amber-300 to-rose-400", rim: "border-orange-200" },
  piano: { id: "piano", label: "Piano", emoji: "🎹", face: "from-slate-200 via-indigo-200 to-violet-300", rim: "border-slate-300" },
  trumpet: { id: "trumpet", label: "Trumpet", emoji: "🎺", face: "from-amber-300 via-yellow-300 to-orange-400", rim: "border-amber-200" },
  violin: { id: "violin", label: "Violin", emoji: "🎻", face: "from-amber-300 via-orange-400 to-rose-400", rim: "border-amber-300" },
  mic: { id: "mic", label: "Microphone", emoji: "🎤", face: "from-slate-200 via-rose-200 to-violet-300", rim: "border-slate-300" },
  headphones: { id: "headphones", label: "Headphones", emoji: "🎧", face: "from-violet-300 via-indigo-300 to-sky-400", rim: "border-violet-200" },
  notes: { id: "notes", label: "Music Notes", emoji: "🎵", face: "from-pink-200 via-violet-200 to-sky-200", rim: "border-violet-200" },
  bell: { id: "bell", label: "Bell", emoji: "🔔", face: "from-amber-300 via-yellow-300 to-orange-400", rim: "border-amber-200" },
  basketball: { id: "basketball", label: "Basketball", emoji: "🏀", face: "from-orange-300 via-amber-400 to-rose-400", rim: "border-orange-300" },
  tennis: { id: "tennis", label: "Tennis Ball", emoji: "🎾", face: "from-lime-200 via-yellow-300 to-emerald-300", rim: "border-lime-200" },
  baseball: { id: "baseball", label: "Baseball", emoji: "⚾", face: "from-white via-rose-100 to-amber-100", rim: "border-slate-200" },
  trophy: { id: "trophy", label: "Trophy", emoji: "🏆", face: "from-amber-300 via-yellow-300 to-orange-400", rim: "border-amber-200" },
  bed: { id: "bed", label: "Bed", emoji: "🛏️", face: "from-sky-100 via-indigo-100 to-violet-200", rim: "border-sky-200" },
  chair: { id: "chair", label: "Chair", emoji: "🪑", face: "from-amber-200 via-orange-200 to-stone-300", rim: "border-amber-200" },
  lamp: { id: "lamp", label: "Lamp", emoji: "💡", face: "from-yellow-100 via-amber-200 to-orange-200", rim: "border-amber-200" },
  clock: { id: "clock", label: "Clock", emoji: "🕒", face: "from-white via-amber-100 to-sky-100", rim: "border-slate-200" },
  key: { id: "key", label: "Key", emoji: "🔑", face: "from-amber-300 via-yellow-300 to-orange-400", rim: "border-amber-200" },
  phone: { id: "phone", label: "Phone", emoji: "📱", face: "from-slate-200 via-sky-200 to-indigo-300", rim: "border-slate-300" },
  camera: { id: "camera", label: "Camera", emoji: "📷", face: "from-slate-200 via-rose-100 to-amber-100", rim: "border-slate-300" },
  umbrella: { id: "umbrella", label: "Umbrella", emoji: "☂️", face: "from-violet-300 via-indigo-300 to-sky-300", rim: "border-violet-200" },
  snowman: { id: "snowman", label: "Snowman", emoji: "⛄", face: "from-sky-50 via-white to-cyan-100", rim: "border-sky-200" },
};

export type PatternPuzzle = {
  id: string;
  prompt: string;
  sequence: LogicObjectId[];
  answer: LogicObjectId;
  choices: LogicObjectId[];
  patternLabel: "AB" | "ABC" | "AABB" | "ABBA" | "HARD" | "PRO";
};

export type OddOneOutPuzzle = {
  id: string;
  prompt: string;
  items: LogicObjectId[];
  oddOne: LogicObjectId;
  categoryId: string;
  categoryHint: string;
  /** Easy shows the group name; Advanced hides it for a tougher challenge. */
  revealHint: boolean;
  /** Advanced hides text labels under pictures. */
  hideLabels: boolean;
};

export type TangramShapeId =
  | "circle"
  | "star"
  | "triangle"
  | "square"
  | "heart"
  | "moon";

export type TangramPuzzle = {
  id: string;
  prompt: string;
  slots: TangramShapeId[];
  snapRadiusPx: number;
  /** Advanced hides silhouette hints inside cutouts. */
  hideGhosts: boolean;
  /** Advanced requires precise drag-to-slot (no tap shortcut). */
  dragOnly: boolean;
};

export const MODE_META: Record<
  LogicMode,
  { title: string; blurb: string; emoji: string; accent: string }
> = {
  pattern: {
    title: "Pattern Completion",
    blurb: "Easy AB · Advanced longer · Pro: 7–8 year brain-benders.",
    emoji: "🧩",
    accent: "from-violet-400 to-indigo-500",
  },
  tangram: {
    title: "Shape Tangram Fitting",
    blurb: "Easy: 4 shapes. Advanced: 6 shapes, drag-only, tighter magnets.",
    emoji: "📐",
    accent: "from-cyan-400 to-teal-500",
  },
  "odd-one-out": {
    title: "Odd-One-Out",
    blurb: "Easy hints · Advanced traps · Pro: 6-card subtle logic!",
    emoji: "🔍",
    accent: "from-rose-400 to-orange-500",
  },
};

export const DIFFICULTY_META: Record<
  LogicDifficulty,
  { label: string; detail: string; ageLabel: string; requiresPro: boolean }
> = {
  easy: {
    label: "Easy",
    detail: "Short patterns · 4 shapes · clear hints",
    ageLabel: "Ages 3–5",
    requiresPro: false,
  },
  advanced: {
    label: "Advanced",
    detail: "Longer patterns · 6-shape tangram · near-miss traps",
    ageLabel: "Ages 5–7",
    requiresPro: false,
  },
  pro: {
    label: "Pro",
    detail: "7–8 years · tricky patterns · blank tangram · 6-card puzzles",
    ageLabel: "Ages 7–8 · Pro",
    requiresPro: true,
  },
};

/** Kid-clear category groups used to build many Odd-One-Out rounds. */
export const ODD_CATEGORIES: { id: string; label: string; members: LogicObjectId[] }[] = [
  {
    id: "fruits",
    label: "fruits",
    members: [
      "apple",
      "banana",
      "grapes",
      "strawberry",
      "orange",
      "watermelon",
      "cherry",
      "pear",
      "peach",
      "pineapple",
      "mango",
      "lemon",
      "kiwi",
    ],
  },
  {
    id: "vegetables",
    label: "vegetables",
    members: ["carrot", "corn", "tomato", "broccoli", "potato"],
  },
  {
    id: "shapes",
    label: "shapes",
    members: ["circle", "triangle", "square", "star", "heart", "diamond"],
  },
  {
    id: "sky",
    label: "things in the sky",
    members: ["sun", "moon", "star", "cloud", "rainbow", "plane", "rocket", "helicopter", "kite"],
  },
  {
    id: "animals",
    label: "animals",
    members: [
      "dog",
      "cat",
      "bunny",
      "duck",
      "frog",
      "fish",
      "bird",
      "bee",
      "butterfly",
      "lion",
      "tiger",
      "elephant",
      "monkey",
      "panda",
      "sheep",
      "cow",
      "horse",
      "owl",
      "penguin",
      "mouse",
      "chick",
    ],
  },
  {
    id: "ocean",
    label: "ocean friends",
    members: ["fish", "octopus", "crab", "whale", "dolphin", "boat", "submarine"],
  },
  {
    id: "farm",
    label: "farm friends",
    members: ["cow", "sheep", "horse", "chick", "duck", "corn", "carrot"],
  },
  {
    id: "bugs",
    label: "little bugs",
    members: ["bee", "butterfly", "ladybug", "snail"],
  },
  {
    id: "vehicles",
    label: "vehicles",
    members: [
      "car",
      "bus",
      "train",
      "plane",
      "boat",
      "bike",
      "rocket",
      "truck",
      "taxi",
      "helicopter",
      "ambulance",
      "firetruck",
      "scooter",
    ],
  },
  {
    id: "toys",
    label: "toys",
    members: ["ball", "block", "car", "teddy", "train", "rocket", "kite", "robot", "dice", "yo_yo", "gamepad"],
  },
  {
    id: "nature",
    label: "nature friends",
    members: ["flower", "tree", "leaf", "butterfly", "bee", "bird", "cactus", "mushroom", "palm", "seedling"],
  },
  {
    id: "food",
    label: "yummy foods",
    members: [
      "cookie",
      "cake",
      "pizza",
      "icecream",
      "burger",
      "fries",
      "donut",
      "popcorn",
      "candy",
      "bread",
      "cheese",
      "egg",
      "honey",
    ],
  },
  {
    id: "sweets",
    label: "sweet treats",
    members: ["cookie", "cake", "icecream", "donut", "candy", "honey"],
  },
  {
    id: "school",
    label: "school things",
    members: ["book", "pencil", "crayon", "cup", "scissors", "backpack", "ruler", "globe"],
  },
  {
    id: "clothes",
    label: "things to wear",
    members: ["hat", "shoe", "shirt", "socks", "dress", "pants", "gloves", "scarf", "glasses", "crown"],
  },
  {
    id: "music",
    label: "music things",
    members: ["drum", "guitar", "piano", "trumpet", "violin", "mic", "headphones", "notes", "bell"],
  },
  {
    id: "pretty",
    label: "pretty sparkly things",
    members: ["heart", "flower", "star", "rainbow", "diamond", "crown"],
  },
  {
    id: "sports",
    label: "sports things",
    members: ["ball", "basketball", "tennis", "baseball", "trophy", "bike"],
  },
  {
    id: "home",
    label: "home things",
    members: ["bed", "chair", "lamp", "clock", "key", "phone", "camera", "cup"],
  },
  {
    id: "weather",
    label: "weather things",
    members: ["sun", "cloud", "rainbow", "snowflake", "umbrella", "snowman"],
  },
];

const PATTERN_POOL_EASY: PatternPuzzle[] = [
  {
    id: "p-ab-star-moon",
    prompt: "What comes next in the pattern?",
    sequence: ["star", "moon", "star"],
    answer: "moon",
    choices: ["moon", "sun", "heart"],
    patternLabel: "AB",
  },
  {
    id: "p-ab-sun-heart",
    prompt: "What comes next in the pattern?",
    sequence: ["sun", "heart", "sun"],
    answer: "heart",
    choices: ["moon", "heart", "star"],
    patternLabel: "AB",
  },
  {
    id: "p-ab-circle-square",
    prompt: "What comes next in the pattern?",
    sequence: ["circle", "square", "circle"],
    answer: "square",
    choices: ["triangle", "square", "star"],
    patternLabel: "AB",
  },
  {
    id: "p-ab-apple-banana",
    prompt: "What comes next in the pattern?",
    sequence: ["apple", "banana", "apple"],
    answer: "banana",
    choices: ["banana", "car", "flower"],
    patternLabel: "AB",
  },
  {
    id: "p-ab-dog-cat",
    prompt: "What comes next in the pattern?",
    sequence: ["dog", "cat", "dog"],
    answer: "cat",
    choices: ["cat", "bus", "tree"],
    patternLabel: "AB",
  },
];

const PATTERN_POOL_ADVANCED: PatternPuzzle[] = [
  {
    id: "p-abc-star-moon-sun",
    prompt: "What comes next in this longer pattern?",
    sequence: ["star", "moon", "sun", "star", "moon"],
    answer: "sun",
    choices: ["sun", "heart", "moon", "cloud"],
    patternLabel: "ABC",
  },
  {
    id: "p-aabb-apple",
    prompt: "What comes next in this longer pattern?",
    sequence: ["apple", "apple", "banana", "banana", "apple"],
    answer: "apple",
    choices: ["apple", "grapes", "car", "banana"],
    patternLabel: "AABB",
  },
  {
    id: "p-abba-circle",
    prompt: "What comes next in this longer pattern?",
    sequence: ["circle", "square", "square", "circle", "circle"],
    answer: "square",
    choices: ["square", "triangle", "star", "circle"],
    patternLabel: "ABBA",
  },
  {
    id: "p-hard-fish-bird",
    prompt: "What comes next in this longer pattern?",
    sequence: ["fish", "bird", "fish", "bird", "fish"],
    answer: "bird",
    choices: ["bird", "duck", "ball", "frog"],
    patternLabel: "HARD",
  },
  {
    id: "p-hard-car-bus-train",
    prompt: "What comes next in this longer pattern?",
    sequence: ["car", "bus", "train", "car", "bus"],
    answer: "train",
    choices: ["train", "bike", "plane", "bus"],
    patternLabel: "HARD",
  },
  {
    id: "p-aabb-heart-star",
    prompt: "What comes next in this longer pattern?",
    sequence: ["heart", "heart", "star", "star", "heart"],
    answer: "heart",
    choices: ["heart", "flower", "moon", "star"],
    patternLabel: "AABB",
  },
];

/** Pro (7–8): long sequences, skip / multi-rule patterns, tricky distractors. */
const PATTERN_POOL_PRO: PatternPuzzle[] = [
  {
    id: "p-pro-abcd-vehicles",
    prompt: "Pro challenge — what comes next?",
    sequence: ["car", "bus", "train", "plane", "car", "bus", "train"],
    answer: "plane",
    choices: ["plane", "bike", "rocket", "bus", "helicopter"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-abac",
    prompt: "Pro challenge — find the hidden rule!",
    sequence: ["star", "moon", "star", "sun", "star", "moon", "star"],
    answer: "sun",
    choices: ["sun", "moon", "cloud", "heart", "star"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-aabbcc",
    prompt: "Pro challenge — pairs keep growing!",
    sequence: ["apple", "apple", "banana", "banana", "grapes", "grapes", "apple"],
    answer: "apple",
    choices: ["apple", "banana", "grapes", "orange", "strawberry"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-skip-shapes",
    prompt: "Pro challenge — shapes march in order!",
    sequence: ["circle", "square", "triangle", "circle", "square", "triangle", "circle"],
    answer: "square",
    choices: ["square", "diamond", "triangle", "star", "circle"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-abba-long",
    prompt: "Pro challenge — mirror pattern!",
    sequence: ["fish", "bird", "bird", "fish", "fish", "bird", "bird"],
    answer: "fish",
    choices: ["fish", "duck", "frog", "bird", "butterfly"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-nature-cycle",
    prompt: "Pro challenge — nature cycle!",
    sequence: ["seedling", "flower", "tree", "leaf", "seedling", "flower", "tree"],
    answer: "leaf",
    choices: ["leaf", "cactus", "mushroom", "palm", "flower"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-music-repeat",
    prompt: "Pro challenge — listen with your eyes!",
    sequence: ["drum", "guitar", "piano", "drum", "guitar", "piano", "drum"],
    answer: "guitar",
    choices: ["guitar", "violin", "trumpet", "piano", "notes"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-double-then",
    prompt: "Pro challenge — two the same, then a new friend!",
    sequence: ["dog", "dog", "cat", "bunny", "bunny", "duck", "lion"],
    answer: "lion",
    choices: ["lion", "tiger", "sheep", "cat", "monkey"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-sky-switch",
    prompt: "Pro challenge — sky friends swap!",
    sequence: ["sun", "cloud", "moon", "star", "sun", "cloud", "moon"],
    answer: "star",
    choices: ["star", "rainbow", "snowflake", "cloud", "rocket"],
    patternLabel: "PRO",
  },
  {
    id: "p-pro-ababc",
    prompt: "Pro challenge — the rule gets longer!",
    sequence: ["heart", "star", "heart", "star", "diamond", "heart", "star"],
    answer: "heart",
    choices: ["heart", "diamond", "flower", "crown", "star"],
    patternLabel: "PRO",
  },
];

const TANGRAM_POOL_EASY: TangramPuzzle[] = [
  {
    id: "t-basic-4",
    prompt: "Fit every shape into its matching cutout!",
    slots: ["circle", "star", "triangle", "square"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_PX,
    hideGhosts: false,
    dragOnly: false,
  },
  {
    id: "t-circle-star",
    prompt: "Snap the glowing shapes into the glass board!",
    slots: ["circle", "star", "square", "triangle"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_PX,
    hideGhosts: false,
    dragOnly: false,
  },
  {
    id: "t-mix",
    prompt: "Match each 3D shape to its cozy home!",
    slots: ["triangle", "circle", "square", "star"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_PX,
    hideGhosts: false,
    dragOnly: false,
  },
];

const TANGRAM_POOL_ADVANCED: TangramPuzzle[] = [
  {
    id: "t-adv-6a",
    prompt: "Expert board! Match all six shapes — drag carefully onto each icon!",
    slots: ["circle", "star", "triangle", "square", "heart", "moon"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_ADVANCED_PX,
    hideGhosts: false,
    dragOnly: true,
  },
  {
    id: "t-adv-6b",
    prompt: "Super hard! Six shapes with tiny magnets — drag onto the matching icon!",
    slots: ["moon", "heart", "square", "triangle", "star", "circle"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_ADVANCED_PX,
    hideGhosts: false,
    dragOnly: true,
  },
  {
    id: "t-adv-6c",
    prompt: "Master board! Drag every shape onto its matching cutout icon!",
    slots: ["heart", "circle", "moon", "star", "square", "triangle"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_ADVANCED_PX,
    hideGhosts: false,
    dragOnly: true,
  },
];

/** Pro tangram: blank cutouts, drag-only, very tight snap — ages 7–8. */
const TANGRAM_POOL_PRO: TangramPuzzle[] = [
  {
    id: "t-pro-6a",
    prompt: "Pro board! Blank cutouts — drag each shape to its exact home!",
    slots: ["circle", "star", "triangle", "square", "heart", "moon"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_PRO_PX,
    hideGhosts: true,
    dragOnly: true,
  },
  {
    id: "t-pro-6b",
    prompt: "Genius board! No icons inside — only the silhouette outline!",
    slots: ["moon", "triangle", "heart", "circle", "square", "star"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_PRO_PX,
    hideGhosts: true,
    dragOnly: true,
  },
  {
    id: "t-pro-6c",
    prompt: "Champion fit! Tiny magnets and empty windows — drag carefully!",
    slots: ["square", "moon", "star", "heart", "triangle", "circle"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_PRO_PX,
    hideGhosts: true,
    dragOnly: true,
  },
  {
    id: "t-pro-6d",
    prompt: "Ultimate tangram! Remember each shape — the board stays blank!",
    slots: ["heart", "star", "moon", "square", "circle", "triangle"],
    snapRadiusPx: TANGRAM_SNAP_RADIUS_PRO_PX,
    hideGhosts: true,
    dragOnly: true,
  },
];

const EASY_ODD_CATEGORY_IDS = new Set([
  "fruits",
  "animals",
  "vehicles",
  "toys",
  "food",
  "vegetables",
  "farm",
  "ocean",
  "sports",
  "home",
]);
const ADVANCED_ODD_CATEGORY_IDS = new Set([
  "sky",
  "nature",
  "school",
  "clothes",
  "music",
  "pretty",
  "shapes",
  "bugs",
  "weather",
  "sweets",
  "ocean",
  "sports",
]);

/** Near-miss distractors — look related, but do not belong. */
const CLOSE_OUTSIDERS: Record<string, LogicObjectId[]> = {
  fruits: ["cookie", "cake", "flower", "ball", "pizza", "carrot", "tomato", "donut"],
  vegetables: ["apple", "banana", "flower", "tree", "cookie", "ball"],
  animals: ["teddy", "car", "robot", "block", "shoe", "pizza"],
  vehicles: ["ball", "block", "bird", "fish", "kite", "dolphin"],
  toys: ["apple", "dog", "shoe", "book", "flower", "carrot"],
  food: ["ball", "flower", "block", "shoe", "car", "leaf"],
  farm: ["lion", "tiger", "car", "plane", "robot", "pizza"],
  ocean: ["dog", "cat", "car", "tree", "bird", "cow"],
  sports: ["cookie", "book", "flower", "cat", "lamp", "pizza"],
  home: ["car", "dog", "tree", "rocket", "banana", "fish"],
  sky: ["flower", "bird", "butterfly", "apple", "fish", "tree", "umbrella"],
  nature: ["sun", "moon", "rainbow", "apple", "dog", "car", "snowman"],
  shapes: ["ball", "cookie", "sun", "orange", "pizza", "clock"],
  school: ["teddy", "pizza", "car", "leaf", "drum", "banana"],
  clothes: ["teddy", "ball", "book", "flower", "cake", "robot"],
  music: ["ball", "book", "car", "flower", "cup", "phone"],
  pretty: ["apple", "sun", "moon", "dog", "cake", "cookie"],
  bugs: ["bird", "plane", "fish", "car", "flower", "robot"],
  weather: ["flower", "apple", "dog", "car", "pizza", "book"],
  sweets: ["carrot", "broccoli", "ball", "shoe", "car", "leaf"],
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function combinations3<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length - 2; i += 1) {
    for (let j = i + 1; j < items.length - 1; j += 1) {
      for (let k = j + 1; k < items.length; k += 1) {
        out.push([items[i], items[j], items[k]]);
      }
    }
  }
  return out;
}

function combinations4<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length - 3; i += 1) {
    for (let j = i + 1; j < items.length - 2; j += 1) {
      for (let k = j + 1; k < items.length - 1; k += 1) {
        for (let m = k + 1; m < items.length; m += 1) {
          out.push([items[i], items[j], items[k], items[m]]);
        }
      }
    }
  }
  return out;
}

/** Easy bank: 3 matching + 1 obvious outsider, with category hints. */
function buildEasyOddPool(): OddOneOutPuzzle[] {
  const allIds = Object.keys(LOGIC_OBJECTS) as LogicObjectId[];
  const puzzles: OddOneOutPuzzle[] = [];
  const seen = new Set<string>();
  const categories = ODD_CATEGORIES.filter(
    (c) => EASY_ODD_CATEGORY_IDS.has(c.id) && c.members.length >= 3,
  );

  for (const category of categories) {
    const trios = shuffle(combinations3(category.members)).slice(0, 40);
    const obviousOutsiders = shuffle(
      allIds.filter(
        (id) =>
          !category.members.includes(id) &&
          !(CLOSE_OUTSIDERS[category.id] ?? []).includes(id),
      ),
    ).slice(0, 28);

    let made = 0;
    for (const trio of trios) {
      for (const odd of obviousOutsiders) {
        const key = `easy:${category.id}:${[...trio].sort().join("-")}|${odd}`;
        if (seen.has(key)) continue;
        seen.add(key);
        puzzles.push({
          id: `o-easy-${category.id}-${puzzles.length + 1}`,
          prompt: "Which one does not belong here?",
          items: [...trio, odd],
          oddOne: odd,
          categoryId: category.id,
          categoryHint: category.label,
          revealHint: true,
          hideLabels: false,
        });
        made += 1;
        if (made >= 24) break;
      }
      if (made >= 24) break;
    }
  }

  return shuffle(puzzles);
}

/** Advanced bank: 4 matching + 1 near-miss outsider, no hints/labels. */
function buildAdvancedOddPool(): OddOneOutPuzzle[] {
  const puzzles: OddOneOutPuzzle[] = [];
  const seen = new Set<string>();
  const categories = ODD_CATEGORIES.filter(
    (c) => ADVANCED_ODD_CATEGORY_IDS.has(c.id) && c.members.length >= 4,
  );

  const curated: Array<{
    categoryId: string;
    categoryHint: string;
    match: LogicObjectId[];
    odd: LogicObjectId;
  }> = [
    { categoryId: "sky", categoryHint: "things in the sky", match: ["sun", "moon", "star", "cloud"], odd: "flower" },
    { categoryId: "sky", categoryHint: "things in the sky", match: ["sun", "moon", "rainbow", "helicopter"], odd: "bird" },
    { categoryId: "sky", categoryHint: "things in the sky", match: ["kite", "plane", "rocket", "cloud"], odd: "boat" },
    { categoryId: "nature", categoryHint: "nature friends", match: ["flower", "tree", "leaf", "cactus"], odd: "rainbow" },
    { categoryId: "nature", categoryHint: "nature friends", match: ["mushroom", "palm", "seedling", "leaf"], odd: "pizza" },
    { categoryId: "shapes", categoryHint: "shapes", match: ["circle", "triangle", "square", "diamond"], odd: "ball" },
    { categoryId: "shapes", categoryHint: "shapes", match: ["circle", "heart", "square", "star"], odd: "clock" },
    { categoryId: "pretty", categoryHint: "pretty sparkly things", match: ["heart", "flower", "star", "diamond"], odd: "sun" },
    { categoryId: "pretty", categoryHint: "pretty sparkly things", match: ["crown", "rainbow", "diamond", "star"], odd: "cookie" },
    { categoryId: "music", categoryHint: "music things", match: ["drum", "guitar", "violin", "trumpet"], odd: "phone" },
    { categoryId: "music", categoryHint: "music things", match: ["piano", "mic", "headphones", "notes"], odd: "globe" },
    { categoryId: "clothes", categoryHint: "things to wear", match: ["hat", "dress", "gloves", "scarf"], odd: "robot" },
    { categoryId: "clothes", categoryHint: "things to wear", match: ["shoe", "shirt", "pants", "glasses"], odd: "teddy" },
    { categoryId: "school", categoryHint: "school things", match: ["book", "pencil", "backpack", "ruler"], odd: "donut" },
    { categoryId: "school", categoryHint: "school things", match: ["crayon", "scissors", "globe", "cup"], odd: "lion" },
    { categoryId: "bugs", categoryHint: "little bugs", match: ["bee", "butterfly", "ladybug", "snail"], odd: "plane" },
    { categoryId: "weather", categoryHint: "weather things", match: ["sun", "cloud", "snowflake", "umbrella"], odd: "banana" },
    { categoryId: "weather", categoryHint: "weather things", match: ["rainbow", "snowman", "cloud", "umbrella"], odd: "car" },
    { categoryId: "sweets", categoryHint: "sweet treats", match: ["cookie", "cake", "donut", "candy"], odd: "broccoli" },
    { categoryId: "ocean", categoryHint: "ocean friends", match: ["octopus", "crab", "whale", "dolphin"], odd: "cow" },
    { categoryId: "sports", categoryHint: "sports things", match: ["basketball", "tennis", "baseball", "trophy"], odd: "lamp" },
    { categoryId: "animals-fly", categoryHint: "flying animals", match: ["bird", "bee", "butterfly", "owl"], odd: "helicopter" },
    { categoryId: "round", categoryHint: "round foods", match: ["orange", "cookie", "donut", "tomato"], odd: "banana" },
  ];

  for (const round of curated) {
    puzzles.push({
      id: `o-adv-curated-${puzzles.length + 1}`,
      prompt: "Look carefully — which one does not belong?",
      items: [...round.match, round.odd],
      oddOne: round.odd,
      categoryId: round.categoryId,
      categoryHint: round.categoryHint,
      revealHint: false,
      hideLabels: true,
    });
  }

  for (const category of categories) {
    const fours = shuffle(combinations4(category.members)).slice(0, 28);
    const nearMisses = shuffle(
      (CLOSE_OUTSIDERS[category.id] ?? []).filter(
        (id) => !category.members.includes(id),
      ),
    );

    let made = 0;
    for (const four of fours) {
      for (const odd of nearMisses) {
        const key = `adv:${category.id}:${[...four].sort().join("-")}|${odd}`;
        if (seen.has(key)) continue;
        seen.add(key);
        puzzles.push({
          id: `o-adv-${category.id}-${puzzles.length + 1}`,
          prompt: "Look carefully — which one does not belong?",
          items: [...four, odd],
          oddOne: odd,
          categoryId: category.id,
          categoryHint: category.label,
          revealHint: false,
          hideLabels: true,
        });
        made += 1;
        if (made >= 20) break;
      }
      if (made >= 20) break;
    }
  }

  return shuffle(puzzles);
}

/**
 * Pro odd-one-out (7–8): 6 cards, subtle category rules, near-miss traps,
 * no hints/labels. Harder than Advanced on purpose.
 */
function buildProOddPool(): OddOneOutPuzzle[] {
  const curated: Array<{
    categoryId: string;
    categoryHint: string;
    match: LogicObjectId[];
    odd: LogicObjectId;
  }> = [
    {
      categoryId: "instruments",
      categoryHint: "musical instruments",
      match: ["drum", "guitar", "violin", "trumpet", "piano"],
      odd: "notes",
    },
    {
      categoryId: "fly-animals",
      categoryHint: "animals that fly",
      match: ["bird", "bee", "butterfly", "owl", "ladybug"],
      odd: "helicopter",
    },
    {
      categoryId: "mammals",
      categoryHint: "mammals",
      match: ["dog", "cat", "bunny", "sheep", "cow"],
      odd: "duck",
    },
    {
      categoryId: "ocean-animals",
      categoryHint: "ocean animals",
      match: ["fish", "octopus", "crab", "whale", "dolphin"],
      odd: "frog",
    },
    {
      categoryId: "write-tools",
      categoryHint: "things for writing or drawing",
      match: ["pencil", "crayon", "scissors", "ruler", "book"],
      odd: "globe",
    },
    {
      categoryId: "wear-body",
      categoryHint: "clothes you wear",
      match: ["hat", "shirt", "pants", "dress", "scarf"],
      odd: "backpack",
    },
    {
      categoryId: "round-food",
      categoryHint: "round foods",
      match: ["orange", "cookie", "donut", "tomato", "pizza"],
      odd: "banana",
    },
    {
      categoryId: "night-sky",
      categoryHint: "night sky friends",
      match: ["moon", "star", "owl", "snowman", "cloud"],
      odd: "sun",
    },
    {
      categoryId: "wheels",
      categoryHint: "things with wheels",
      match: ["car", "bus", "bike", "truck", "scooter"],
      odd: "boat",
    },
    {
      categoryId: "sweet-only",
      categoryHint: "sweet treats",
      match: ["cookie", "cake", "donut", "candy", "icecream"],
      odd: "pizza",
    },
    {
      categoryId: "plants",
      categoryHint: "growing plants",
      match: ["flower", "tree", "leaf", "cactus", "seedling"],
      odd: "mushroom",
    },
    {
      categoryId: "sports-gear",
      categoryHint: "sports things",
      match: ["basketball", "tennis", "baseball", "trophy", "bike"],
      odd: "gamepad",
    },
    {
      categoryId: "home-furniture",
      categoryHint: "home furniture",
      match: ["bed", "chair", "lamp", "clock", "key"],
      odd: "phone",
    },
    {
      categoryId: "farm-only",
      categoryHint: "farm animals",
      match: ["cow", "sheep", "chick", "horse", "duck"],
      odd: "lion",
    },
    {
      categoryId: "red-fruit",
      categoryHint: "red or pink fruits",
      match: ["apple", "strawberry", "cherry", "watermelon", "peach"],
      odd: "carrot",
    },
    {
      categoryId: "fly-machines",
      categoryHint: "things that can fly",
      match: ["plane", "helicopter", "rocket", "kite", "bird"],
      odd: "submarine",
    },
  ];

  // Expand thin curated rows that only have 2 matches with category members.
  const puzzles: OddOneOutPuzzle[] = [];
  for (const round of curated) {
    let match = [...round.match];
    if (match.length < 5) {
      const cat = ODD_CATEGORIES.find((c) => c.id === round.categoryId);
      const extras = (cat?.members ?? []).filter(
        (id) => !match.includes(id) && id !== round.odd,
      );
      match = [...match, ...extras].slice(0, 5);
    }
    if (match.length < 5) continue;
    puzzles.push({
      id: `o-pro-${round.categoryId}-${puzzles.length + 1}`,
      prompt: "Pro challenge — which one does not belong?",
      items: [...match.slice(0, 5), round.odd],
      oddOne: round.odd,
      categoryId: round.categoryId,
      categoryHint: round.categoryHint,
      revealHint: false,
      hideLabels: true,
    });
  }

  // Extra generated near-miss 5+1 rounds from advanced categories.
  const seen = new Set<string>(puzzles.map((p) => p.id));
  const categories = ODD_CATEGORIES.filter((c) => c.members.length >= 5);
  for (const category of categories) {
    const fives = shuffle(combinations4(category.members))
      .map((four) => {
        const extra = category.members.find((id) => !four.includes(id));
        return extra ? [...four, extra] : null;
      })
      .filter((x): x is LogicObjectId[] => Boolean(x))
      .slice(0, 12);
    const nearMisses = shuffle(
      (CLOSE_OUTSIDERS[category.id] ?? []).filter(
        (id) => !category.members.includes(id),
      ),
    );
    let made = 0;
    for (const five of fives) {
      for (const odd of nearMisses) {
        const key = `pro:${category.id}:${[...five].sort().join("-")}|${odd}`;
        if (seen.has(key)) continue;
        seen.add(key);
        puzzles.push({
          id: `o-pro-${category.id}-${puzzles.length + 1}`,
          prompt: "Pro challenge — which one does not belong?",
          items: [...five, odd],
          oddOne: odd,
          categoryId: category.id,
          categoryHint: category.label,
          revealHint: false,
          hideLabels: true,
        });
        made += 1;
        if (made >= 8) break;
      }
      if (made >= 8) break;
    }
  }

  return shuffle(puzzles);
}

const ODD_POOL_EASY: OddOneOutPuzzle[] = buildEasyOddPool();
const ODD_POOL_ADVANCED: OddOneOutPuzzle[] = buildAdvancedOddPool();
const ODD_POOL_PRO: OddOneOutPuzzle[] = buildProOddPool();

/** How many unique Category Sorting rounds are available. */
export const ODD_ONE_OUT_ROUND_COUNT =
  ODD_POOL_EASY.length + ODD_POOL_ADVANCED.length + ODD_POOL_PRO.length;

const recentOddIds: string[] = [];
const recentOddIcons: LogicObjectId[] = [];
const RECENT_ODD_LIMIT = 24;
const RECENT_ICON_LIMIT = 36;

function overlapScore(items: LogicObjectId[]): number {
  return items.reduce(
    (score, id) => score + (recentOddIcons.includes(id) ? 1 : 0),
    0,
  );
}

function patternPoolFor(difficulty: LogicDifficulty): PatternPuzzle[] {
  if (difficulty === "pro") return PATTERN_POOL_PRO;
  if (difficulty === "advanced") return PATTERN_POOL_ADVANCED;
  return PATTERN_POOL_EASY;
}

function oddPoolFor(difficulty: LogicDifficulty): OddOneOutPuzzle[] {
  if (difficulty === "pro") return ODD_POOL_PRO;
  if (difficulty === "advanced") return ODD_POOL_ADVANCED;
  return ODD_POOL_EASY;
}

function tangramPoolFor(difficulty: LogicDifficulty): TangramPuzzle[] {
  if (difficulty === "pro") return TANGRAM_POOL_PRO;
  if (difficulty === "advanced") return TANGRAM_POOL_ADVANCED;
  return TANGRAM_POOL_EASY;
}

export function pickPatternPuzzle(difficulty: LogicDifficulty): PatternPuzzle {
  const pool = patternPoolFor(difficulty);
  const puzzle = pool[Math.floor(Math.random() * pool.length)];
  return { ...puzzle, choices: shuffle(puzzle.choices) };
}

export function pickOddOneOutPuzzle(
  difficulty: LogicDifficulty = "easy",
): OddOneOutPuzzle {
  const pool = oddPoolFor(difficulty);
  const fresh = pool.filter((p) => !recentOddIds.includes(p.id));
  const source = fresh.length > 0 ? fresh : pool;

  // Prefer rounds that reuse the fewest recently shown icons.
  const ranked = [...source].sort(
    (a, b) => overlapScore(a.items) - overlapScore(b.items),
  );
  const bestScore = overlapScore(ranked[0].items);
  const top = ranked.filter((p) => overlapScore(p.items) === bestScore);
  const puzzle = top[Math.floor(Math.random() * top.length)];

  recentOddIds.push(puzzle.id);
  if (recentOddIds.length > RECENT_ODD_LIMIT) recentOddIds.shift();
  for (const id of puzzle.items) {
    recentOddIcons.push(id);
    if (recentOddIcons.length > RECENT_ICON_LIMIT) recentOddIcons.shift();
  }

  const isHard = difficulty === "advanced" || difficulty === "pro";
  return {
    ...puzzle,
    items: shuffle(puzzle.items),
    revealHint: !isHard,
    hideLabels: isHard,
    prompt:
      difficulty === "pro"
        ? "Pro challenge — which one does not belong?"
        : isHard
          ? "Look carefully — which one does not belong?"
          : puzzle.prompt,
  };
}

/** Spoken prompt: Easy names the group; Advanced/Pro give almost no help. */
export function speakOddOneOutPrompt(puzzle: OddOneOutPuzzle): string {
  if (!puzzle.revealHint) {
    const n = Math.max(1, puzzle.items.length - 1);
    return `Look carefully at the pictures. ${n} belong together. Tap the one that does not belong.`;
  }
  const names = puzzle.items.map((id) => LOGIC_OBJECTS[id].label);
  const listed =
    names.length <= 1
      ? names[0] ?? ""
      : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
  return `Look at these pictures: ${listed}. Most of them are ${puzzle.categoryHint}. Tap the one that is different and does not belong.`;
}

/** Short on-screen hint for the matching group. */
export function oddOneOutHint(puzzle: OddOneOutPuzzle): string | null {
  if (!puzzle.revealHint) return null;
  return `Hint: most are ${puzzle.categoryHint} — tap the odd one out`;
}

export function pickTangramPuzzle(
  difficulty: LogicDifficulty = "easy",
): TangramPuzzle {
  const pool = tangramPoolFor(difficulty);
  const puzzle = pool[Math.floor(Math.random() * pool.length)];
  return { ...puzzle, slots: shuffle(puzzle.slots) };
}

export function tangramTrayOrder(slots: TangramShapeId[]): TangramShapeId[] {
  return shuffle(slots);
}
