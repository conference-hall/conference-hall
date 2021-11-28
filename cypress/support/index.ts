// load type definitions that come with Cypress module
/// <reference types="cypress" />

import '@testing-library/cypress/add-commands';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Click on a button by its name
       * @example cy.clickButton('search')
       */
      clickButton(name: string): void;
    }
  }
}

Cypress.Commands.add('clickButton', (name) => {
  cy.findByRole('button', { name }).click();
});
