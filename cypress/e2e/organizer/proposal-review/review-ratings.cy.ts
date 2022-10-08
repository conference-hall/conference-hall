import ProposalReviewPage from 'page-objects/organizer/event-proposal-review.page';

describe('Organizer ratings in proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();

  beforeEach(() => cy.login('Clark Kent'));

  it('displays organizer ratings', () => {
    review.visit('orga-1', 'conference-1', 'proposal-1');

    cy.assertText('Rating total 3 out of 5');
    cy.assertText('0 loves ratings');
    cy.assertText('0 negatives ratings');

    review.toggleOrganizerRatings();
    review.organizerRatingsSection().within(() => {
      cy.assertText('Bruce Wayne');
      cy.assertText('3');
    });
  });

  it('rates the proposal', () => {
    review.visit('orga-1', 'conference-1', 'proposal-1');

    review.bottomActionSection().within(() => {
      review.rate('Love it, 5 stars');
    });

    cy.assertText('Rating total 4 out of 5');
    cy.assertText('1 loves ratings');
    cy.assertText('0 negatives ratings');

    review.toggleOrganizerRatings();
    review.organizerRatingsSection().within(() => {
      cy.assertText('Clark Kent');
      cy.assertText('5');
    });

    review.bottomActionSection().within(() => {
      review.rate('Nope, 0 star');
    });
    review.organizerRatingsSection().within(() => {
      cy.assertText('Clark Kent');
      cy.assertText('0');
    });

    cy.assertText('Rating total 1.5 out of 5');
    cy.assertText('0 loves ratings');
    cy.assertText('1 negatives ratings');

    review.closePage();
    cy.assertText('1.5');
  });
});
