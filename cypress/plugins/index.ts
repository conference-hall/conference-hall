/// <reference types="cypress" />
import { seed, resetDB } from './db-seed';

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  on('task', {
    'db:reset': async () => {
      await resetDB();
      return null;
    },
    'db:seed': async (fixtureFile) => {
      await seed(`${config.fixturesFolder}/${fixtureFile}.json`);
      return null;
    },
  });
};
