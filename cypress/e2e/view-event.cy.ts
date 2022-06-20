describe('View event page', () => {
  const event = {
    name: 'EventFactory',
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      address: 'Nantes, France',
      description: 'The event !',
      conferenceStart: '2020-10-05T00:00:00.000Z',
      conferenceEnd: '2020-10-05T00:00:00.000Z',
      cfpStart: '2020-10-05T00:00:00.000Z',
      cfpEnd: '2020-10-05T23:59:59.000Z',
    },
    traits: ['conference'],
  };

  beforeEach(() => {
    cy.task('resetDB');
    cy.task('factory', [event]);
  });

  afterEach(() => cy.task('disconnectDB'));

  it('displays incoming events by default', () => {
    cy.visit('/devfest-nantes');
    cy.assertText('Devfest Nantes');
    cy.assertText('Nantes, France');
    cy.assertText('1 day conference - October 5th, 2020');
    cy.assertText('Call for paper is closed');
    cy.assertText('Since Tuesday, October 6th, 2020');
    cy.assertText('The event !');
  });
});
