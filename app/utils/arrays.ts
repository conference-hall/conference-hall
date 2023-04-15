export function sortBy<T>(array: T[], attribute: keyof T): T[] {
  return array.sort((a: T, b: T) => {
    var nameA = String(a[attribute]).toLowerCase();
    var nameB = String(b[attribute]).toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}
