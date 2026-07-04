import path from 'node:path';
import type { FastifyReactRouterOptions } from '@mcansh/react-router-fastify';

type StaticOptions = NonNullable<FastifyReactRouterOptions['staticOptions']>;

const ONE_YEAR_IMMUTABLE = 'public, max-age=31536000, immutable';
const ONE_HOUR = 'public, max-age=3600';

// Cache headers for the client build files, replacing the adapter's built-in logic:
// fingerprinted assets and fonts are cached immutably for a year, every other file
// for an hour.
export function staticCacheHeaders(clientBuildDirectory: string): Pick<StaticOptions, 'setHeaders'> {
  const immutableDirectories = [
    path.resolve(clientBuildDirectory, 'assets'),
    path.resolve(clientBuildDirectory, 'fonts'),
  ];

  return {
    setHeaders(res, filePath) {
      const isImmutable = immutableDirectories.some((directory) => filePath.startsWith(directory + path.sep));
      res.setHeader('cache-control', isImmutable ? ONE_YEAR_IMMUTABLE : ONE_HOUR);
    },
  };
}
