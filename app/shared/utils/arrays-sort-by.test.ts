import { sortBy } from './arrays-sort-by.ts';

describe('sortBy', () => {
  it('should sort an array of objects by a given string attribute', () => {
    const array = [
      { name: 'Charlie', age: 23 },
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    const sortedArray = sortBy(array, 'name');

    expect(sortedArray).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 23 },
    ]);
  });

  it('should sort an array of objects by a given numeric attribute', () => {
    const array = [
      { name: 'Charlie', age: 23 },
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    const sortedArray = sortBy(array, 'age');

    expect(sortedArray).toEqual([
      { name: 'Charlie', age: 23 },
      { name: 'Bob', age: 25 },
      { name: 'Alice', age: 30 },
    ]);
  });

  it('should sort an array of objects by a given date attribute', () => {
    const array = [
      { name: 'Charlie', createdAt: new Date('2025-03-15') },
      { name: 'Alice', createdAt: new Date('2025-01-10') },
      { name: 'Bob', createdAt: new Date('2025-02-20') },
    ];
    const sortedArray = sortBy(array, 'createdAt');

    expect(sortedArray).toEqual([
      { name: 'Alice', createdAt: new Date('2025-01-10') },
      { name: 'Bob', createdAt: new Date('2025-02-20') },
      { name: 'Charlie', createdAt: new Date('2025-03-15') },
    ]);
  });

  it('should sort in descending order when specified', () => {
    const array = [
      { name: 'Alice', age: 30 },
      { name: 'Charlie', age: 23 },
      { name: 'Bob', age: 25 },
    ];

    expect(sortBy(array, 'name', 'desc')).toEqual([
      { name: 'Charlie', age: 23 },
      { name: 'Bob', age: 25 },
      { name: 'Alice', age: 30 },
    ]);

    expect(sortBy(array, 'age', 'desc')).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 23 },
    ]);
  });

  it('should sort dates in descending order when specified', () => {
    const array = [
      { name: 'Alice', createdAt: new Date('2025-01-10') },
      { name: 'Bob', createdAt: new Date('2025-02-20') },
      { name: 'Charlie', createdAt: new Date('2025-03-15') },
    ];
    const sortedArray = sortBy(array, 'createdAt', 'desc');

    expect(sortedArray).toEqual([
      { name: 'Charlie', createdAt: new Date('2025-03-15') },
      { name: 'Bob', createdAt: new Date('2025-02-20') },
      { name: 'Alice', createdAt: new Date('2025-01-10') },
    ]);
  });

  it('should place null and undefined values last', () => {
    const array = [
      { name: 'Charlie', score: null as number | null },
      { name: 'Alice', score: 90 },
      { name: 'Bob', score: null as number | null },
      { name: 'Dave', score: 70 },
    ];

    expect(sortBy(array, 'score')).toEqual([
      { name: 'Dave', score: 70 },
      { name: 'Alice', score: 90 },
      { name: 'Charlie', score: null },
      { name: 'Bob', score: null },
    ]);

    expect(sortBy(array, 'score', 'desc')).toEqual([
      { name: 'Alice', score: 90 },
      { name: 'Dave', score: 70 },
      { name: 'Charlie', score: null },
      { name: 'Bob', score: null },
    ]);
  });

  it('should handle an empty array', () => {
    const array: { name: string; age: number }[] = [];
    const sortedArray = sortBy(array, 'name');

    expect(sortedArray).toEqual([]);
  });

  it('should handle an array with one element', () => {
    const array = [{ name: 'Alice', age: 30 }];
    const sortedArray = sortBy(array, 'name');

    expect(sortedArray).toEqual([{ name: 'Alice', age: 30 }]);
  });

  it('should be case insensitive when sorting strings', () => {
    const array = [
      { name: 'charlie', age: 23 },
      { name: 'alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    const sortedArray = sortBy(array, 'name');

    expect(sortedArray).toEqual([
      { name: 'alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'charlie', age: 23 },
    ]);
  });
});
