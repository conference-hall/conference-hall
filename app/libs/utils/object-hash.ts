export function getObjectHash(obj: Record<string, any>): string {
  const sortedObjectString = JSON.stringify(sortObjectKeys(obj));
  return simpleHash(sortedObjectString);
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = sortObjectKeys(obj[key]);
          return result;
        },
        {} as Record<string, any>,
      );
  }
  return obj;
}

function simpleHash(str: string): string {
  let hash = 0;
  let i;
  let chr;

  if (str.length === 0) return hash.toString();

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash.toString();
}
