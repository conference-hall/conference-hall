import ProposalReviewPage from 'page-objects/organizer/event-proposal-review.page';

describe('Organizer discussions in proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();

  beforeEach(() => cy.login('Clark Kent'));

  it('displays, adds and deletes organizer messages', () => {
    review.visit('orga-1', 'conference-1', 'proposal-1');

    review.discussionsTab();
    review.discussionMessages().should('have.length', 1);
    review
      .discussionMessages()
      .first()
      .within(() => {
        cy.assertText('Bruce Wayne');
        cy.assertText('Hello world');
      });

    review.writeMessage('New message');
    review.discussionMessages().should('have.length', 2);

    review
      .discussionMessages()
      .first()
      .within(() => {
        cy.assertText('Clark Kent');
        cy.assertText('New message');
        review.deleteMessage();
      });

    review.discussionMessages().should('have.length', 1);
  });
});
