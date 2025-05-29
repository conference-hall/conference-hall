import { deepEqual } from './deep-equal.ts';

describe('deepEqual', () => {
  describe('primitive values', () => {
    it('returns true for identical primitive values', () => {
      expect(deepEqual(42, 42)).toBe(true);
      expect(deepEqual('hello', 'hello')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('returns false for different primitive values', () => {
      expect(deepEqual(42, 43)).toBe(false);
      expect(deepEqual('hello', 'world')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('compares empty arrays as equal', () => {
      expect(deepEqual([], [])).toBe(true);
    });

    it('compares arrays with same primitive elements as equal', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    });

    it('identifies arrays with different elements as not equal', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(deepEqual(['a', 'b', 'c'], ['a', 'x', 'c'])).toBe(false);
    });

    it('identifies arrays with different lengths as not equal', () => {
      expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
      expect(deepEqual(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
    });

    it('compares nested arrays correctly', () => {
      expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
    });
  });

  describe('objects', () => {
    it('compares empty objects as equal', () => {
      expect(deepEqual({}, {})).toBe(true);
    });

    it('compares objects with same properties as equal', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(deepEqual({ a: 'test', b: true }, { a: 'test', b: true })).toBe(true);
    });

    it('identifies objects with different property values as not equal', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    });

    it('identifies objects with different properties as not equal', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
    });

    it('identifies objects with different number of properties as not equal', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('compares nested objects correctly', () => {
      expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
      expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false);
    });

    it('compares objects with array properties correctly', () => {
      expect(deepEqual({ a: [1, 2, 3] }, { a: [1, 2, 3] })).toBe(true);
      expect(deepEqual({ a: [1, 2, 3] }, { a: [1, 2, 4] })).toBe(false);
    });
  });

  describe('complex nested structures', () => {
    it('compares complex nested structures correctly', () => {
      const obj1 = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: 5, f: [6, 7] },
      };
      const obj2 = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: 5, f: [6, 7] },
      };
      expect(deepEqual(obj1, obj2)).toBe(true);

      const obj3 = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: 5, f: [6, 8] }, // Changed value
      };
      expect(deepEqual(obj1, obj3)).toBe(false);
    });
  });
});
