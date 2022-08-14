import { defineConfig } from 'cypress';
import { config } from './app/services/config';
import { resetDB, disconnectDB } from './tests/db-helpers';

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: config.appUrl,
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      // setup custom task
      return on('task', {
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
    },
  },
});
