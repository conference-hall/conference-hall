import ProposalReviewPage from 'page-objects/organizer/event-proposal-review.page';

describe('Organizer speakers in proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();

  beforeEach(() => cy.login('Clark Kent'));

  it('displays speakers info', () => {
    review.visit('orga-1', 'conference-1', 'proposal-1');

    cy.assertText('Marie Jane');
    cy.assertText('marie@example.com');

    review.speakerDetailsSection('Marie Jane').within(() => {
      cy.assertText('MJ Bio');
      cy.assertText('MJ References');
      cy.assertText('Nantes');
      cy.assertText('MJ Corp');
      cy.assertText('https://github.com');
      cy.assertText('https://twitter.com');
    });

    cy.assertText('Robin');
    cy.assertText('robin@example.com');

    review.toggleSpeakerDetails('Robin');
    review.speakerDetailsSection('Robin').within(() => {
      cy.assertText('Robin Bio');
    });
  });
});
