import ProposalReviewPage from '../../../page-objects/team/event-proposal-review.page.ts';

describe('Speakers in proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();

  beforeEach(() => cy.login('Clark Kent'));

  it('displays speakers info', () => {
    review.visit('team-1', 'conference-1', 'proposal-1');

    review.speakersTab();

    review.speakersList().should('have.length', 2);

    review
      .speakersList()
      .first()
      .within(() => {
        cy.assertText('Marie Jane - marie@example.com');
        cy.assertText('MJ Corp - Nantes');
        cy.assertText('MJ Bio');
        cy.assertText('MJ References');
        cy.assertText('https://github.com');
        cy.assertText('https://twitter.com');
        cy.assertText('male');
        cy.assertText('Tshirt size: XL');
        cy.assertText('vegan');
        cy.assertText('Need accommodation fees');
        cy.assertText('Need transport fees: taxi, train');
        cy.assertText('Hello');
      });

    review
      .speakersList()
      .last()
      .within(() => {
        cy.assertText('Robin - robin@example.com');
      });
  });
});
