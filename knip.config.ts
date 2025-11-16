import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    'packages/e2e': {
      playwright: {
        entry: ['tests/*.setup.ts'],
      },
    },
    'packages/database': {
      ignoreDependencies: ['@prisma/client'],
    },
    'packages/webapp': {
      entry: ['servers/*.ts', 'servers/express/app.ts'],
    },
  },
};

export default config;
