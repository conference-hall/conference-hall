export function sortBy<T>(array: T[], attribute: keyof T): T[] {
  return array.sort((a: T, b: T) => {
    const nameA = String(a[attribute]).toLowerCase();
    const nameB = String(b[attribute]).toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}
