import { getLevel } from './levels.ts';

describe('#getLevel', () => {
  it('returns the label corresponding to the level key', () => {
    expect(getLevel('BEGINNER')).toEqual('Beginner');
    expect(getLevel('INTERMEDIATE')).toEqual('Intermediate');
    expect(getLevel('ADVANCED')).toEqual('Advanced');
    expect(getLevel('XXX')).toBeUndefined();
  });
});
