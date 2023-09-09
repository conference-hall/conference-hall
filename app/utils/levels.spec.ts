import { describe, expect, it } from 'vitest';

import { getLevel } from './levels';

describe('#getLevel', () => {
  it('returns the label corresponding to the level key', () => {
    expect(getLevel('BEGINNER')).toEqual('Beginner');
    expect(getLevel('INTERMEDIATE')).toEqual('Intermediate');
    expect(getLevel('ADVANCED')).toEqual('Advanced');
    expect(getLevel('XXX')).toBeUndefined();
  });
});
