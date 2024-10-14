import BasePage from '../../base.page.ts';

class IntegrationsSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${slug}/${eventSlug}/settings/integrations`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Slack integration' }).should('exist');
  }

  saveSlackConfiguration(url: string) {
    cy.typeOn('Slack web hook URL', url);
    cy.findByRole('button', { name: 'Save Slack integration' }).click();
  }

  saveOpenPlannerConfiguration(eventId: string, apiKey: string) {
    cy.typeOn('OpenPlanner event id', eventId);
    cy.typeOn('OpenPlanner API key', apiKey);
    cy.findByRole('button', { name: 'Save OpenPlanner integration' }).click();
  }

  disableOpenPlanner() {
    cy.findByRole('button', { name: 'Disable OpenPlanner integration' }).click();
  }
}

export default IntegrationsSettings;
