import type { MetaDescriptor } from 'react-router';

type MetaMatches = Array<{ meta: MetaDescriptor[] } | undefined>;

export function mergeMeta(matches: MetaMatches, routeMeta: MetaDescriptor[]) {
  const parentMeta = matches?.flatMap((match) => match?.meta ?? []);
  return overrideMeta(parentMeta, routeMeta);
}

function overrideMeta(origin: MetaDescriptor[], overrides: MetaDescriptor[]) {
  const overriddenMeta = [...origin];
  for (const override of overrides) {
    const index = overriddenMeta.findIndex(
      (meta) =>
        ('name' in meta && 'name' in override && meta.name === override.name) ||
        ('property' in meta && 'property' in override && meta.property === override.property) ||
        ('title' in meta && 'title' in override),
    );
    if (index !== -1) {
      overriddenMeta.splice(index, 1, override);
    } else {
      overriddenMeta.push(override);
    }
  }
  return overriddenMeta;
}
