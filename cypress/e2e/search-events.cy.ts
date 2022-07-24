describe('Search conferences and meetups.', () => {
  before(() => {
    cy.task('resetDB').task('seedDB', 'search-events');
  });

  afterEach(() => cy.task('disconnectDB'));

  describe('From about page', () => {
    it('redirect to search page and Search conferences and meetups.', () => {
      cy.visit('/about');
      cy.clickOn('See all conferences and meetups');
      cy.typeOn('Search conferences and meetups.', 'Devfest{enter}');
      cy.assertUrl('/?terms=Devfest');
      cy.assertText('Devfest Nantes');
    });
  });

  describe('From search page', () => {
    it('displays incoming events by default', () => {
      cy.visit('/');
      cy.assertText('Devfest Nantes');
      cy.assertText('GDG Nantes');
    });

    it('search conference events', () => {
      cy.visit('/');
      cy.typeOn('Search conferences and meetups.', 'Devfest{enter}');
      cy.assertText('Devfest Nantes');
      cy.assertText('Nantes, France');
      cy.assertText('Call for paper is open');
    });

    it('search conference events', () => {
      cy.visit('/');
      cy.typeOn('Search conferences and meetups.', 'devfest{enter}');
      cy.assertText('Devfest Nantes');
      cy.assertText('Nantes, France');
      cy.assertText('Call for paper is open');
    });

    it('search meetup events', () => {
      cy.visit('/');
      cy.typeOn('Search conferences and meetups.', 'gdg{enter}');
      cy.assertText('GDG Nantes');
      cy.assertText('Nantes, France');
      cy.assertText('Call for paper is open');
    });

    it('opens event page on click', () => {
      cy.visit('/');
      cy.clickOn(/Devfest Nantes/);
      cy.assertUrl('/devfest-nantes');
    });

    it('displays no result page if no events found', () => {
      cy.visit('/');
      cy.typeOn('Search conferences and meetups.', 'nothing{enter}');
      cy.assertText('No events found.');
    });
  });
});
