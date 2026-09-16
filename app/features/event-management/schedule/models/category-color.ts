// A session linked to a proposal takes the colour of that proposal's first category, `order` first.
// An uncoloured first category applies nothing: the session keeps whatever colour it already had.
// Callers pass the proposal's categories already sorted by `order`.
export function categoryColor(categories: Array<{ color: string | null }>): string | null {
  return categories.at(0)?.color ?? null;
}
