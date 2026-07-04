import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['servers/*.ts'],
  ignore: ['tests/fixtures/**'],
};

export default config;
