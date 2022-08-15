import EventSearchPage from '../../page-objects/event-search.page';
import EventPage from '../../page-objects/event.page';

describe('Search conferences and meetups.', () => {
  beforeEach(() => cy.task('seedDB', 'search/events'));
  afterEach(() => cy.task('disconnectDB'));

  const search = new EventSearchPage();
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

    event.isPageVisible('devfest-nantes');
  });

  it('displays no result page if no events found', () => {
    search.visit();
    search.search('nothing');
    cy.assertText('No events found.');
  });
});
