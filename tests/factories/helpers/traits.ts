export function applyTraits<
  T extends Record<string, unknown>,
  S extends string[]
>(TRAITS: T, traits?: S) {
  return traits?.reduce((attributes, trait) => {
    const selected = TRAITS?.[trait];
    if (selected) {
      return Object.assign(attributes, selected);
    }
    return attributes;
  }, {});
}
