import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['servers/*.ts', 'servers/express/app.ts', 'prisma/scripts/*.ts'],
};

export default config;
