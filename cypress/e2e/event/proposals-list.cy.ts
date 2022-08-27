import EventProposalPage from 'page-objects/event-proposal.page';
import EventProposalsPage from '../../page-objects/event-proposals.page';

describe('Event proposals list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/proposals-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const proposals = new EventProposalsPage();
  const proposal = new EventProposalPage();

  it('redirects to signin, when user is not connected', () => {
    cy.visit('devfest-nantes/proposals');
    cy.assertText('Log in to Conference Hall');
  });

  it('displays user proposals for an open event', () => {
    cy.login();
    proposals.visit('devfest-nantes');
    proposals.list().should('have.length', 2);
    proposals.proposal('My talk 1').should('contain.text', 'Submitted');
    proposals.proposal('My talk 2').should('contain.text', 'Draft proposal');
  });

  it('can access to talk details', () => {
    cy.login();
    proposals.visit('devfest-nantes');
    proposals.proposal('My talk 1').click();
    proposal.isPageVisible();
  });

  it('displays user proposals for a closed event', () => {
    cy.login();
    proposals.visit('conference-cfp-past');
    proposals.list().should('have.length', 1);
    proposals.proposal('My talk 1').should('contain.text', 'Submitted');
  });
});
