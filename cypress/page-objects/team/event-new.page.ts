import BasePage from '../../page-objects/base.page.ts';

type EventNewType = {
  name?: string;
  slug?: string;
};

type EventDetailFormType = {
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
};

type CfpFormType = {
  cfpStart?: string;
  cfpEnd?: string;
};

class EventNewPage extends BasePage {
  isPageVisible() {
    cy.findByRole('heading', { name: 'Select your event type.' }).should('exist');
  }

  selectConference() {
    cy.findByRole('radio', { name: 'Conference' }).click();
  }

  selectMeetup() {
    cy.findByRole('radio', { name: 'Meetup' }).click();
  }

  continueToGeneralForm() {
    cy.findByRole('link', { name: 'Continue' }).click();
  }

  isConferenceFormVisible() {
    cy.findByRole('heading', { name: 'Create a new conference.' }).should('exist');
  }

  isMeetupFormVisible() {
    cy.findByRole('heading', { name: 'Create a new meetup.' }).should('exist');
  }

  fillNewEventForm(data: EventNewType) {
    if (data.name) cy.typeOn('Name', data.name);
    if (data.slug) cy.typeOn('Event URL', data.slug);
    cy.findByRole('radio', { name: 'Public' }).click();
  }

  isDetailsFormVisible(name: string) {
    cy.findByRole('heading', { name: `${name} information.` }).should('exist');
  }

  fillDetailsForm(data: EventDetailFormType) {
    if (data.startDate) cy.typeOn('Start date', data.startDate);
    if (data.endDate) cy.typeOn('End date', data.endDate);
    if (data.location) cy.typeOn('Venue address or city', data.location);
    if (data.description) cy.typeOn('Description', data.description);
  }

  continueToDetailsForm() {
    cy.findByRole('button', { name: 'Continue' }).click();
  }

  isCfpFormVisible(name: string) {
    cy.findByRole('heading', { name: `${name} call for paper.` }).should('exist');
  }

  fillConferenceOpenings(data: CfpFormType) {
    if (data.cfpStart) cy.typeOn('Opening date', data.cfpStart);
    if (data.cfpEnd) cy.typeOn('Closing date', data.cfpEnd);
  }

  continueToCfpForm() {
    cy.findByRole('button', { name: 'Continue' }).click();
  }

  finish() {
    cy.findByRole('button', { name: 'Finish' }).click();
  }
}

export default EventNewPage;
