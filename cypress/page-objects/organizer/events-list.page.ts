type EventNewType = {
  name?: string;
  slug?: string;
};

class OrganizationEventsPage {
  visit(slug: string) {
    cy.visit(`/organizer/${slug}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Events' }).should('exist');
  }

  eventsTab() {
    return cy.findByRole('link', { name: 'Organization events' });
  }

  membersTab() {
    return cy.findByRole('link', { name: 'Members' });
  }

  settingsTab() {
    return cy.findByRole('link', { name: 'Settings' });
  }

  list() {
    return cy.findByRole('list', { name: 'Events list' }).children();
  }

  event(name: string) {
    return this.list().contains(name);
  }

  newEvent() {
    cy.findByRole('button', { name: 'New event' }).click();
    cy.findByRole('heading', { name: 'Create a new event' }).should('exist');
  }

  selectConference() {
    cy.findByRole('radio', { name: 'Conference' }).click();
    cy.findByRole('button', { name: 'Continue' }).click();
  }

  selectMeetup() {
    cy.findByRole('radio', { name: 'Meetup' }).click();
    cy.findByRole('button', { name: 'Continue' }).click();
  }

  createEvent() {
    cy.findByRole('button', { name: 'Create event' }).click();
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

export default OrganizationEventsPage;
