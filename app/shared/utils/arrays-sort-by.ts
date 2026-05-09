type SortableValue = string | number | Date | null | undefined;

type SortableKeys<T> = {
  [K in keyof T]: T[K] extends SortableValue ? K : never;
}[keyof T];

export function sortBy<T>(array: T[], attribute: SortableKeys<T>, order: 'asc' | 'desc' = 'asc'): T[] {
  return array?.toSorted((a: T, b: T) => {
    const valA = a[attribute as keyof T];
    const valB = b[attribute as keyof T];

    const nullA = valA === null || valA === undefined;
    const nullB = valB === null || valB === undefined;

    if (nullA && nullB) return 0;
    if (nullA) return 1;
    if (nullB) return -1;

    let result: number;

    if (typeof valA === 'string' && typeof valB === 'string') {
      result = valA.toLowerCase().localeCompare(valB.toLowerCase());
    } else if (valA instanceof Date && valB instanceof Date) {
      result = valA.getTime() - valB.getTime();
    } else {
      result = Number(valA) - Number(valB);
    }

    return order === 'desc' ? -result : result;
  });
}
