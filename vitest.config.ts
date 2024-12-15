/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    restoreMocks: true,
    reporters: isCI ? ['default', 'junit'] : 'default',
    outputFile: './test-results/unit.xml',
  },
  server: { watch: { ignored: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'] } },
});
