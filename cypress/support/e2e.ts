// load type definitions that come with Cypress module
/// <reference types="cypress" />

import '@testing-library/cypress/add-commands';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       */
      visitAndCheck: typeof visitAndCheck;

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

Cypress.Commands.add('selectOn', (label, value, exit = true) => {
  cy.findByLabelText(label).click();
  cy.findByRole('option', { name: value }).click();
  if (exit) cy.findByLabelText(label).click();
});

Cypress.Commands.add('typeOn', (label: string | RegExp, text: string) => {
  cy.findByLabelText(label).as('input');
  cy.get('@input').clear();
  return cy.get('@input').type(text);
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
      cy.visitAndCheck('/auth/login');
      cy.findByRole('heading', { name: 'Sign in to your account' }).should('exist');
      cy.findByRole('button', { name: 'Google' }).click();
      cy.assertText('Please select an existing account in the Auth Emulator or add a new one:');
      cy.findByText(username).click();
      cy.findByRole('searchbox', { name: 'Search conferences and meetups.' }).should('exist');
    },
    { cacheAcrossSpecs: true },
  );
});

Cypress.Commands.add('assertToast', (label) => {
  cy.get('[data-sonner-toast]').should('contain.text', label);
});

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
function visitAndCheck(url: string, options?: Partial<Cypress.VisitOptions>) {
  cy.visit(url, options);
  cy.location('pathname').should('contain', url).wait(500);
}

Cypress.Commands.add('visitAndCheck', visitAndCheck);

// Cypress and React Hydrating the document don't get along
// for some unknown reason. Hopefully we figure out why eventually
// so we can remove this.
Cypress.on('uncaught:exception', (err) => {
  if (
    /hydrat/i.test(err.message) ||
    /Minified React error #418/.test(err.message) ||
    /Minified React error #423/.test(err.message) ||
    /The user aborted a request/.test(err.message)
  ) {
    return false;
  }
});

// Set default locale for e2e tests
Cypress.on('test:before:run', () => {
  Cypress.automation('remote:debugger:protocol', {
    command: 'Emulation.setLocaleOverride',
    params: {
      locale: 'en-GB',
    },
  });
});

// Set default timezone for e2e tests
Cypress.on('test:before:run', () => {
  Cypress.automation('remote:debugger:protocol', {
    command: 'Emulation.setTimezoneOverride',
    params: {
      timezoneId: 'Europe/Paris',
    },
  });
});

afterEach(() => {
  cy.task('disconnectDB');
  cy.task('resetFlags');
});
