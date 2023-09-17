import BasePage from '../../../page-objects/base.page.ts';

class SlackSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${slug}/${eventSlug}/settings/integrations`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Slack integration' }).should('exist');
  }

  saveSlackWebhook(url: string) {
    cy.typeOn('Slack web hook URL', url);
    cy.findByRole('button', { name: 'Save Slack integration' }).click();
  }
}

export default SlackSettings;
