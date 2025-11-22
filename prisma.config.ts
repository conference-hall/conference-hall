import { defineConfig, env } from 'prisma/config';
import { loadEnvironment } from './servers/environment.server.ts';

loadEnvironment();

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
