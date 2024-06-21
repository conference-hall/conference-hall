import ProposalReviewPage from '../../../page-objects/team/event-proposal-review.page.ts';

describe('Proposal edit page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();

  describe('as team owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('can edit a proposal', () => {
      review.visit('team-1', 'conference-1', 'proposal-1');

      review.editProposal();

      cy.assertInputText('Title', 'Talk 1');
      cy.assertInputText('Abstract', 'Talk description');
      cy.assertInputText('References', 'My talk references');
      cy.assertRadioChecked('Advanced');
      cy.assertChecked(/Format 1/);
      cy.assertChecked(/Category 1/);

      review.fillProposalForm({
        title: 'Talk 1 updated',
        abstract: 'Talk description updated',
        level: 'Beginner',
        references: 'Talk references updated',
        language: 'English',
        format: 'Format 2',
        category: 'Category 2',
      });

      cy.assertToast('Proposal saved.');

      cy.assertText('Talk 1 updated');
      cy.assertText('Talk description updated');
      cy.assertText('Talk references updated');
      cy.assertText('Beginner');
      cy.assertText('French');
      cy.assertText('English');
      cy.assertText('Format 1');
      cy.assertText('Format 2');
      cy.assertText('Category 1');
      cy.assertText('Category 2');
    });

    it('quits edit mode', () => {
      review.visit('team-1', 'conference-1', 'proposal-1');
      review.editProposal();

      cy.assertInputText('Title', 'Talk 1');
      review.cancelUpdateProposal();
      cy.findByRole('button', { name: 'Update proposal' }).should('not.exist');
    });
  });
});
