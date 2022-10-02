import LoginPage from 'page-objects/login.page';
import SearchEventPage from 'page-objects/search.page';
import SpeakerTalksPage from 'page-objects/speaker/talks-list.page';
import UserMenuPage from 'page-objects/user-menu.page';

describe('Authentication', () => {
  afterEach(() => cy.task('disconnectDB'));

  const login = new LoginPage();
  const search = new SearchEventPage();
  const speakers = new SpeakerTalksPage();
  const userMenu = new UserMenuPage();

  it('login', () => {
    login.visit();
    login.signinWithGoogle('Clark Kent');

    search.isPageVisible();
    userMenu.open();
    userMenu.isMenuOpen('superman@example.com');
  });

  it('login and redirected', () => {
    login.visit('/speaker/talks');
    login.signinWithGoogle('Clark Kent');

    speakers.isPageVisible();
    userMenu.open();
    userMenu.isMenuOpen('superman@example.com');
  });
});
