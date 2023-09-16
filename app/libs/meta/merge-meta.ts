import type { MetaDescriptor, MetaFunction } from '@remix-run/node';

// source: https://gist.github.com/ryanflorence/ec1849c6d690cfbffcb408ecd633e069
export function mergeMeta<T>(overrideFn: MetaFunction<T>, appendFn?: MetaFunction<T>): MetaFunction<T> {
  return (arg) => {
    // get meta from parent routes
    let mergedMeta = arg.matches.reduce((acc, match: any) => {
      overrideMeta(acc, match.meta || []);
      return acc;
    }, [] as MetaDescriptor[]);

    // replace any parent meta with the same name or property with the override
    let overrides = overrideFn(arg);
    overrideMeta(mergedMeta, overrides);

    // append any additional meta
    if (appendFn) mergedMeta = mergedMeta.concat(appendFn(arg));

    return mergedMeta;
  };
}

function overrideMeta(origin: MetaDescriptor[], overrides: MetaDescriptor[]) {
  for (let override of overrides) {
    let index = origin.findIndex(
      (meta) =>
        ('name' in meta && 'name' in override && meta.name === override.name) ||
        ('property' in meta && 'property' in override && meta.property === override.property) ||
        ('title' in meta && 'title' in override) ||
        ('charset' in meta && 'charset' in override) ||
        ('viewport' in meta && 'viewport' in override),
    );
    if (index !== -1) {
      origin.splice(index, 1, override);
    } else {
      origin.push(override);
    }
  }
}
