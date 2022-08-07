// load type definitions that come with Cypress module
/// <reference types="cypress" />

import '@testing-library/cypress/add-commands';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Click on a button or a link by its name
       * @example cy.clickOn('search')
       */
      clickOn(name: string | RegExp): void;

      /**
       * Type text in a text input by its label
       * @example cy.typeOn('label', 'Hello World')
       */
      typeOn(label: string | RegExp, text: string): void;

      /**
       * Assert the text exists in the page
       * @example cy.assertText('Hello World')
       */
      assertText(text: string): void;

      /**
       * Assert the page URL contains a path
       * @example cy.assertUrl('/search')
       */
      assertUrl(path: string): void;

      /**
       * Connect with a user
       */
      login(): void;
    }
  }
}

Cypress.Commands.add('clickOn', (name) => {
  cy.findByRole(/button|link/, { name }).click();
});

Cypress.Commands.add('typeOn', (label, text) => {
  cy.findByLabelText(label).type(text);
});

Cypress.Commands.add('assertText', (text) => {
  cy.findByText(text).should('exist');
});

Cypress.Commands.add('assertUrl', (path) => {
  cy.url().should('include', path);
});

Cypress.Commands.add('login', () => {
  cy.session([], () => {
    cy.visit('/login');
    cy.clickOn('Continue with Google');
    cy.url().should('contain', '/emulator');
    cy.findByText('Clark Kent').click();
    cy.url().should('equal', 'http://localhost:3001/');
  });
});
