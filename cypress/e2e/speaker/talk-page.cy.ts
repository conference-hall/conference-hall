import EventProposalsPage from 'page-objects/event/proposals.page';
import EventSubmissionPage from 'page-objects/event/submission.page';
import SearchEventPage from 'page-objects/search.page';
import SpeakerEditTalkPage from 'page-objects/speaker/talk-edit.page';
import SpeakerTalkPage from 'page-objects/speaker/talk.page';
import SpeakerTalksPage from 'page-objects/speaker/talks-list.page';

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
    talk.speakersBlock().within(() => {
      cy.assertText('Clark Kent');
      cy.assertText('Bruce Wayne');
    });
  });

  it('can edit a talk', () => {
    talk.visit('awesome-talk');
    talk.editTalk();
    editTalk.isPageVisible();
    cy.assertText('Awesome talk');
  });

  it('can delete a talk', () => {
    talk.visit('awesome-talk');
    talk.deleteTalk();
    talk.deleteConfirmDialog().should('exist');
    talk.confirmDelete();

    talks.isPageVisible();
    cy.assertText('No talk abstracts yet!');
  });

  it('can cancel talk delete', () => {
    talk.visit('awesome-talk');
    talk.deleteTalk();
    talk.deleteConfirmDialog().should('exist');
    talk.cancelDelete();
    cy.assertText('Awesome talk');
  });

  it('can archive and restore a talk', () => {
    talk.visit('awesome-talk');
    talk.archiveTalk();
    cy.findByRole('button', { name: 'Restore' }).should('exist');
    talk.restoreTalk();
    cy.findByRole('button', { name: 'Restore' }).should('not.exist');
  });

  it('can submit a talk', () => {
    talk.visit('awesome-talk');
    talk.submitTalk();
    search.isPageVisible();
    cy.assertUrl('?talkId=awesome-talk');
    search.result('GDG Nantes').click();
    submission.isTalkStepVisible();
  });

  it('cannot submit a talk already submitted', () => {
    talk.visit('awesome-talk');
    talk.submitTalk();
    search.isPageVisible();
    cy.assertUrl('?talkId=awesome-talk');
    search.result('Devfest Nantes').click();
    cy.assertText('Talk already submitted.');
  });

  it('can invite a co-speaker', () => {
    talk.visit('awesome-talk');
    talk.generateCoSpeakerInvite().should('exist');
    talk.closeCoSpeakerModal();
  });

  it('can remove a co-speaker', () => {
    talk.visit('awesome-talk');
    cy.assertText('Bruce Wayne');
    talk.removeCoSpeaker('Bruce Wayne').click();
    cy.assertNoText('Bruce Wayne');
  });

  it('can see a submitted proposal of a talk', () => {
    talk.visit('awesome-talk');
    cy.assertText('Submissions');
    cy.findByRole('link', { name: 'Devfest Nantes' }).click();
    proposals.isPageVisible();
    proposals.list().should('have.length', 1);
    proposals.proposal('Awesome talk').should('exist');
  });
});
