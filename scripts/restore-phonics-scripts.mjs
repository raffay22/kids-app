import { readFileSync, writeFileSync } from "node:fs";

const ORIGINAL = {
  a1_apple: "Ah... ah... ah... A is for Apple! Look, Apple is moving its eyes!",
  a2_aeroplane: "Ah... ah... ah... A is for Aeroplane! Aeroplane is flying high in the sky!",
  a3_ant: "Ah... ah... ah... A is for Ant! Ant is marching along!",
  a4_alligator: "Ah... ah... ah... A is for Alligator! Alligator says hello!",
  a5_astronaut: "Ah... ah... ah... A is for Astronaut! Astronaut is floating in space!",
  b1_ball: "Buh... buh... buh... B is for Ball! Ball is bouncing so high!",
  b2_bus: "Buh... buh... buh... B is for Bus! The Yellow Bus is rolling by!",
  b3_bear: "Buh... buh... buh... B is for Bear! Bear is giving a warm hug!",
  b4_butterfly: "Buh... buh... buh... B is for Butterfly! Butterfly is fluttering its wings!",
  b5_banana: "Buh... buh... buh... B is for Banana! Banana is peeling and dancing!",
  c1_cat: "Cuh... cuh... cuh... C is for Cat! The little Cat says meow!",
  c2_car: "Cuh... cuh... cuh... C is for Car! Red Car goes vroom vroom!",
  c3_cupcake: "Cuh... cuh... cuh... C is for Cupcake! Cupcake is sweet and shiny!",
  c4_cow: "Cuh... cuh... cuh... C is for Cow! Cow says moooo!",
  c5_clock: "Cuh... cuh... cuh... C is for Clock! Tick tock goes the happy clock!",
  d1_dog: "Duh... duh... duh... D is for Dog! Dog is wagging its happy tail!",
  d2_duck: "Duh... duh... duh... D is for Duck! Duck says quack quack!",
  d3_drum: "Duh... duh... duh... D is for Drum! Boom boom goes the drum!",
  d4_dolphin: "Duh... duh... duh... D is for Dolphin! Dolphin is leaping in the water!",
  d5_dinosaur: "Duh... duh... duh... D is for Dinosaur! Dino goes rawr with a smile!",
  e1_elephant: "Eh... eh... eh... E is for Elephant! Elephant sprays cool water!",
  e2_egg: "Eh... eh... eh... E is for Egg! Look, the egg is cracking open!",
  e3_eagle: "Eh... eh... eh... E is for Eagle! Eagle flies high in the sky!",
  e4_engine: "Eh... eh... eh... E is for Engine! Choo choo goes the train engine!",
  e5_earth: "Eh... eh... eh... E is for Earth! Our happy planet Earth is spinning!",
  f1_fish: "Fff... fff... fff... F is for Fish! Fish is swimming and making bubbles!",
  f2_frog: "Fff... fff... fff... F is for Frog! Ribbit! Frog hops up high!",
  f3_flower: "Fff... fff... fff... F is for Flower! Sunflower blooms so bright!",
  f4_fox: "Fff... fff... fff... F is for Fox! Fox is swishing its fluffy tail!",
  f5_fireengine: "Fff... fff... fff... F is for Fire Engine! Wee-woo! Here comes the Fire Engine!",
  g1_giraffe: "Guh... guh... guh... G is for Giraffe! Giraffe has a long long neck!",
  g2_guitar: "Guh... guh... guh... G is for Guitar! Strum strum goes the guitar!",
  g3_grapes: "Guh... guh... guh... G is for Grapes! Sweet juicy grapes!",
  g4_gift: "Guh... guh... guh... G is for Gift! Surprise! What is inside the gift box?",
  g5_gorilla: "Guh... guh... guh... G is for Gorilla! Gorilla gives a big thumbs up!",
  h1_horse: "Huh... huh... huh... H is for Horse! Neigh! Horse is running fast!",
  h2_hat: "Huh... huh... huh... H is for Hat! Look at the funny magic hat!",
  h3_house: "Huh... huh... huh... H is for House! Welcome to our cozy home!",
  h4_helicopter: "Huh... huh... huh... H is for Helicopter! Helicopter is hovering high!",
  h5_hippo: "Huh... huh... huh... H is for Hippo! Hippo loves to splash in water!",
  i1_ice_cream: "Ih... ih... ih... I is for Ice Cream! Yummy sweet ice cream!",
  i2_igloo: "Ih... ih... ih... I is for Igloo! A cool snowy igloo home!",
  i3_iguana: "Ih... ih... ih... I is for Iguana! Iguana is relaxing on a branch!",
  i4_island: "Ih... ih... ih... I is for Island! Look at the sunny palm tree island!",
  i5_ink: "Ih... ih... ih... I is for Ink! Ink writes magical words!",
  j1_juice: "Juh... juh... juh... J is for Juice! Refreshing orange juice!",
  j2_jellyfish: "Juh... juh... juh... J is for Jellyfish! Jellyfish floats so softly!",
  j3_jet: "Juh... juh... juh... J is for Jet! Jet zooms super fast!",
  j4_jaguar: "Juh... juh... juh... J is for Jaguar! Jaguar stretches happily!",
  j5_jug: "Juh... juh... juh... J is for Jug! Jug pours fresh water!",
  k1_kite: "Kuh... kuh... kuh... K is for Kite! Kite is flying high in the air!",
  k2_kangaroo: "Kuh... kuh... kuh... K is for Kangaroo! Boing boing hops the Kangaroo!",
  k3_koala: "Kuh... kuh... kuh... K is for Koala! Sweet Koala hugs the tree!",
  k4_king: "Kuh... kuh... kuh... K is for King! King wears a shiny crown!",
  k5_key: "Kuh... kuh... kuh... K is for Key! Magic key turns and unlocks!",
  l1_lion: "Luh... luh... luh... L is for Lion! The King Lion says roar!",
  l2_lamp: "Luh... luh... luh... L is for Lamp! Lamp shines bright and cozy!",
  l3_lemon: "Luh... luh... luh... L is for Lemon! Zesty yellow lemon!",
  l4_leaf: "Luh... luh... luh... L is for Leaf! Leaf floats softly down!",
  l5_lollipop: "Luh... luh... luh... L is for Lollipop! Sweet rainbow lollipop!",
  m1_monkey: "Muh... muh... muh... M is for Monkey! Monkey is swinging on a vine!",
  m2_moon: "Muh... muh... muh... M is for Moon! The Moon shines softly at night!",
  m3_mango: "Muh... muh... muh... M is for Mango! Sweet yellow mango!",
  m4_milk: "Muh... muh... muh... M is for Milk! Drink your healthy milk!",
  m5_mouse: "Muh... muh... muh... M is for Mouse! Squeak squeak says the little mouse!",
  n1_nest: "Nuh... nuh... nuh... N is for Nest! Look at the eggs in the nest!",
  n2_net: "Nuh... nuh... nuh... N is for Net! Catch the star with the net!",
  n3_nut: "Nuh... nuh... nuh... N is for Nut! Squirrel loves crunchy nuts!",
  n4_night: "Nuh... nuh... nuh... N is for Night! Beautiful starry night!",
  n5_needle: "Nuh... nuh... nuh... N is for Needle! Needle stitches thread so neatly!",
  o1_owl: "Oh... oh... oh... O is for Owl! Hoo hoo says the wise old owl!",
  o2_orange: "Oh... oh... oh... O is for Orange! Sweet and juicy orange!",
  o3_octopus: "Oh... oh... oh... O is for Octopus! Octopus waves all eight arms!",
  o4_ostrich: "Oh... oh... oh... O is for Ostrich! Ostrich runs super fast!",
  o5_onion: "Oh... oh... oh... O is for Onion! Little purple onion!",
  p1_panda: "Puh... puh... puh... P is for Panda! Cute Panda rolls on the grass!",
  p2_penguin: "Puh... puh... puh... P is for Penguin! Penguin waddles and slides!",
  p3_parrot: "Puh... puh... puh... P is for Parrot! Rainbow Parrot says hello!",
  p4_pencil: "Puh... puh... puh... P is for Pencil! Pencil draws beautiful shapes!",
  p5_pizza: "Puh... puh... puh... P is for Pizza! Cheesy delicious pizza slice!",
  q1_queen: "Kwuh... kwuh... kwuh... Q is for Queen! Queen waves her royal scepter!",
  q2_quail: "Kwuh... kwuh... kwuh... Q is for Quail! Cute little quail bird!",
  q3_quilt: "Kwuh... kwuh... kwuh... Q is for Quilt! Cozy warm blanket quilt!",
  q4_question_mark: "Kwuh... kwuh... kwuh... Q is for Question Mark! What will we learn next?",
  q5_quarter: "Kwuh... kwuh... kwuh... Q is for Quarter! Spin the shiny quarter coin!",
  r1_rabbit: "Ruh... ruh... ruh... R is for Rabbit! Hop hop goes the little rabbit!",
  r2_rocket: "Ruh... ruh... ruh... R is for Rocket! Blast off into space!",
  r3_rainbow: "Ruh... ruh... ruh... R is for Rainbow! Beautiful rainbow in the sky!",
  r4_ring: "Ruh... ruh... ruh... R is for Ring! Sparkly gold diamond ring!",
  r5_robot: "Ruh... ruh... ruh... R is for Robot! Beep boop does the friendly robot!",
  s1_sun: "Sss... sss... sss... S is for Sun! The bright warm sun is shining!",
  s2_star: "Sss... sss... sss... S is for Star! Twinkle twinkle little star!",
  s3_ship: "Sss... sss... sss... S is for Ship! Sail away on the blue ocean ship!",
  s4_snake: "Sss... sss... sss... S is for Snake! Friendly snake slithers along!",
  s5_strawberry: "Sss... sss... sss... S is for Strawberry! Yummy sweet strawberry!",
  t1_tiger: "Tuh... tuh... tuh... T is for Tiger! The little Tiger says roar!",
  t2_train: "Tuh... tuh... tuh... T is for Train! Choo choo goes the toy train!",
  t3_turtle: "Tuh... tuh... tuh... T is for Turtle! Slow and steady sea turtle!",
  t4_tree: "Tuh... tuh... tuh... T is for Tree! Big tall green tree!",
  t5_telephone: "Tuh... tuh... tuh... T is for Telephone! Ring ring goes the telephone!",
  u1_umbrella: "Uh... uh... uh... U is for Umbrella! Open the umbrella in the rain!",
  u2_unicorn: "Uh... uh... uh... U is for Unicorn! Magical unicorn with a rainbow mane!",
  u3_uniform: "Uh... uh... uh... U is for Uniform! Neat and tidy uniform!",
  u4_urn: "Uh... uh... uh... U is for Urn! Beautiful ceramic urn!",
  u5_underwater: "Uh... uh... uh... U is for Underwater! Explore deep underwater world!",
  v1_van: "Vuh... vuh... vuh... V is for Van! Beep beep goes the family van!",
  v2_violin: "Vuh... vuh... vuh... V is for Violin! Sweet music from the violin!",
  v3_vase: "Vuh... vuh... vuh... V is for Vase! Pretty flowers in a ceramic vase!",
  v4_volcano: "Vuh... vuh... vuh... V is for Volcano! Look at the friendly volcano!",
  v5_vegetables: "Vuh... vuh... vuh... V is for Vegetables! Healthy crunchy vegetables!",
  w1_whale: "Wuh... wuh... wuh... W is for Whale! The big blue whale spouts water!",
  w2_watermelon: "Wuh... wuh... wuh... W is for Watermelon! Fresh juicy watermelon slice!",
  w3_watch: "Wuh... wuh... wuh... W is for Watch! Tick tock goes the wrist watch!",
  w4_windmill: "Wuh... wuh... wuh... W is for Windmill! Windmill blades spinning round!",
  w5_wolf: "Wuh... wuh... wuh... W is for Wolf! Little wolf says a-woo!",
  x1_xylophone: "Ks... ks... ks... X is for Xylophone! Plink plank plays the xylophone!",
  x2_xray: "Ks... ks... ks... X is for X-Ray! X-ray shows the bones inside!",
  x3_xmas_tree: "Ks... ks... ks... X is for Xmas Tree! Shiny tree with glowing lights!",
  x4_xenops: "Ks... ks... ks... X is for Xenops! Tiny rain forest bird!",
  x5_xiphosura: "Ks... ks... ks... X is for Xiphosura! Friendly horseshoe crab!",
  y1_yacht: "Yuh... yuh... yuh... Y is for Yacht! Smooth sailing luxury yacht!",
  y2_yoyo: "Yuh... yuh... yuh... Y is for Yo-Yo! Up and down goes the yo-yo!",
  y3_yak: "Yuh... yuh... yuh... Y is for Yak! Fluffy shaggy mountain yak!",
  y4_yogurt: "Yuh... yuh... yuh... Y is for Yogurt! Yummy creamy strawberry yogurt!",
  y5_yarn: "Yuh... yuh... yuh... Y is for Yarn! Soft ball of wool yarn!",
  z1_zebra: "Zzz... zzz... zzz... Z is for Zebra! Black and white striped zebra!",
  z2_zipper: "Zzz... zzz... zzz... Z is for Zipper! Zip up and zip down!",
  z3_zoo: "Zzz... zzz... zzz... Z is for Zoo! Welcome to the fun animal zoo!",
  z4_zero: "Zzz... zzz... zzz... Z is for Zero! Round and round number zero!",
  z5_zucchini: "Zzz... zzz... zzz... Z is for Zucchini! Fresh green zucchini!",
};

const path = "D:/kids-learning-app/alphabet_phonics_3d_schema.json";
const data = JSON.parse(readFileSync(path, "utf8"));
data._rules = {
  use_schema_script_exactly: true,
  note: "Play elevenlabs_script as written. Do not invent a shorter line. Video loop can stay 3s; voice plays in full on tap.",
};

const BY_WORD = Object.fromEntries(
  Object.entries(ORIGINAL).map(([, script]) => {
    const match = script.match(/is for ([^!]+)!/);
    return [match ? match[1].trim().toLowerCase() : "", script];
  }),
);

let restored = 0;
let missing = [];
for (const [letter, block] of Object.entries(data)) {
  if (letter.startsWith("_") || !block?.variations) continue;
  for (const v of block.variations) {
    const script = ORIGINAL[v.id] || BY_WORD[v.word.trim().toLowerCase()];
    if (script) {
      v.elevenlabs_script = script;
      restored += 1;
    } else {
      missing.push(v.id);
    }
  }
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log(JSON.stringify({ restored, missing, a1: data.A.variations[0].elevenlabs_script }, null, 2));
