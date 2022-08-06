// load type definitions that come with Cypress module
/// <reference types="cypress" />

import { attachCustomCommands } from 'cypress-firebase';

import '@testing-library/cypress/add-commands';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

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
      logUser(): void;
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

// Configure firebase
firebase.initializeApp({
  apiKey: Cypress.env('FIREBASE_API_KEY'),
  authDomain: Cypress.env('FIREBASE_AUTH_DOMAIN'),
  projectId: Cypress.env('FIREBASE_PROJECT_ID'),
});

firebase.auth().useEmulator(`http://${Cypress.env('FIREBASE_AUTH_EMULATOR_HOST')}/`);

attachCustomCommands({ Cypress, cy, firebase });

Cypress.Commands.add('logUser', () => {
  cy.login('9licQdPND0UtBhShJ7vveJ703sJs')
    .then(() => {
      return firebase.auth().currentUser?.getIdToken();
    })
    .then((tokenId) => {
      return cy.request({
        method: 'POST',
        url: '/login',
        body: { tokenId, redirectTo: '/speaker/talks' },
        form: true,
      });
    });
});
