import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['servers/*.ts', 'servers/express/app.ts'],
};

export default config;
