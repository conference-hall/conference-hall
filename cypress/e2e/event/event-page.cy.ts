import EventPage from '../../page-objects/event/event.page.ts';
import EventSubmissionPage from '../../page-objects/event/submission.page.ts';

describe('View event page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/event-page');
    cy.clock(new Date(2021, 3, 14));
  });

  const event = new EventPage();
  const submission = new EventSubmissionPage();

  it('displays event info when CFP open', () => {
    event.visit('devfest-nantes');
    cy.assertText('Devfest Nantes');
    cy.assertText('Nantes, France');
    cy.assertText('October 5th, 2020 (CEST)');
    cy.assertText('Call for paper open for over 69 years');
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
    cy.assertText('Call for paper open in over 79 years');
  });

  it('displays event info when CFP in the past', () => {
    event.visit('event-cfp-past');
    cy.assertText('Call for paper closed since over 19 years');
  });

  it('displays a not found page if event does not exist', () => {
    event.visit('event-dont-exist');
    event.assertPageNotFound('Event not found');
  });

  it('redirects to the new URL when visiting the legacy URL', () => {
    event.visitLegacyUrl('legacy-event-id');
    cy.assertText('Devfest Nantes');
    event.isPageVisible('devfest-nantes');
  });

  it('can submit a proposal', () => {
    cy.login();
    event.visit('devfest-nantes');
    event.submitButton();
    submission.isPageVisible();
  });
});
