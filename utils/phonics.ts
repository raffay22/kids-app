export type PhonicsBlend = {
  id: string;
  blend: string;
  letter: string;
  example_word: string;
  speak_text: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  lottie_url?: string | null;
  variant_id?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
};

/** Offline fallback — preschool Aa/Bb display + phonetic speak_text */
export const FALLBACK_PHONICS: PhonicsBlend[] = [
  { id: "fb-aa", blend: "Aa", letter: "A", example_word: "Apple", speak_text: "Ah... ah... A is for Apple! Look, Apple is moving its eyes!", icon_name: "Apple", sort_order: 1, is_active: true, created_at: "", variant_id: "A1", video_url: "/phonics/A/a1_apple.mp4", audio_url: "/phonics/A/a1_apple.mp3" },
  { id: "fb-bb", blend: "Bb", letter: "B", example_word: "Ball", speak_text: "Buh... as in Ball", icon_name: "CircleDot", sort_order: 2, is_active: true, created_at: "" },
  { id: "fb-cc", blend: "Cc", letter: "C", example_word: "Cat", speak_text: "Cuh... as in Cat", icon_name: "Cat", sort_order: 3, is_active: true, created_at: "" },
  { id: "fb-dd", blend: "Dd", letter: "D", example_word: "Dog", speak_text: "Duh... as in Dog", icon_name: "Dog", sort_order: 4, is_active: true, created_at: "" },
  { id: "fb-ee", blend: "Ee", letter: "E", example_word: "Elephant", speak_text: "Eh... as in Elephant", icon_name: "Footprints", sort_order: 5, is_active: true, created_at: "" },
  { id: "fb-ff", blend: "Ff", letter: "F", example_word: "Fish", speak_text: "Fff... as in Fish", icon_name: "Fish", sort_order: 6, is_active: true, created_at: "" },
  { id: "fb-gg", blend: "Gg", letter: "G", example_word: "Garden", speak_text: "Guh... as in Garden", icon_name: "Sprout", sort_order: 7, is_active: true, created_at: "" },
  { id: "fb-hh", blend: "Hh", letter: "H", example_word: "Hat", speak_text: "Huh... as in Hat", icon_name: "HardHat", sort_order: 8, is_active: true, created_at: "" },
  { id: "fb-ii", blend: "Ii", letter: "I", example_word: "Igloo", speak_text: "Ih... as in Igloo", icon_name: "Home", sort_order: 9, is_active: true, created_at: "" },
  { id: "fb-jj", blend: "Jj", letter: "J", example_word: "Jump", speak_text: "Juh... as in Jump", icon_name: "ArrowUp", sort_order: 10, is_active: true, created_at: "" },
  { id: "fb-kk", blend: "Kk", letter: "K", example_word: "Kite", speak_text: "Kuh... as in Kite", icon_name: "Wind", sort_order: 11, is_active: true, created_at: "" },
  { id: "fb-ll", blend: "Ll", letter: "L", example_word: "Lion", speak_text: "Lll... as in Lion", icon_name: "Crown", sort_order: 12, is_active: true, created_at: "" },
  { id: "fb-mm", blend: "Mm", letter: "M", example_word: "Moon", speak_text: "Mmm... as in Moon", icon_name: "Moon", sort_order: 13, is_active: true, created_at: "" },
  { id: "fb-nn", blend: "Nn", letter: "N", example_word: "Nest", speak_text: "Nnn... as in Nest", icon_name: "Home", sort_order: 14, is_active: true, created_at: "" },
  { id: "fb-oo", blend: "Oo", letter: "O", example_word: "Orange", speak_text: "Off... as in Orange", icon_name: "Circle", sort_order: 15, is_active: true, created_at: "" },
  { id: "fb-pp", blend: "Pp", letter: "P", example_word: "Pizza", speak_text: "Puh... as in Pizza", icon_name: "Pizza", sort_order: 16, is_active: true, created_at: "" },
  { id: "fb-qq", blend: "Qq", letter: "Q", example_word: "Queen", speak_text: "Kwuh... as in Queen", icon_name: "Crown", sort_order: 17, is_active: true, created_at: "" },
  { id: "fb-rr", blend: "Rr", letter: "R", example_word: "Rain", speak_text: "Rrr... as in Rain", icon_name: "CloudRain", sort_order: 18, is_active: true, created_at: "" },
  { id: "fb-ss", blend: "Ss", letter: "S", example_word: "Sun", speak_text: "Sss... as in Sun", icon_name: "Sun", sort_order: 19, is_active: true, created_at: "" },
  { id: "fb-tt", blend: "Tt", letter: "T", example_word: "Tree", speak_text: "Tuh... as in Tree", icon_name: "Trees", sort_order: 20, is_active: true, created_at: "" },
  { id: "fb-uu", blend: "Uu", letter: "U", example_word: "Umbrella", speak_text: "Uh... as in Umbrella", icon_name: "CloudRain", sort_order: 21, is_active: true, created_at: "" },
  { id: "fb-vv", blend: "Vv", letter: "V", example_word: "Van", speak_text: "Vvv... as in Van", icon_name: "Truck", sort_order: 22, is_active: true, created_at: "" },
  { id: "fb-ww", blend: "Ww", letter: "W", example_word: "Water", speak_text: "Wuh... as in Water", icon_name: "Droplet", sort_order: 23, is_active: true, created_at: "" },
  { id: "fb-xx", blend: "Xx", letter: "X", example_word: "X-ray", speak_text: "Ks... as in X-ray", icon_name: "Scan", sort_order: 24, is_active: true, created_at: "" },
  { id: "fb-yy", blend: "Yy", letter: "Y", example_word: "Yawn", speak_text: "Yuh... as in Yawn", icon_name: "Smile", sort_order: 25, is_active: true, created_at: "" },
  { id: "fb-zz", blend: "Zz", letter: "Z", example_word: "Zebra", speak_text: "Zzz... as in Zebra", icon_name: "Footprints", sort_order: 26, is_active: true, created_at: "" },
  { id: "fb-sh", blend: "Sh", letter: "S", example_word: "Ship", speak_text: "Shhh... as in Ship", icon_name: "Ship", sort_order: 27, is_active: true, created_at: "" },
  { id: "fb-ch", blend: "Ch", letter: "C", example_word: "Chair", speak_text: "Chuh... as in Chair", icon_name: "Armchair", sort_order: 28, is_active: true, created_at: "" },
  { id: "fb-th", blend: "Th", letter: "T", example_word: "Thumb", speak_text: "Thhh... as in Thumb", icon_name: "ThumbsUp", sort_order: 29, is_active: true, created_at: "" },
  { id: "fb-ph", blend: "Ph", letter: "P", example_word: "Phone", speak_text: "Fff... as in Phone", icon_name: "Phone", sort_order: 30, is_active: true, created_at: "" },
  { id: "fb-wh", blend: "Wh", letter: "W", example_word: "Whale", speak_text: "Www... as in Whale", icon_name: "Fish", sort_order: 31, is_active: true, created_at: "" },
  { id: "fb-str", blend: "Str", letter: "S", example_word: "Street", speak_text: "Struh... as in Street", icon_name: "LayoutGrid", sort_order: 32, is_active: true, created_at: "" },
  { id: "fb-spr", blend: "Spr", letter: "S", example_word: "Spring", speak_text: "Spruh... as in Spring", icon_name: "Sprout", sort_order: 33, is_active: true, created_at: "" },
  { id: "fb-scr", blend: "Scr", letter: "S", example_word: "Scratch", speak_text: "Scruh... as in Scratch", icon_name: "Hand", sort_order: 34, is_active: true, created_at: "" },
  { id: "fb-thr", blend: "Thr", letter: "T", example_word: "Three", speak_text: "Thruuh... as in Three", icon_name: "Binary", sort_order: 35, is_active: true, created_at: "" },
  { id: "fb-spl", blend: "Spl", letter: "S", example_word: "Splash", speak_text: "Spluh... as in Splash", icon_name: "Droplets", sort_order: 36, is_active: true, created_at: "" },
];
