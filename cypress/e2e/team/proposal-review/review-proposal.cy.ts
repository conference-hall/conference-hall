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
      cy.assertText('Format 1');
      cy.assertText('Category 1');
      cy.assertText('Marie Jane');
      cy.assertText('Robin');

      review.openTalkReferences();
      cy.assertText('My talk references');

      review.openOtherProposals();
      cy.assertText('Talk 2');

      cy.findByLabelText('Score: 3').should('exist');

      review.review('Love it, 5 stars');

      cy.findByLabelText('Score: 4').should('exist');

      review.activityFeed().should('have.length', 3);
      review.activityFeed().eq(0).should('contain.text', 'Bruce Wayne reviewed the proposal with 3 stars.');
      review.activityFeed().eq(1).should('contain.text', 'Bruce Wayne commented');
      review.activityFeed().eq(1).should('contain.text', 'Hello world');
      review.activityFeed().eq(2).should('contain.text', 'Clark Kent reviewed the proposal with 5 stars.');

      review.activityFeed().eq(1).findByRole('button', { name: 'Select a reaction' }).click();
      cy.findByRole('button', { name: 'Thumbs up' }).click();
      review.activityFeed().eq(1).findByRole('button', { name: 'Thumbs up' }).should('exist');

      review.addComment('This is a new comment');
      review.activityFeed().should('have.length', 4);
      review.activityFeed().eq(3).should('contain.text', 'Clark Kent commented');
      review.activityFeed().eq(3).should('contain.text', 'This is a new comment');
      review.activityFeed().eq(3).findByRole('button', { name: 'delete' }).click();
      review.activityFeed().should('have.length', 3);
    });

    it('deliberate the proposal', () => {
      review.visit('team-1', 'conference-1', 'proposal-1');

      review.deliberationStatus().should('contain.text', 'Not deliberated');
      review.publicationHeading().should('not.exist');

      review.deliberate(/Accepted/);
      review.publicationHeading().should('exist');
      review.deliberationStatus().should('contain.text', 'Accepted');

      review.publishResult();
      review.confirmationPanel().should('contain.text', 'Waiting for speakers confirmation');

      review.deliberate(/Rejected/);
      review.publicationHeading().should('exist');
      review.deliberationStatus().should('contain.text', 'Rejected');

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
      review.goBackToList();
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
