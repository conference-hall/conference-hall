import BasePage from '../../page-objects/base.page.ts';
import EventNewPage from './event-new.page.ts';

class TeamHomePage extends BasePage {
  visit(slug: string) {
    cy.visitAndCheck(`/team/${slug}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Team events' }).should('exist');
  }

  eventsTab() {
    return cy.findByRole('link', { name: 'Events' });
  }

  settingsTab() {
    return cy.findByRole('link', { name: 'Settings' });
  }

  list() {
    return cy.findByRole('list', { name: 'Events list' }).children();
  }

  archivedEvents() {
    return cy.findByRole('link', { name: 'Archived' }).click();
  }

  event(name: string) {
    return this.list().contains(name);
  }

  newEvent() {
    cy.findByRole('link', { name: 'New event' }).click();
    return new EventNewPage();
  }
}

export default TeamHomePage;
