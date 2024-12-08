import { getObjectHash } from './object-hash.ts';

describe('getObjectHash', () => {
  it('should return the same signature for objects with the same keys and values in different orders', () => {
    const obj1 = { a: 'aa', b: ['ddd'] };
    const obj2 = { b: ['ddd'], a: 'aa' };
    expect(getObjectHash(obj1)).toBe(getObjectHash(obj2));
  });

  it('should return different signatures for objects with different keys or values', () => {
    const obj1 = { a: 'aa', b: ['ddd'] };
    const obj2 = { a: 'bb', b: ['ddd'] };

    expect(getObjectHash(obj1)).not.toBe(getObjectHash(obj2));
  });

  it('should return the same signature for deeply nested objects with the same structure and values', () => {
    const obj1 = { a: 'aa', b: { c: 'cc', d: ['ddd'] } };
    const obj2 = { b: { d: ['ddd'], c: 'cc' }, a: 'aa' };

    expect(getObjectHash(obj1)).toBe(getObjectHash(obj2));
  });

  it('should return different signatures for objects with different nested values', () => {
    const obj1 = { a: 'aa', b: { c: 'cc', d: ['ddd'] } };
    const obj2 = { a: 'aa', b: { c: 'cc', d: ['eee'] } };

    expect(getObjectHash(obj1)).not.toBe(getObjectHash(obj2));
  });

  it('should return the same signature for arrays with the same values in the same order', () => {
    const obj1 = { a: ['aa', 'bb'], b: ['ddd'] };
    const obj2 = { a: ['aa', 'bb'], b: ['ddd'] };

    expect(getObjectHash(obj1)).toBe(getObjectHash(obj2));
  });

  it('should return different signatures for arrays with the same values in different orders', () => {
    const obj1 = { a: ['aa', 'bb'], b: ['ddd'] };
    const obj2 = { a: ['bb', 'aa'], b: ['ddd'] };

    expect(getObjectHash(obj1)).not.toBe(getObjectHash(obj2));
  });
});
