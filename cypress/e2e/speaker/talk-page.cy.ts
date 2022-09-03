import EventProposalsPage from 'page-objects/event-proposals.page';
import SearchEventPage from 'page-objects/event-search.page';
import EventSubmissionPage from 'page-objects/event-submission.page';
import SpeakerEditTalkPage from 'page-objects/speaker-edit-talk.page';
import SpeakerTalkPage from 'page-objects/speaker-talk.page';
import SpeakerTalksPage from 'page-objects/speaker-talks.page';

describe('Speaker talk page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/talk-page');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const talk = new SpeakerTalkPage();
  const editTalk = new SpeakerEditTalkPage();
  const talks = new SpeakerTalksPage();
  const search = new SearchEventPage();
  const submission = new EventSubmissionPage();
  const proposals = new EventProposalsPage();

  it('displays talk data', () => {
    talk.visit('awesome-talk');

    cy.assertText('Awesome talk');
    cy.assertText('Awesome abstract');
    cy.assertText('Awesome references');
    cy.assertText('Advanced');
    cy.assertText('French');
    cy.assertText('Clark Kent');
    cy.assertText('Bruce Wayne');
  });

  it('can edit a talk', () => {
    talk.visit('awesome-talk');
    talk.editTalk().click();
    editTalk.isPageVisible();
    cy.assertText('Awesome talk');
  });

  it('can delete a talk', () => {
    talk.visit('awesome-talk');
    talk.deleteTalk().click();
    talk.deleteConfirmDialog().should('exist');
    talk.confirmDelete().click();

    talks.isPageVisible();
    cy.assertText('No talk abstracts yet!');
  });

  it('can cancel talk delete', () => {
    talk.visit('awesome-talk');
    talk.deleteTalk().click();
    talk.deleteConfirmDialog().should('exist');
    talk.cancelDelete().click();
    cy.assertText('Awesome talk');
  });

  it('can archive and restore a talk', () => {
    talk.visit('awesome-talk');
    talk.archiveTalk().click();
    talk.restoreTalk().should('exist');
    talk.restoreTalk().click();
    talk.archiveTalk().should('exist');
  });

  it('can submit a talk', () => {
    talk.visit('awesome-talk');
    talk.submitTalk().click();
    search.isPageVisible();
    cy.assertUrl('?talkId=awesome-talk');
    search.result('GDG Nantes').click();
    submission.isTalkStepVisible();
  });

  it('cannot submit a talk already submitted', () => {
    talk.visit('awesome-talk');
    talk.submitTalk().click();
    search.isPageVisible();
    cy.assertUrl('?talkId=awesome-talk');
    search.result('Devfest Nantes').click();
    cy.assertText('Talk proposal already submitted.');
  });

  it('can invite a co-speaker', () => {
    talk.visit('awesome-talk');
    talk.generateCoSpeakerInvite().should('exist');
    talk.closeCoSpeakerModal();
  });

  it.only('can remove a co-speaker', () => {
    talk.visit('awesome-talk');
    cy.assertText('Bruce Wayne');
    talk.removeCoSpeaker('Bruce Wayne').click();
    cy.assertNoText('Bruce Wayne');
  });

  it('can see a submitted proposal of a talk', () => {
    talk.visit('awesome-talk');
    cy.assertText('Submissions');
    cy.clickOn('Devfest Nantes');
    proposals.isPageVisible();
    proposals.list().should('have.length', 1);
    proposals.proposal('Awesome talk').should('exist');
  });
});