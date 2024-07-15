class EventNavBarPage {
  visit(teamSlug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Event overview' }).should('exist');
  }

  overviewTab() {
    return cy.findByRole('link', { name: 'Overview' });
  }

  proposalsTab() {
    return cy.findByRole('link', { name: 'Proposals' });
  }

  publicationTab() {
    return cy.findByRole('link', { name: 'Publication' });
  }

  scheduleTab() {
    return cy.findByRole('link', { name: 'Schedule' });
  }

  settingsTab() {
    return cy.findByRole('link', { name: 'Settings' });
  }
}

export default EventNavBarPage;
