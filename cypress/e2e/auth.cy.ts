import LoginPage from '../page-objects/login.page.ts';
import SearchEventPage from '../page-objects/search.page.ts';
import SpeakerTalksPage from '../page-objects/speaker/talks-list.page.ts';

describe('Authentication', () => {
  afterEach(() => cy.task('disconnectDB'));

  const login = new LoginPage();
  const search = new SearchEventPage();
  const speakers = new SpeakerTalksPage();

  it('login', () => {
    login.visit();
    login.signinWithGoogle('Clark Kent');

    search.isPageVisible();
    search.userMenu().open();
    search.userMenu().isOpen('superman@example.com');
  });

  it('login and redirected', () => {
    login.visit('/speaker/talks');
    login.signinWithGoogle('Clark Kent');

    speakers.isPageVisible();
    speakers.userMenu().open();
    speakers.userMenu().isOpen('superman@example.com');
  });
});
