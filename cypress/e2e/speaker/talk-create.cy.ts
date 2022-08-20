import SpeakerNewTalkPage from 'page-objects/speaker-new-talk.page';
import SpeakerTalkPage from 'page-objects/speaker-talk.page';

describe('Speaker talk creation page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/talks-list');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const newTalk = new SpeakerNewTalkPage();
  const talk = new SpeakerTalkPage();

  it('can create a new talk', () => {
    newTalk.visit();
    newTalk.fillTalkForm({
      title: 'Awesome title',
      abstract: 'Awesome abstract',
      level: 'Intermediate',
      language: 'English',
      references: 'Best talk ever!',
    });
    newTalk.createAbstract().click();

    talk.isPageVisible();
    cy.assertText('Awesome title');
    cy.assertText('Awesome abstract');
    cy.assertText('Intermediate');
    cy.assertText('English');
    cy.assertText('Best talk ever!');
    cy.assertText('Clark Kent');
    cy.assertText('Owner');
  });

  it('display errors on mandatory fields', () => {
    newTalk.visit();
    newTalk.fillTalkForm({});
    newTalk.createAbstract().click();
    newTalk.error('Title').should('contain.text', 'String must contain at least 1 character(s)');
    newTalk.error('Abstract').should('contain.text', 'String must contain at least 1 character(s)');
  });
});
