import { fastifyReactRouterDev } from '@mcansh/react-router-fastify/vite';
import mdx from '@mdx-js/rollup';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { loadEnvironment } from './servers/environment.server.ts';

const env = loadEnvironment();

export default defineConfig(() => ({
  plugins: [
    tailwindcss(),
    mdx(),
    reactRouter(),
    fastifyReactRouterDev({ entry: './servers/web.ts', externalizeServerEntryImports: ['#nonce'] }),
  ],
  resolve: { tsconfigPaths: true },
  server: { port: Number(env.PORT ?? 3000) },
}));
