import LoginPage from 'page-objects/login.page';
import SearchEventPage from 'page-objects/search.page';
import SpeakerTalksPage from 'page-objects/speaker/talks-list.page';

describe('Authentication', () => {
  afterEach(() => cy.task('disconnectDB'));

  const login = new LoginPage();
  const search = new SearchEventPage();
  const speakers = new SpeakerTalksPage();

  it('login', () => {
    login.visit();
    login.signinWithGoogle('Clark Kent');

    search.isPageVisible();
    cy.clickOn('Open user menu');
    cy.assertText('Signed in as');
    cy.assertText('superman@example.com');
  });

  it('login and redirected', () => {
    login.visit('/speaker/talks');
    login.signinWithGoogle('Clark Kent');

    speakers.isPageVisible();
    cy.clickOn('Open user menu');
    cy.assertText('Signed in as');
    cy.assertText('superman@example.com');
  });
});
