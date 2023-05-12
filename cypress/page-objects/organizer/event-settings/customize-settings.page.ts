import BasePage from 'page-objects/base.page';

class CustomizeSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/customize`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Customize event logo' }).should('exist');
  }

  changeLogo() {
    return cy.findByLabelText('Change logo');
  }

  getLogoSrc() {
    return cy.findByAltText('Conference 1 logo').should('have.attr', 'src');
  }
}

export default CustomizeSettings;
