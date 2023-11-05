import EventProposalsPage from '../../page-objects/event/proposals.page.ts';
import EventSubmissionPage from '../../page-objects/event/submission.page.ts';
import SearchEventPage from '../../page-objects/search.page.ts';
import SpeakerTalkPage from '../../page-objects/speaker/talk.page.ts';
import SpeakerEditTalkPage from '../../page-objects/speaker/talk-edit.page.ts';

describe('Speaker talk page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/talk-page');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const talk = new SpeakerTalkPage();
  const editTalk = new SpeakerEditTalkPage();
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
    talk.editTalk();
    editTalk.isPageVisible();
    cy.assertText('Awesome talk');
  });

  it('can archive and restore a talk', () => {
    talk.visit('awesome-talk');
    talk.archiveTalk();
    cy.assertToast('Talk archived.');
    cy.findByRole('button', { name: 'Restore' }).should('exist');

    talk.restoreTalk();
    cy.findByRole('button', { name: 'Restore' }).should('not.exist');
    cy.assertToast('Talk restored.');
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
    talk.submitTalk(); // FLAKY
    search.isPageVisible();
    cy.assertUrl('?talkId=awesome-talk');
    search.result('Devfest Nantes').click();
    cy.assertText('Talk already submitted.');
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
