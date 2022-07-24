import { defineConfig } from 'cypress';
import { disconnectDB, resetDB } from './tests/db-helpers';

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on) {
      return on('task', {
        resetDB,
        disconnectDB,
        seedDB: async (name: string) => {
          try {
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
