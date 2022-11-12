import { defineConfig } from 'cypress';
import { config } from './app/services/config';
import { resetDB, disconnectDB } from './tests/db-helpers';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,
  reporter: isCI ? 'junit' : 'spec',
  reporterOptions: {
    mochaFile: './test-results/e2e-[hash].xml',
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: config.appUrl,
    experimentalSessionAndOrigin: true,
    scrollBehavior: 'center',
    setupNodeEvents(on) {
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
