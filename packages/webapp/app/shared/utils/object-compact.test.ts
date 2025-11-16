import { compactObject } from './object-compact.ts';

describe('compactObject', () => {
  it('removes undefined and null values', () => {
    const obj = { a: 1, b: undefined, c: null, d: 4 };
    const result = compactObject(obj);

    expect(result).toEqual({ a: 1, d: 4 });
  });

  it('returns an empty object when all values are undefined or null', () => {
    const obj = { a: undefined, b: null };
    const result = compactObject(obj);

    expect(result).toEqual({});
  });

  it('keeps falsy values like 0, false, and empty string', () => {
    const obj = { a: 0, b: false, c: '', d: null };
    const result = compactObject(obj);

    expect(result).toEqual({ a: 0, b: false, c: '' });
  });

  it('handles nested objects', () => {
    const obj = { a: { b: 1 }, c: null, d: undefined };
    const result = compactObject(obj);

    expect(result).toEqual({ a: { b: 1 } });
  });

  it('handles an empty object', () => {
    const obj = {};
    const result = compactObject(obj);

    expect(result).toEqual({});
  });

  it('does not modify the original object', () => {
    const obj = { a: 1, b: undefined, c: null };
    const result = compactObject(obj);

    expect(result).toEqual({ a: 1 });
    expect(obj).toEqual({ a: 1, b: undefined, c: null });
  });
});
