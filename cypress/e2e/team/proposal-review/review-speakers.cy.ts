import ProposalReviewPage from '../../../page-objects/team/event-proposal-review.page.ts';

describe('Speakers in proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/proposal-review/proposal-review');
    cy.login('Clark Kent');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();

  it('displays speakers info', () => {
    review.visit('team-1', 'conference-1', 'proposal-1');

    const cospeakers = review.cospeakers();

    cospeakers.speakersList().should('have.length', 2);

    cospeakers.withinSpeakerProfile(/Marie Jane/, () => {
      cy.assertText('Marie Jane');
      cy.assertText('MJ Corp');
      cy.assertText('marie@example.com');
      cy.assertText('Biography');
      cy.assertText('MJ Bio');
      cy.assertText('MJ References');
      cy.assertText('Location');
      cy.assertText('Nantes');
      cy.assertText('Gender');
      cy.assertText('male');
      cy.assertText('Tshirt size');
      cy.assertText('XL');
      cy.assertText('Diet');
      cy.assertText('vegan');
      cy.assertText('Need accomodation fees');
      cy.assertText('yes');
      cy.assertText('Need Transport fees');
      cy.assertText('taxi, train');
      cy.assertText('More information');
      cy.assertText('Hello');
      cy.findByRole('button', { name: 'Close' }).click();
    });

    cospeakers.withinSpeakerProfile(/Robin/, () => {
      cy.assertText('Robin');
      cy.assertText('robin@example.com');
      cy.findByRole('button', { name: 'Close' }).click();
    });
  });
});
