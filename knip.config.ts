import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['servers/*.ts', 'servers/express/app.ts'],
  ignore: ['tests/fixtures/**'],
};

export default config;
