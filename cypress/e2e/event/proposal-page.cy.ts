import EventProposalPage from 'page-objects/event-proposal.page';
import EventProposalsPage from 'page-objects/event-proposals.page';
import EventSubmissionPage from 'page-objects/event-submission.page';

describe('Event proposal page details', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/proposal-page');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const proposal = new EventProposalPage();
  const proposals = new EventProposalsPage();
  const submission = new EventSubmissionPage();

  it('displays talk data', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');

    cy.assertText('Awesome talk');
    cy.assertText('Awesome abstract');
    cy.assertText('Awesome references');
    cy.assertText('Advanced');
    cy.assertText('French');
    cy.assertText('Clark Kent');
    cy.assertText('Bruce Wayne');
    cy.assertText('Quickie');
    cy.assertText('Web');
  });

  it('can edit a proposal', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    proposal.editProposal().click();
    cy.assertText('Awesome talk');
  });

  it('can delete a proposal', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    proposal.deleteProposal().click();
    proposal.deleteConfirmDialog().should('exist');
    proposal.confirmDelete().click();

    proposals.isPageVisible();
    cy.assertText('No submitted proposals yet!');
  });

  it('can cancel proposal delete', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    proposal.deleteProposal().click();
    proposal.deleteConfirmDialog().should('exist');
    proposal.cancelDelete().click();
    cy.assertText('Awesome talk');
  });

  it('can invite a co-speaker', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    proposal.generateCoSpeakerInvite().should('exist');
    proposal.closeCoSpeakerModal();
  });

  it('can remove a co-speaker', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    cy.assertText('Bruce Wayne');
    proposal.removeCoSpeaker('Bruce Wayne').click();
    proposal.isPageVisible();
    cy.assertNoText('Bruce Wayne');
  });

  it('can submit a draft proposal', () => {
    proposal.visit('event-with-draft', 'awesome-proposal2');
    cy.assertText("This proposal is still in draft. Don't forget to submit it.");
    proposal.submitProposal().click();
    submission.isTalkStepVisible();
  });
});
