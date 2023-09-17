import EventProposalPage from '../../page-objects/event/proposal.page.ts';
import EventProposalsPage from '../../page-objects/event/proposals.page.ts';
import LoginPage from '../../page-objects/login.page.ts';

describe('Event proposals list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/proposals-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const proposals = new EventProposalsPage();
  const proposal = new EventProposalPage();
  const login = new LoginPage();

  it('redirects to signin, when user is not connected', () => {
    cy.visit('devfest-nantes/proposals');
    login.isPageVisible();
  });

  it('displays user proposals for an open event', () => {
    cy.login();
    proposals.visit('devfest-nantes');
    proposals.list().should('have.length', 6);
    proposals.proposal('My talk 1').should('contain.text', 'Submitted');
    proposals.proposal('My talk 2').should('contain.text', 'Draft proposal');
    proposals.proposal('My talk 3').should('contain.text', 'Accepted');
    proposals.proposal('My talk 4').should('contain.text', 'Declined by organizers');
    proposals.proposal('My talk 5').should('contain.text', 'Declined by you');
    proposals.proposal('My talk 6').should('contain.text', 'Participation confirmed');
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
    proposals.proposal('My talk 1').should('contain.text', 'Deliberation pending');
  });

  it('displays empty state when no proposals', () => {
    cy.login();
    proposals.visit('event-without-talks');
    cy.assertText('No proposals submitted!');
  });
});
