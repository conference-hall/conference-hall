import { defineConfig } from 'cypress';
import { disconnectDB, resetDB } from './tests/db-helpers';
import { execFactoryTask } from './tests/factories/helpers/cypress';

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on) {
      return on('task', {
        resetDB,
        disconnectDB,
        factory: execFactoryTask,
      });
    },
  },
});
