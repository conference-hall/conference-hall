import ProposalReviewPage from '../../../page-objects/team/event-proposal-review.page.ts';
import OrganizationEventsProposalsPage from '../../../page-objects/team/event-proposals-list.page.ts';

describe('Proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();
  const proposals = new OrganizationEventsProposalsPage();

  describe('as team owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays proposal data and review the proposal', () => {
      review.visit('team-1', 'conference-1', 'proposal-1');

      review.title('Talk 1').should('exist');

      cy.assertText('Advanced');
      cy.assertText('French');
      cy.assertText('Talk description');
      cy.assertText('Talk references');
      cy.assertText('Format 1');
      cy.assertText('Category 1');
      cy.assertText('Marie Jane');
      cy.assertText('Robin');

      cy.findByLabelText('Score: 3').should('exist');

      review.review('Love it, 5 stars');
      review.addReviewComment('Best talk');

      cy.findByLabelText('Score: 4').should('exist');

      review.activityFeed().should('have.length', 4);
      review.activityFeed().eq(0).should('contain.text', 'Bruce Wayne reviewed the proposal with 3 stars.');
      review.activityFeed().eq(1).should('contain.text', 'Bruce Wayne commented');
      review.activityFeed().eq(1).should('contain.text', 'Hello world');
      review.activityFeed().eq(2).should('contain.text', 'Clark Kent reviewed the proposal with 5 stars.');
      review.activityFeed().eq(3).should('contain.text', 'Clark Kent commented');
      review.activityFeed().eq(3).should('contain.text', 'Best talk');

      review.addComment('This is a new comment');
      review.activityFeed().should('have.length', 5);
      review.activityFeed().eq(4).should('contain.text', 'Clark Kent commented');
      review.activityFeed().eq(4).should('contain.text', 'This is a new comment');
      review.activityFeed().eq(4).findByRole('button', { name: 'delete' }).click();
      review.activityFeed().should('have.length', 4);
    });

    it('deliberate the proposal', () => {
      review.visit('team-1', 'conference-1', 'proposal-1');

      review.deliberationStatus().should('contain.text', 'Pending');
      review.publicationHeading().should('not.exist');

      review.deliberate(/Accepted/);
      review.deliberationStatus().should('contain.text', 'Accepted');
      review.publicationHeading().should('exist');

      review.publishResult();
      review.confirmationPanel().should('contain.text', 'Waiting for speakers confirmation');

      review.deliberate(/Rejected/);
      review.deliberationStatus().should('contain.text', 'Accepted');
      review.publicationHeading().should('exist');

      review.publishResult();
      review.publicationPanel().should('contain.text', 'Result published to speakers');
    });

    it('navigates between proposals', () => {
      review.visit('team-1', 'conference-1', 'proposal-1');
      review.title('Talk 1').should('exist');
      cy.assertText('1/2');
      review.nextProposal();
      review.title('Talk 2').should('exist');
      cy.assertText('2/2');
      review.previousProposal();
      review.title('Talk 1').should('exist');
      cy.assertText('1/2');
    });

    it('exits the proposal review page', () => {
      review.visit('team-1', 'conference-1', 'proposal-1');
      review.title('Talk 1').should('exist');
      review.close();
      proposals.isPageVisible();
    });

    it('hides reviews, speakers following event settings', () => {
      review.visit('team-1', 'conference-2', 'proposal-2');
      review.title('Talk 3').should('exist');

      cy.findByRole('heading', { name: 'Your review' }).should('not.exist');
      cy.findByRole('link', { name: /Marie Jane/ }).should('not.exist');
      cy.findByRole('link', { name: /Robin/ }).should('not.exist');
    });
  });

  describe('as team reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('does not show deliberation, confirmation or publication panels', () => {
      review.visit('team-1', 'conference-1', 'proposal-1');

      cy.findByRole('heading', { name: 'Deliberation' }).should('not.exist');
      cy.findByRole('heading', { name: 'Confirmation' }).should('not.exist');
      cy.findByRole('heading', { name: 'Publication' }).should('not.exist');
    });
  });
});
