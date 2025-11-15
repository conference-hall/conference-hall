import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['servers/*.ts', 'servers/express/app.ts', 'prisma/seed.ts'],
    },
    'packages/e2e': {
      playwright: {
        entry: ['tests/*.setup.ts'],
      },
    },
  },
};

export default config;
