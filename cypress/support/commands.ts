// load type definitions that come with Cypress module
/// <reference types="cypress" />

export {}; // make the file a module, to get rid of the warning

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Click on button, link or checkbox by its name
       * @example cy.clickOn('search')
       */
      clickOn(name: string | RegExp): void;

      /**
       * Select a value on a list box
       * @example cy.selectOn('Sex', 'Female')
       */
      selectOn(label: string | RegExp, value: string): void;

      /**
       * Type text in a text input by its label
       * @example cy.typeOn('label', 'Hello World')
       */
      typeOn(label: string | RegExp, text: string): void;

      /**
       * Assert if a checkbox or radio is checked
       * @example cy.assertChecked('name')
       */
      assertChecked(text: string): void;

      /**
       * Assert the text exists in the page
       * @example cy.assertText('Hello World')
       */
      assertText(text: string): void;

      /**
       * Assert the text exists in an input
       * @example cy.assertInputText('label', 'Hello World')
       */
      assertInputText(label: string | RegExp, text: string): void;

      /**
       * Assert the page URL contains a path
       * @example cy.assertUrl('/search')
       */
      assertUrl(path: string | RegExp): void;

      /**
       * Connect with a user
       */
      login(): void;
    }
  }
}

Cypress.Commands.add('clickOn', (name) => {
  cy.findByRole(/button|link|checkbox|radio/, { name }).click({ force: true });
});

Cypress.Commands.add('selectOn', (label, value) => {
  cy.findByLabelText(label).click({ force: true });
  cy.findByRole('option', { name: value }).click({ force: true }).type('{esc}');
});

Cypress.Commands.add('typeOn', (label, text) => {
  cy.findByLabelText(label).clear().type(text, { force: true });
});

Cypress.Commands.add('assertText', (text) => {
  cy.findByText(text).should('exist');
});

Cypress.Commands.add('assertInputText', (label, text) => {
  cy.findByLabelText(label).should('contain.value', text);
});

Cypress.Commands.add('assertUrl', (path) => {
  if (typeof path === 'string') {
    cy.url().should('include', path);
  } else {
    cy.url().should('match', path);
  }
});

Cypress.Commands.add('assertChecked', (name) => {
  cy.findAllByRole(/checkbox|radio/, { name })
    .then((elements) => elements[0])
    .should('be.checked');
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
