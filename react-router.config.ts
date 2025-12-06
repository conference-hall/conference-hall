import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  serverBuildFile: '[name].js',
  future: {
    unstable_optimizeDeps: true,
    unstable_subResourceIntegrity: false,
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
