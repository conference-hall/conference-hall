import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['servers/*.ts', 'servers/express/app.ts'],

  playwright: {
    entry: ['e2e/**/*.setup.ts'],
  },

  ignoreDependencies: ['@prisma/client'],
};

export default config;
