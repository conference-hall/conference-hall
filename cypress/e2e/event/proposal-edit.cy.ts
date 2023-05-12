import EventEditProposalPage from 'page-objects/event/proposal-edit.page';
import EventProposalPage from 'page-objects/event/proposal.page';

describe('Speaker proposal edition page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/proposal-edit');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const editProposal = new EventEditProposalPage();
  const proposal = new EventProposalPage();

  it('can edit a proposal', () => {
    editProposal.visit('devfest-nantes', 'awesome-proposal');

    cy.assertInputText('Title', 'Awesome talk');
    cy.assertInputText('Abstract', 'Awesome abstract');
    cy.assertRadioChecked('Advanced');
    cy.assertInputText('References', 'Awesome references');

    editProposal.fillProposalForm({
      title: 'New title',
      abstract: 'New abstract',
      level: 'Beginner',
      language: 'English',
      references: 'New references',
    });
    editProposal.selectFormatTrack('Quickie');
    editProposal.selectCategoryTrack('Web');
    editProposal.saveAbstract().click();

    cy.assertText('You have to select at least one proposal format.');
    cy.assertText('You have to select at least one proposal category.');

    editProposal.selectFormatTrack('Quickie 2');
    editProposal.selectCategoryTrack('Web 2');
    editProposal.saveAbstract().click();
    cy.assertToast('Proposal saved.');

    proposal.isPageVisible();
    cy.assertText('New title');
    cy.assertText('New abstract');
    cy.assertText('Beginner');
    cy.assertText('English');
    cy.assertText('New references');
    cy.assertText('Quickie 2');
    cy.assertText('Web 2');
  });

  it('can invite a co-speaker', () => {
    editProposal.visit('devfest-nantes', 'awesome-proposal');
    editProposal.coSpeakerInvite().should('exist');
    editProposal.closeCoSpeakerModal();
  });

  it('can remove a co-speaker', () => {
    editProposal.visit('devfest-nantes', 'awesome-proposal');
    cy.assertText('Bruce Wayne');
    editProposal.removeCoSpeaker('Bruce Wayne').click();
    editProposal.isPageVisible();
    cy.assertToast('Co-speaker removed from proposal.');
    cy.assertNoText('Bruce Wayne');
  });

  it('display errors on mandatory fields', () => {
    editProposal.visit('devfest-nantes', 'awesome-proposal');
    editProposal.fillProposalForm({
      title: ' ',
      abstract: ' ',
    });
    editProposal.saveAbstract().click();
    editProposal.error('Title').should('contain.text', 'String must contain at least 1 character(s)');
    editProposal.error('Abstract').should('contain.text', 'String must contain at least 1 character(s)');
  });

  it('cannot edit a proposal not found', () => {
    cy.visit('/devfest-nantes/proposals/not-found/edit', { failOnStatusCode: false });
    cy.assertText('Proposal not found');
  });
});
