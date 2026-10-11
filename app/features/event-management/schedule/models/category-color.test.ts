import { categoryColor } from './category-color.ts';

describe('categoryColor', () => {
  it('returns the color of the first category', () => {
    expect(categoryColor([{ color: '#ff0000' }, { color: '#00ff00' }])).toBe('#ff0000');
  });

  it('returns null without categories', () => {
    expect(categoryColor([])).toBe(null);
  });
});
