import mdx from '@mdx-js/rollup';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  plugins: [tailwindcss(), mdx(), reactRouter()],
  resolve: { tsconfigPaths: true },
  environments: {
    ssr: {
      build: {
        ssr: true,
        rollupOptions: { input: { app: './servers/express/app.ts', index: './servers/web.prod.ts' } },
      },
    },
  },
}));
