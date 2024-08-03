import SpeakerNewTalkPage from '../../page-objects/speaker/talk-new.page.ts';
import SpeakerTalkPage from '../../page-objects/speaker/talk.page.ts';
import SpeakerTalksPage from '../../page-objects/speaker/talks-list.page.ts';

describe('Speaker talks page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/talks-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const talks = new SpeakerTalksPage();
  const newTalk = new SpeakerNewTalkPage();
  const talk = new SpeakerTalkPage();

  it('displays the active speaker talks', () => {
    cy.login();
    talks.visit();
    talks.list().should('have.length', 2);
    talks.talk('Awesome talk').should('exist');
    talks.talk('Best talk ever').should('exist');
  });

  it('displays the archived talks', () => {
    cy.login();
    talks.visit();
    talks.displayArchivedTalks();
    talks.list().should('have.length', 1);
    talks.talk('Archived talk').should('exist');
    cy.assertUrl('/speaker/talks?archived=true');
  });

  it('can create a new talk from the list', () => {
    cy.login();
    talks.visit();
    talks.createNewTalk().click();
    newTalk.isPageVisible();
  });

  it('can edit an existing talk from the list', () => {
    cy.login();
    talks.visit();
    talks.talk('Awesome talk').click();
    talk.isPageVisible();
    cy.assertText('Awesome talk');
  });

  it('displays empty state when no talks', () => {
    cy.login('Bruce Wayne');
    talks.visit();
    cy.assertText('No talks found.');
  });
});
