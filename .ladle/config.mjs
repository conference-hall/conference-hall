export default {
  viteConfig: process.cwd() + "/.ladle/vite.config.ts",
  port: 8888,
  stories: 'app/**/*.stories.{ts,tsx}',
  addons: {
    ladle: { enabled: false },
    rtl: { enabled: false },
  },
};
