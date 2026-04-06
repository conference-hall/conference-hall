import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['servers/*.ts', 'servers/express/app.ts', './scripts/*.ts'],
};

export default config;
