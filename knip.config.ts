import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['servers/*.ts'],
  ignore: ['tests/fixtures/**'],
  // Loaded at runtime by pino via `transport.target`, not through an import
  ignoreDependencies: ['pino-pretty'],
};

export default config;
