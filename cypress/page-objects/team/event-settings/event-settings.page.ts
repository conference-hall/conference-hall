import BasePage from 'page-objects/base.page';

class OrganizerEventSettingsPage extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/team/${slug}/${eventSlug}/settings`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Event settings' }).should('exist');
  }

  nav() {
    return cy.findByRole('navigation', { name: 'Event settings menu' });
  }

  openSetting(name: string) {
    this.nav().within(() => cy.findByRole('link', { name }).click());
  }
}

export default OrganizerEventSettingsPage;