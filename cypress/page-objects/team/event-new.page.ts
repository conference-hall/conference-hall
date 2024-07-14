import BasePage from '../../page-objects/base.page.ts';

type EventNewType = {
  name?: string;
  slug?: string;
};

class EventNewPage extends BasePage {
  isPageVisible() {
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
        return cy.get(`#${id}-describe`);
      });
  }
}

export default EventNewPage;
