import SpeakerEditTalkPage from 'page-objects/speaker/talk-edit.page';
import SpeakerTalkPage from 'page-objects/speaker/talk.page';

describe('Speaker talk edition page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/talk-edit');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const editTalk = new SpeakerEditTalkPage();
  const talk = new SpeakerTalkPage();

  it('can edit a talk', () => {
    editTalk.visit('awesome-talk');

    cy.assertInputText('Title', 'Awesome talk');
    cy.assertInputText('Abstract', 'Awesome abstract');
    cy.assertRadioChecked('Advanced');
    cy.assertInputText('References', 'Awesome references');

    editTalk.fillTalkForm({
      title: 'New title',
      abstract: 'New abstract',
      level: 'Beginner',
      language: 'English',
      references: 'New references',
    });
    editTalk.saveAbstract().click();

    talk.isPageVisible();
    cy.assertText('New title');
    cy.assertText('New abstract');
    cy.assertText('Beginner');
    cy.assertText('English');
    cy.assertText('New references');
  });

  it('display errors on mandatory fields', () => {
    editTalk.visit('awesome-talk');
    editTalk.fillTalkForm({
      title: ' ',
      abstract: ' ',
    });
    editTalk.saveAbstract().click();
    editTalk.error('Title').should('contain.text', 'String must contain at least 1 character(s)');
    editTalk.error('Abstract').should('contain.text', 'String must contain at least 1 character(s)');
  });
});
