export const COLORS: string[] = [
  '#FF5F5F', // Red
  '#FF9A3C', // Orange
  '#FFD93D', // Yellow
  '#A6E35A', // Green
  '#53D8B4', // Teal
  '#3DC3FF', // Light Blue
  '#3A7FFF', // Blue
  '#8E5BFF', // Indigo
  '#D55FFF', // Purple
  '#FF5F99', // Pink
];

export function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * COLORS.length);
  return COLORS[randomIndex];
}

export function getContrastColor(hex: string) {
  const rgb = Number.parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 158 ? '#000000' : '#ffffff';
}

export function generateGradientColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const baseHue = Math.abs(hash) % 360;
  const color1 = `hsl(${baseHue}, 70%, 55%)`;
  const color2 = `hsl(${baseHue}, 70%, 65%)`;
  const color3 = `hsl(${baseHue}, 70%, 75%)`;

  return `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`;
}
