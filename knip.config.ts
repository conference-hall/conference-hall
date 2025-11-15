import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['servers/*.ts', 'servers/express/app.ts'],
    },
    'packages/e2e': {
      playwright: {
        entry: ['tests/*.setup.ts'],
      },
    },
    'packages/database': {
      ignoreDependencies: ['@prisma/client'],
    },
  },
};

export default config;
