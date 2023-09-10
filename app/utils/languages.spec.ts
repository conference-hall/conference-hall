import { describe, expect, it } from 'vitest';

import { getLanguage } from './languages';

describe('#getLanguage', () => {
  it('returns the label corresponding to the language code', () => {
    const result = getLanguage('fr');
    expect(result).toEqual('French');
  });

  it('returns nothing if language not found', () => {
    const result = getLanguage('xx');
    expect(result).toBeUndefined();
  });
});
