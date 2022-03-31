describe('Search conferences and meetups.', () => {
  beforeEach(() => {
    cy.task('db:reset').task('db:seed', 'search-events');
  });

  describe('From home page', () => {
    it('redirect to search page and Search conferences and meetups.', () => {
      cy.visit('/');
      cy.typeOn('Search conferences and meetups.', 'Devfest{enter}');
      cy.assertUrl('/search?terms=Devfest');
      cy.assertText('Devfest Nantes');
    });
  });

  describe('From search page', () => {
    it('displays incoming events by default', () => {
      cy.visit('/search');
      cy.assertText('Devfest Nantes');
      cy.assertText('GDG Nantes');
    });
  
    it('search conference events', () => {
      cy.visit('/search');
      cy.typeOn('Search conferences and meetups.', 'Devfest{enter}');
      cy.assertText('Devfest Nantes');
      cy.assertText('Nantes, France');
      cy.assertText('Call for paper is open');
    });

    it('search conference events', () => {
      cy.visit('/search');
      cy.typeOn('Search conferences and meetups.', 'devfest{enter}');
      cy.assertText('Devfest Nantes');
      cy.assertText('Nantes, France');
      cy.assertText('Call for paper is open');
    });

    it('search meetup events', () => {
      cy.visit('/search');
      cy.typeOn('Search conferences and meetups.', 'gdg{enter}');
      cy.assertText('GDG Nantes');
      cy.assertText('Nantes, France');
      cy.assertText('Call for paper is open');
    });

    it('opens event page on click', () => {
      cy.visit('/search');
      cy.clickOn(/Devfest Nantes/)
      cy.assertUrl('/devfest-nantes');
    });

    it('displays no result page if no events found', () => {
      cy.visit('/search');
      cy.typeOn('Search conferences and meetups.', 'nothing{enter}');
      cy.assertText('No events found.');
    });
  });
});
