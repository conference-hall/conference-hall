import EventProposalPage from 'page-objects/event/proposal.page';
import EventProposalsPage from 'page-objects/event/proposals.page';
import EventSubmissionPage from 'page-objects/event/submission.page';

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

    cy.assertText('Proposal "Awesome talk"');
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
    proposals.proposal('Awesome talk').should('not.exist');
  });

  it('can cancel proposal delete', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    proposal.deleteProposal().click();
    proposal.deleteConfirmDialog().should('exist');
    proposal.cancelDelete().click();
    cy.assertText('Proposal "Awesome talk"');
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

  describe('displays different proposal status panels', () => {
    it('can submit a draft proposal', () => {
      proposal.visit('devfest-nantes', 'awesome-proposal2');
      cy.assertText('"My talk 2"" is in draft!');
      proposal.submitProposal().click();
      submission.isTalkStepVisible();
    });

    it('can confirm an accepted proposal', () => {
      proposal.visit('devfest-nantes', 'awesome-proposal3');
      cy.assertText('Congrats! "My talk 3" proposal has been accepted to Devfest Nantes!');
      proposal.confirmProposal().click();
      cy.assertText('Your participation to Devfest Nantes is confirmed, Thanks!');
    });

    it('can decline an accepted proposal', () => {
      proposal.visit('devfest-nantes', 'awesome-proposal3');
      cy.assertText('Congrats! "My talk 3" proposal has been accepted to Devfest Nantes!');
      proposal.declineProposal().click();
      cy.assertText('You have declined this proposal for Devfest Nantes.');
    });
  });
});
