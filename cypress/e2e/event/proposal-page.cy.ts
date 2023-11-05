import EventProposalPage from '../../page-objects/event/proposal.page.ts';
import EventProposalsPage from '../../page-objects/event/proposals.page.ts';
import EventSubmissionPage from '../../page-objects/event/submission.page.ts';

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
    proposal.editProposal();
    cy.assertText('Awesome talk');
  });

  it('can delete a proposal', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    proposal.deleteProposal();
    proposal.deleteConfirmDialog().should('exist');
    proposal.confirmDelete();
    cy.assertToast('Proposal submission removed.');

    proposals.isPageVisible();
    proposals.proposal('Awesome talk').should('not.exist');
  });

  it('can cancel proposal delete', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    proposal.deleteProposal();
    proposal.deleteConfirmDialog().should('exist');
    proposal.cancelDelete();
    cy.assertText('Awesome talk');
  });

  describe('displays different proposal status panels', () => {
    it('can submit a draft proposal', () => {
      proposal.visit('devfest-nantes', 'awesome-proposal2');
      cy.assertText('Draft proposal!');
      proposal.submitProposal();
      submission.isTalkStepVisible();
    });

    it('can confirm an accepted proposal', () => {
      proposal.visit('devfest-nantes', 'awesome-proposal3');
      cy.assertText('Proposal has been accepted to Devfest Nantes!');
      proposal.confirmProposal();
      cy.assertToast('Your response has been sent to organizers.');
    });

    it('can decline an accepted proposal', () => {
      proposal.visit('devfest-nantes', 'awesome-proposal3');
      cy.assertText('Proposal has been accepted to Devfest Nantes!');
      proposal.declineProposal();
      cy.assertToast('Your response has been sent to organizers.');
    });
  });
});
