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
