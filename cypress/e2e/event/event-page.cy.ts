import EventPage from '../../page-objects/event.page';

describe('View event page', () => {
  beforeEach(() => cy.task('seedDB', 'event/event-page'));
  afterEach(() => cy.task('disconnectDB'));

  const event = new EventPage();

  it('displays incoming events by default', () => {
    event.visit('devfest-nantes');

    event.name('Devfest Nantes').should('exist');
    cy.assertText('Nantes, France');
    cy.assertText('1 day conference - October 5th, 2020');
    cy.assertText('Call for paper is closed');
    cy.assertText('Since Monday, October 5th, 2020');
    cy.assertText('The event !');
  });
});
