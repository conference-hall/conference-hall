type EventNewType = {
  name?: string;
  slug?: string;
};

class OrganizerEventNewPage {
  visit(slug: string) {
    cy.visit(`/organizer/${slug}/new`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Select an event type' }).should('exist');
  }

  isConferenceStepVisible() {
    cy.findByRole('heading', { name: 'Create a new conference' }).should('exist');
  }

  isMeetupStepVisible() {
    cy.findByRole('heading', { name: 'Create a new meetup' }).should('exist');
  }

  newConference() {
    cy.findByLabelText('Create a new conference').click();
  }

  newMeetup() {
    cy.findByLabelText('Create a new meetup').click();
  }

  fillForm(data: EventNewType) {
    if (data.name) cy.typeOn('Name', data.name);
    if (data.slug) cy.typeOn('Event URL', data.slug);
    cy.findByRole('radio', { name: 'Public' }).click();
  }

  newEvent() {
    cy.findByRole('button', { name: 'Create event' }).click();
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

export default OrganizerEventNewPage;
