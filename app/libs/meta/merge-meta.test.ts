import type { MetaDescriptors } from 'react-router/route-module';
import { mergeMeta } from './merge-meta.ts';

describe('mergeMeta', () => {
  it('merges meta from matches and routeMeta', () => {
    const matches = [
      { meta: [{ name: 'description', content: 'Parent description' }] },
      { meta: [{ name: 'keywords', content: 'Parent keywords' }] },
    ];
    const routeMeta = [{ name: 'description', content: 'Route description' }];

    const result = mergeMeta(matches, routeMeta);
    expect(result).toEqual([
      { name: 'description', content: 'Route description' },
      { name: 'keywords', content: 'Parent keywords' },
    ]);
  });

  it('overrides and deduplicate parent meta with routeMeta', () => {
    const matches = [
      {
        meta: [
          { name: 'description', content: 'Parent description' },
          { name: 'description', content: 'Parent description 2' },
        ],
      },
    ];
    const routeMeta = [{ name: 'description', content: 'Route description' }];

    const result = mergeMeta(matches, routeMeta);
    expect(result).toEqual([{ name: 'description', content: 'Route description' }]);
  });

  it('appends routeMeta if no matching parent meta', () => {
    const matches = [{ meta: [{ name: 'keywords', content: 'Parent keywords' }] }];
    const routeMeta = [{ name: 'description', content: 'Route description' }];

    const result = mergeMeta(matches, routeMeta);
    expect(result).toEqual([
      { name: 'description', content: 'Route description' },
      { name: 'keywords', content: 'Parent keywords' },
    ]);
  });

  it('handles meta descriptors with title and property', () => {
    const matches = [
      { meta: [{ title: 'Parent Title' }] },
      { meta: [{ property: 'og:title', content: 'Parent OG Title' }] },
    ];
    const routeMeta = [{ title: 'Route Title' }, { property: 'og:title', content: 'Route OG Title' }];

    const result = mergeMeta(matches, routeMeta);
    expect(result).toEqual([{ property: 'og:title', content: 'Route OG Title' }, { title: 'Route Title' }]);
  });

  it('handles empty matches and routeMeta', () => {
    const matches: Array<{ meta: MetaDescriptors }> = [];
    const routeMeta: MetaDescriptors = [];

    const result = mergeMeta(matches, routeMeta);
    expect(result).toEqual([]);
  });
});
