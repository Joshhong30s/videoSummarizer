const HIGHLIGHT_COLORS = [
  '#FFC107', 
  '#4CAF50', 
  '#2196F3', 
  '#E91E63', 
  '#9C27B0', 
  '#FF5722', 
];

let currentColorIndex = 0;

export function getNextHighlightColor() {
  const color = HIGHLIGHT_COLORS[currentColorIndex];
  currentColorIndex = (currentColorIndex + 1) % HIGHLIGHT_COLORS.length;
  return color;
}

export function getRandomHighlightColor() {
  const randomIndex = Math.floor(Math.random() * HIGHLIGHT_COLORS.length);
  return HIGHLIGHT_COLORS[randomIndex];
}

export function hexToRGBA(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
