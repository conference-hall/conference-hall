import SpeakerTalkPage from '../../page-objects/speaker/talk.page.ts';

describe('Speaker talk edition page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/talk-edit');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const talk = new SpeakerTalkPage();

  it('can edit a talk', () => {
    talk.visit('awesome-talk');
    const editTalk = talk.editTalk();

    cy.assertInputText('Title', 'Awesome talk');
    cy.assertInputText('Abstract', 'Awesome abstract');
    cy.assertRadioChecked('Advanced');
    cy.assertInputText('References', 'Awesome references');

    editTalk.fillForm({
      title: 'New title',
      abstract: 'New abstract',
      level: 'Beginner',
      language: 'English',
      references: 'New references',
    });

    editTalk.save();
    cy.assertToast('Talk updated.');
    editTalk.close();

    talk.isPageVisible();
    cy.assertText('New title');
    cy.assertText('New abstract');
    cy.assertText('Beginner');
    cy.assertText('English');
    talk.openReferences();
    cy.assertText('New references');
  });

  it('can invite a co-speaker', () => {
    talk.visit('awesome-talk');
    const cospeaker = talk.cospeakers();
    cospeaker.inviteSpeaker();
    cospeaker.closeSpeakerModal();
  });

  it('can remove a co-speaker', () => {
    talk.visit('awesome-talk');
    const cospeaker = talk.cospeakers();
    cospeaker.openSpeakerModal('Bruce Wayne');
    cospeaker.removeCoSpeaker('Bruce Wayne');
    cy.assertToast('Co-speaker removed from talk.');
    cy.assertNoText('Bruce Wayne');
  });

  it('display errors on mandatory fields', () => {
    talk.visit('awesome-talk');
    const editTalk = talk.editTalk();

    editTalk.fillForm({ title: ' ', abstract: ' ' });
    editTalk.save();
    editTalk.inputError('Title').should('contain.text', 'String must contain at least 1 character(s)');
    editTalk.inputError('Abstract').should('contain.text', 'String must contain at least 1 character(s)');
  });
});
