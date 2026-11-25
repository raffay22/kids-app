export const COLORING_PALETTE = [
  { id: "red", hex: "#FF3B30", label: "Red" },
  { id: "orange", hex: "#FF9500", label: "Orange" },
  { id: "yellow", hex: "#FFCC00", label: "Yellow" },
  { id: "lime", hex: "#8ECE3E", label: "Lime" },
  { id: "green", hex: "#34C759", label: "Green" },
  { id: "mint", hex: "#98D8C8", label: "Mint" },
  { id: "teal", hex: "#30B0C7", label: "Teal" },
  { id: "sky", hex: "#7EC8E3", label: "Sky Blue" },
  { id: "blue", hex: "#007AFF", label: "Blue" },
  { id: "navy", hex: "#1E3A8A", label: "Navy" },
  { id: "purple", hex: "#AF52DE", label: "Purple" },
  { id: "lavender", hex: "#C3B1E1", label: "Lavender" },
  { id: "pink", hex: "#FF6BB5", label: "Pink" },
  { id: "hot-pink", hex: "#FF2D55", label: "Hot Pink" },
  { id: "coral", hex: "#FF7F50", label: "Coral" },
  { id: "peach", hex: "#FFDAB9", label: "Peach" },
  { id: "brown", hex: "#A2845E", label: "Brown" },
  { id: "gold", hex: "#E6B422", label: "Gold" },
  { id: "cream", hex: "#FFF5E4", label: "Cream" },
  { id: "gray", hex: "#8E8E93", label: "Gray" },
  { id: "black", hex: "#1C1C1E", label: "Black" },
  { id: "eraser", hex: "#FFFFFF", label: "Eraser" },
] as const;

export type ColorSwatchId = (typeof COLORING_PALETTE)[number]["id"];

export const COLORING_STARS_AWARD = 10;
export const COLORING_COMPLETE_RATIO = 0.7;
