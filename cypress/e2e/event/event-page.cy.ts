import EventSubmissionPage from 'page-objects/event-submission.page';
import EventPage from '../../page-objects/event.page';

describe('View event page', () => {
  beforeEach(() => cy.task('seedDB', 'event/event-page'));
  afterEach(() => cy.task('disconnectDB'));

  const event = new EventPage();
  const submission = new EventSubmissionPage();

  it('displays event info when CFP open', () => {
    event.visit('devfest-nantes');
    cy.assertText('Devfest Nantes');
    cy.assertText('Nantes, France');
    cy.assertText('1 day conference - October 5th, 2020');
    cy.assertText('Call for paper is open');
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
    cy.assertText('Call for paper is not open yet');
    cy.assertText('Will open Tuesday, October 5th, 2100 at 2:48 PM GMT+0');
  });

  it('displays event info when CFP in the past', () => {
    event.visit('event-cfp-past');
    cy.assertText('Call for paper is closed');
    cy.assertText('Since Friday, October 5th, 2001');
  });

  it('can submit a proposal', () => {
    cy.login();
    event.visit('devfest-nantes');
    event.submitButton().click();
    submission.isPageVisible();
  });
});
