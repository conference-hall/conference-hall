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
      clickOn(name: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /**
       * Select a value on a list box
       * @example cy.selectOn('Sex', 'Female')
       */
      selectOn(label: string | RegExp, value: string, exit?: boolean): Chainable<JQuery<HTMLElement>>;

      /**
       * Type text in a text input by its label
       * @example cy.typeOn('label', 'Hello World')
       */
      typeOn(label: string | RegExp, text: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Assert if a checkbox is checked
       * @example cy.assertChecked('name')
       */
      assertChecked(text: string | RegExp): void;

      /**
       * Assert if a radio is checked
       * @example cy.assertRadioChecked('name')
       */
      assertRadioChecked(text: string): void;

      /**
       * Assert the text exists in the page
       * @example cy.assertText('Hello World')
       */
      assertText(text: string): void;

      /**
       * Assert the text doesn't exist in the page
       * @example cy.assertNoText('Hello World')
       */
      assertNoText(text: string): void;

      /**
       * Assert the text exists in an input
       * @example cy.assertInputText('label', 'Hello World')
       */
      assertInputText(label: string | RegExp, text: string): void;

      /**
       * Assert the link exists in the page
       * @example cy.assertLink('Hello World', 'https://hello.world')
       */
      assertLink(name: string, href: string): void;

      /**
       * Assert the page URL contains a path
       * @example cy.assertUrl('/search')
       */
      assertUrl(path: string | RegExp): void;

      /**
       * Assert a toast display a label
       * @param label Label of the toast
       */
      assertToast(label: string): void;

      /**
       * Connect with a user
       */
      login(username?: string): void;
    }
  }
}

Cypress.Commands.add('clickOn', (name) => {
  return cy.findByRole(/button|link|checkbox|radio/, { name: RegExp(`.*${name}.*`) }).click();
});

Cypress.Commands.add('selectOn', (label, value, exit = true) => {
  cy.findByLabelText(label).click();
  const select = cy.findByRole('option', { name: value }).click();
  if (exit) select.type('{esc}');
});

Cypress.Commands.add('typeOn', (label: string | RegExp, text: string) => {
  return cy.findByLabelText(label).clear().type(text);
});

Cypress.Commands.add('assertText', (text) => {
  cy.findByText(text).should('exist');
});

Cypress.Commands.add('assertNoText', (text) => {
  cy.findByText(text).should('not.exist');
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

Cypress.Commands.add('assertLink', (name, href) => {
  cy.findByRole('link', { name }).should('have.attr', 'href', href);
});

Cypress.Commands.add('assertChecked', (name) => {
  cy.findAllByRole('checkbox', { name, checked: true });
});

Cypress.Commands.add('assertRadioChecked', (name) => {
  cy.findAllByRole('radio', { name, checked: true });
});

Cypress.Commands.add('login', (username = 'Clark Kent') => {
  cy.session(
    [username],
    () => {
      cy.visit('/login');
      cy.findByRole('heading', { name: 'Log in to Conference Hall' }).should('exist');
      cy.clickOn('Continue with Google');
      cy.assertText('Please select an existing account in the Auth Emulator or add a new one:');
      cy.findByText(username).click();
      cy.assertText('Conferences and meetups.');
    },
    { cacheAcrossSpecs: true }
  );
});

Cypress.Commands.add('assertToast', (label) => {
  cy.get('#toast').should('contain.text', label);
});
