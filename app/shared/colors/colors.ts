export const DEFAULT_COLOR = '#9CA3AF';

export const COLORS = [
  { hex: '#FF5F5F', name: 'red' },
  { hex: '#FF9A3C', name: 'orange' },
  { hex: '#FFD93D', name: 'yellow' },
  { hex: '#A6E35A', name: 'green' },
  { hex: '#53D8B4', name: 'teal' },
  { hex: '#3DC3FF', name: 'light-blue' },
  { hex: '#3A7FFF', name: 'blue' },
  { hex: '#8E5BFF', name: 'indigo' },
  { hex: '#D55FFF', name: 'purple' },
  { hex: '#FF5F99', name: 'pink' },
  { hex: DEFAULT_COLOR, name: 'gray' },
] as const;

export const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(color: string | null | undefined): color is string {
  return typeof color === 'string' && HEX_COLOR_REGEX.test(color);
}

export function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * COLORS.length);
  return COLORS[randomIndex].hex;
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
