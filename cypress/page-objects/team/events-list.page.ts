import BasePage from '../../page-objects/base.page.ts';

type EventNewType = {
  name?: string;
  slug?: string;
};

class TeamEventsPage extends BasePage {
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
    cy.findByRole('heading', { name: 'Select your new event type' }).should('exist');
  }

  selectConference() {
    cy.findByRole('link', { name: /Conference/ }).click();
  }

  selectMeetup() {
    cy.findByRole('link', { name: /Meetup/ }).click();
  }

  createEvent() {
    cy.findByRole('button', { name: 'Create new event' }).click();
  }

  fillNewEventForm(data: EventNewType) {
    if (data.name) cy.typeOn('Name', data.name);
    if (data.slug) cy.typeOn('Event URL', data.slug);
    cy.findByRole('radio', { name: 'Public' }).click();
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-description`);
      });
  }
}

export default TeamEventsPage;
