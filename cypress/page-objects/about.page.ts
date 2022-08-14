import EventSearchPage from './event-search.page';

class AboutPage {
  visit() {
    cy.visit('/about');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Welcome to Conference Hall.' }).should('exist');
  }

  goToSearch() {
    cy.clickOn('See all conferences and meetups');
    return new EventSearchPage();
  }
}

export default AboutPage;
