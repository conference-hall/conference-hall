// TODO: add tests
// TODO: use them in avatar
const colors: string[] = [
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
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

export function getContrastColor(hex: string) {
  const rgb = Number.parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 158 ? '#000000' : '#ffffff';
}
