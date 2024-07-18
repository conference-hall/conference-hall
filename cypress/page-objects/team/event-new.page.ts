import BasePage from '../../page-objects/base.page.ts';

type EventNewType = {
  name?: string;
  slug?: string;
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

  continueToDetailsForm() {
    cy.findByRole('button', { name: 'Continue' }).click();
  }

  isDetailsFormVisible(name: string) {
    cy.findByRole('heading', { name: `${name} information.` }).should('exist');
  }

  continueToCfpForm() {
    cy.findByRole('button', { name: 'Continue' }).click();
  }

  isCfpFormVisible(name: string) {
    cy.findByRole('heading', { name: `${name} call for paper.` }).should('exist');
  }

  finish() {
    cy.findByRole('button', { name: 'Finish' }).click();
  }
}

export default EventNewPage;
