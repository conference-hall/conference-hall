import { defineConfig } from 'cypress';
import admin from 'firebase-admin';
import { plugin as cypressFirebasePlugin } from 'cypress-firebase';
import { config as appConfig } from './app/services/config';
import { resetDB } from './tests/db-helpers';

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: appConfig.appUrl,
    env: {
      FIREBASE_API_KEY: appConfig.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: appConfig.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: appConfig.FIREBASE_PROJECT_ID,
      FIREBASE_AUTH_EMULATOR_HOST: appConfig.FIREBASE_AUTH_EMULATOR_HOST,
    },
    setupNodeEvents(on, config) {
      // setup cypress-firebase
      cypressFirebasePlugin(on, config, admin, {
        projectId: appConfig.FIREBASE_PROJECT_ID,
      });

      // setup custom task
      return on('task', {
        resetDB,
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
