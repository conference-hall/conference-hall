import SpeakerTalkPage from '../../page-objects/speaker/talk.page.ts';
import SpeakerEditTalkPage from '../../page-objects/speaker/talk-edit.page.ts';

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
    editTalk.saveAbstract();
    cy.assertToast('Talk updated.');

    talk.isPageVisible();
    cy.assertText('New title');
    cy.assertText('New abstract');
    cy.assertText('Beginner');
    cy.assertText('English');
    cy.assertText('New references');
  });

  it('can invite a co-speaker', () => {
    editTalk.visit('awesome-talk');
    editTalk.coSpeakerInvite().should('exist');
    editTalk.closeCoSpeakerModal();
  });

  it('can remove a co-speaker', () => {
    editTalk.visit('awesome-talk');
    cy.assertText('Bruce Wayne');
    editTalk.removeCoSpeaker('Bruce Wayne').click();
    cy.assertToast('Co-speaker removed from talk.');
    cy.assertNoText('Bruce Wayne');
  });

  it('display errors on mandatory fields', () => {
    editTalk.visit('awesome-talk');
    editTalk.fillTalkForm({
      title: ' ',
      abstract: ' ',
    });
    editTalk.saveAbstract();
    editTalk.error('Title').should('contain.text', 'String must contain at least 1 character(s)');
    editTalk.error('Abstract').should('contain.text', 'String must contain at least 1 character(s)');
  });
});
