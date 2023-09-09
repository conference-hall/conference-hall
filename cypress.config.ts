import { defineConfig } from 'cypress';

import { disconnectDB, resetDB } from './tests/db-helpers';

const { PROTOCOL, DOMAIN, PORT } = process.env;
const APP_URL = `${PROTOCOL}://${DOMAIN}:${PORT}`;

export default defineConfig({
  experimentalMemoryManagement: true,
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: APP_URL,
    viewportWidth: 1440,
    viewportHeight: 800,
    scrollBehavior: 'center',
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
      });

      return config;
    },
  },
});
