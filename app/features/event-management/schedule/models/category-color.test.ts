import { categoryColor } from './category-color.ts';

describe('categoryColor', () => {
  it('returns the color of the first category', () => {
    expect(categoryColor([{ color: '#ff0000' }, { color: '#00ff00' }])).toBe('#ff0000');
  });

  it('returns null when the first category has no color, even if a later one has', () => {
    expect(categoryColor([{ color: null }, { color: '#00ff00' }])).toBe(null);
  });

  it('returns null without categories', () => {
    expect(categoryColor([])).toBe(null);
  });
});
