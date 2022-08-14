import SearchEventPage from './search-event.page';

class AboutPage {
  visit() {
    return cy.visit('/about');
  }

  goToSearch() {
    cy.clickOn('See all conferences and meetups');
    return new SearchEventPage();
  }
}

export default AboutPage;
