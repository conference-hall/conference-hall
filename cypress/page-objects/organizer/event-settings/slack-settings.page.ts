class SlackSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/integrations`);
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
