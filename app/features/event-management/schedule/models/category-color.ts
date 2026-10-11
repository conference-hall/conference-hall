export function categoryColor(categories: Array<{ color: string }>): string | null {
  return categories.at(0)?.color ?? null;
}
