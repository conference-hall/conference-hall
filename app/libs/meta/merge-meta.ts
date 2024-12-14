import type { MetaDescriptors } from 'react-router/route-module';

type MetaMatches = Array<{ meta: MetaDescriptors } | undefined>;

export function mergeMeta(matches: MetaMatches = [], routeMeta: MetaDescriptors = []) {
  const parentMeta = matches?.flatMap((match) => match?.meta ?? []);
  return deduplicateMetaTags([...parentMeta, ...routeMeta]);
}

function deduplicateMetaTags(meta: MetaDescriptors) {
  const metaReverse = meta.slice().reverse();
  const seen = new Set();
  return metaReverse.filter((tag) => {
    if (!tag) return false;

    let key = null;
    if ('title' in tag) key = 'title';
    if ('name' in tag) key = tag.name;
    if ('property' in tag) key = tag.property;

    return seen.has(key) ? false : seen.add(key);
  });
}
