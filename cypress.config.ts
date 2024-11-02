import { defineConfig } from 'cypress';

import { flags } from './app/libs/feature-flags/flags.server.ts';
import { disconnectDB, resetDB } from './tests/db-helpers.ts';

export default defineConfig({
  experimentalMemoryManagement: true,
  screenshotOnRunFailure: false,
  e2e: {
    baseUrl: process.env.APP_URL,
    viewportWidth: 1440,
    viewportHeight: 800,
    scrollBehavior: 'center',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // setup custom task
      on('task', {
        disconnectDB,
        seedDB: async (name: string) => {
          try {
            await resetDB();
            const file = await import(`./cypress/e2e/${name}.seed.ts`);
            await file.seed();
          } catch (err) {
            console.error(err);
            throw new Error('An error occurred seeding the database');
          }
          return 'loaded';
        },
        setFlag: async (flag: { key: any; value: any }) => {
          await flags.set(flag.key, flag.value);
          return 'flag set';
        },
        resetFlags: async () => {
          await flags.resetDefaults();
          return 'flags reset';
        },
      });

      return config;
    },
  },
});
