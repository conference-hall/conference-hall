import ProposalReviewPage from 'page-objects/organizer/event-proposal-review.page';

describe('Organizer comments in proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();

  beforeEach(() => cy.login('Clark Kent'));

  it('displays organizer comments', () => {
    review.visit('orga-1', 'conference-1', 'proposal-1');
    review.organizerCommentsSection().within(() => {
      cy.assertText('Bruce Wayne');
      cy.assertText('Hello world');
    });
  });

  it('adds and deletes new comments', () => {
    review.visit('orga-1', 'conference-1', 'proposal-1');
    review.organizerCommentsSection().within(() => {
      review.writeComment('New comment');
      cy.assertText('Clark Kent');
      cy.assertText('New comment');

      review.deleteComment();
      cy.assertNoText('Clark Kent');
      cy.assertNoText('New comment');
    });
  });
});
