import AboutPage from '../page-objects/about.page';
import SearchEventPage from '../page-objects/search-event.page';

describe('Search conferences and meetups.', () => {
  beforeEach(() => cy.task('seedDB', 'search-events'));
  afterEach(() => cy.task('resetDB'));

  describe('From about page', () => {
    const about = new AboutPage();

    it('redirect to search page and Search conferences and meetups.', () => {
      about.visit();
      const search = about.goToSearch();

      search.search('Devfest');
      search.results().should('have.length', 1);
      search.result('Devfest Nantes').should('exist');
    });
  });

  describe('From search page', () => {
    const search = new SearchEventPage();

    it('displays incoming events by default', () => {
      search.visit();
      search.results().should('have.length', 2);
      search.result('Devfest Nantes').should('exist');
      search.result('GDG Nantes').should('exist');
    });

    it('search conference events', () => {
      search.visit();
      search.search('devfest');

      cy.url().should('include', '/?terms=devfest');
      search.results().should('have.length', 1);
      search.result('Devfest Nantes').should('contain', 'Nantes, France').and('contain', 'Call for paper is open');
    });

    it('search meetup events', () => {
      search.visit();
      search.search('gdg');

      cy.url().should('include', '/?terms=gdg');
      search.results().should('have.length', 1);
      search.result('GDG Nantes').should('contain', 'Nantes, France').and('contain', 'Call for paper is open');
    });

    it('opens event page on click', () => {
      search.visit();
      search.result('Devfest Nantes').click();
      cy.assertUrl('/devfest-nantes');
    });

    it('displays no result page if no events found', () => {
      search.visit();
      search.search('nothing');
      cy.assertText('No events found.');
    });
  });
});
