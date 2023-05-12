import BasePage from 'page-objects/base.page';

class ApiSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/api`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Web API' }).should('exist');
  }

  generateAPIKey() {
    return cy.findByRole('button', { name: 'Generate API key' });
  }

  revokeAPIKey() {
    return cy.findByRole('button', { name: 'Revoke API key' });
  }

  apiKey() {
    return cy.findByLabelText('API key');
  }
}

export default ApiSettings;
