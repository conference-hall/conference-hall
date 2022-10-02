class SlackSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/integrations`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Slack integration' }).should('exist');
  }

  saveSlackWebhook(url: string) {
    cy.typeOn('Web hook URL', url);
    cy.clickOn('Save Web hook URL');
  }
}

export default SlackSettings;
