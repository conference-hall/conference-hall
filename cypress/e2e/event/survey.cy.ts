import EventSurveyPage from '../../page-objects/event/survey.page.ts';
import LoginPage from '../../page-objects/login.page.ts';

describe('Submit a talk to event', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/survey');
  });

  const survey = new EventSurveyPage();
  const login = new LoginPage();

  it('redirects to signin, when user is not connected', () => {
    cy.visit('devfest-nantes/survey');
    login.isPageVisible();
  });

  it('can fill the event survey when user is connected', () => {
    cy.login();
    survey.visit('devfest-nantes');

    cy.assertRadioChecked('Yes');
    cy.assertChecked('Train');
    cy.assertChecked('Taxi');
    cy.assertInputText('Do you have specific information to share?', 'Hello');

    survey.accommodation('No').click();
    survey.transport('Plane').click();
    survey.message().clear().type('World');

    survey.submit().click();
    cy.assertToast('Survey saved.');

    cy.assertRadioChecked('No');
    cy.assertChecked('Plane');
    cy.assertInputText('Do you have specific information to share?', 'World');
  });
});
