import mdx from '@mdx-js/rollup';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    target: 'esnext',
    manifest: true,
    sourcemap: false,
    rollupOptions: isSsrBuild
      ? { input: { app: './servers/express/app.ts', index: './servers/web.prod.ts' } }
      : undefined,
  },
  plugins: [tailwindcss(), mdx(), reactRouter(), tsconfigPaths()],
}));
