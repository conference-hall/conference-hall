import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Add entry points
  entry: ['servers/*.ts', 'servers/express/app.ts', 'prisma/seed.ts'],

  // Add entry points for plugins
  playwright: {
    entry: ['e2e/**/*.setup.ts'],
  },
};

export default config;
