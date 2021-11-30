/// <reference types="cypress" />
import { seedFromFile, resetTestDatabase } from '../../tests/db-helpers'

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  on('task', {
    'db:reset': async () => {
      await resetTestDatabase();
      return null;
    },
    'db:seed': async (fixtureFile) => {
      await seedFromFile(`${config.fixturesFolder}/${fixtureFile}.json`);
      return null;
    },
  });
};
