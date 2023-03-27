import EventPage from 'page-objects/event/event.page';
import EventSubmissionPage from 'page-objects/event/submission.page';
import SearchEventPage from 'page-objects/search.page';

describe('View event page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/event-page');
    cy.clock(new Date(2021, 3, 14));
  });
  afterEach(() => cy.task('disconnectDB'));

  const event = new EventPage();
  const submission = new EventSubmissionPage();
  const search = new SearchEventPage();

  it('displays event info when CFP open', () => {
    event.visit('devfest-nantes');
    cy.assertText('Devfest Nantes');
    cy.assertText('Nantes, France');
    cy.assertText('1 day conference - October 5th, 2020');
    cy.assertText('Open for over 69 years');
    cy.assertText('Until Thursday, October 5th, 2090 at 2:48 PM GMT+0');
    cy.assertText('The event !');
    cy.assertLink('Website', 'https://devfest.gdgnantes.com');
    cy.assertLink('Contacts', 'mailto:contact@example.com');
    cy.assertLink('Code of conduct', 'https://devfest.gdgnantes.com/cod.html');
    cy.assertText('Format 1');
    cy.assertText('Format description 1');
    cy.assertText('Category 1');
    cy.assertText('Category description 1');
  });

  it('displays event info when CFP in the future', () => {
    event.visit('event-cfp-future');
    cy.assertText('Open in over 79 years');
    cy.assertText('Will open Tuesday, October 5th, 2100 at 2:48 PM GMT+0');
  });

  it('displays event info when CFP in the past', () => {
    event.visit('event-cfp-past');
    cy.assertText('Closed since over 19 years');
    cy.assertText('Since Friday, October 5th, 2001');
  });

  it('displays a not found page if event does not exist', () => {
    event.visit('event-dont-exist');
    cy.assertText('Event not found');
    event.searchForEvent().click();
    search.isPageVisible();
  });

  it('can submit a proposal', () => {
    cy.login();
    cy.visit('devfest-nantes');
    event.submitButton().click();
    submission.isPageVisible();
  });
});
