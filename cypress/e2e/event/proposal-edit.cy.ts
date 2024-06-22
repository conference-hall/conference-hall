import EventProposalPage from '../../page-objects/event/proposal.page.ts';

describe('Speaker proposal edition page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/proposal-edit');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const proposal = new EventProposalPage();

  it('can edit a proposal', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    const edit = proposal.editProposal();

    cy.assertInputText('Title', 'Awesome talk');
    cy.assertInputText('Abstract', 'Awesome abstract');
    cy.assertRadioChecked('Advanced');
    cy.assertInputText('References', 'Awesome references');

    edit.selectFormatTrack('Quickie');
    edit.selectCategoryTrack('Web');
    edit.fillForm({
      title: 'New title',
      abstract: 'New abstract',
      level: 'Beginner',
      language: 'English',
      references: 'New references',
    });
    edit.save();

    cy.assertText('You have to select at least one proposal format.');
    cy.assertText('You have to select at least one proposal category.');

    edit.selectFormatTrack('Quickie 2');
    edit.selectCategoryTrack('Web 2');
    edit.save();
    cy.assertToast('Proposal saved.');
    edit.close();

    proposal.isPageVisible();
    cy.assertText('New title');
    cy.assertText('New abstract');
    cy.assertText('Quickie 2');
    cy.assertText('Web 2');
    cy.assertText('Beginner');
    cy.assertText('English');

    proposal.openReferences();
    cy.assertText('New references');
  });

  it('can invite a co-speaker', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    const cospeakers = proposal.cospeakers();
    cospeakers.inviteSpeaker();
    cy.findByLabelText('Copy invitation link').should('exist');
    cospeakers.closeInviteSpeakerModal();
  });

  it('can remove a co-speaker', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    const cospeakers = proposal.cospeakers();
    cospeakers.openSpeakerModal('Bruce Wayne');
    cospeakers.removeCoSpeaker('Bruce Wayne');
    cy.assertToast('Co-speaker removed from proposal.');
    cospeakers.speaker('Bruce Wayne').should('not.exist');
  });

  it('display errors on mandatory fields', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    const editProposal = proposal.editProposal();
    editProposal.fillForm({ title: ' ', abstract: ' ' });
    editProposal.save();
    editProposal.error('Title').should('contain.text', 'String must contain at least 1 character(s)');
    editProposal.error('Abstract').should('contain.text', 'String must contain at least 1 character(s)');
  });
});
