import EventPage from '../../page-objects/event/event.page.ts';
import SearchEventPage from '../../page-objects/search.page.ts';

describe('Search conferences and meetups.', () => {
  beforeEach(() => cy.task('seedDB', 'search/events'));

  const search = new SearchEventPage();
  const event = new EventPage();

  it('displays incoming events by default', () => {
    search.visit();
    search.results().should('have.length', 2);
    search.result('Devfest Nantes').should('exist');
    search.result('GDG Nantes').should('exist');
  });

  it('search conference events', () => {
    search.visit();
    search.search('devfest');

    cy.url().should('include', '/?query=devfest');
    search.results().should('have.length', 1);
    search.result('Devfest Nantes').and('contain', 'Call for paper open');
  });

  it('search meetup events', () => {
    search.visit();
    search.search('gdg');

    cy.url().should('include', '/?query=gdg');
    search.results().should('have.length', 1);
    search.result('GDG Nantes').and('contain', 'Call for paper open');
  });

  it('opens event page on click', () => {
    search.visit();
    search.result('Devfest Nantes').click();

    event.isPageVisible('devfest-nantes');
  });

  it('displays no result page if no events found', () => {
    search.visit();
    search.search('nothing');
    cy.assertText('No results found!');
  });
});
