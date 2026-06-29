import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  serverBuildFile: '[name].js',
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
