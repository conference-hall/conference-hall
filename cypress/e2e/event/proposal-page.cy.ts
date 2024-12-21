import EventProposalPage from '../../page-objects/event/proposal.page.ts';

describe('Event proposal page details', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/proposal-page');
    cy.login();
  });

  const proposal = new EventProposalPage();

  it('can edit a proposal', () => {
    proposal.visit('devfest-nantes', 'awesome-proposal');
    const edit = proposal.editProposal();
    edit.isVisible();
  });
});
