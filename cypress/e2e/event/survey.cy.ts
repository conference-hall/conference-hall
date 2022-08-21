import EventSurveyPage from '../../page-objects/event-survey.page';

describe('Submit a talk to event', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/survey');
  });

  afterEach(() => cy.task('disconnectDB'));

  const survey = new EventSurveyPage();

  it('redirects to signin, when user is not connected', () => {
    cy.visit('devfest-nantes/survey');
    cy.assertText('Log in to Conference Hall');
  });

  it('can fill the event survey when user is connected', () => {
    cy.login();
    survey.visit('devfest-nantes');

    cy.assertChecked('Male');
    cy.assertChecked('XL');
    cy.assertChecked('Train');
    cy.assertChecked('Taxi');
    cy.assertChecked('Vegan');
    cy.assertInputText('Do you have specific information to share?', 'Hello');

    survey.gender('Female').click();
    survey.tshirt('XXL').click();
    survey.accommodation('No').click();
    survey.transport('Plane').click();
    survey.meal('Halal').click();
    survey.message().clear().type('World');

    survey.form().submit();

    cy.assertText('Survey saved, thank you!');
    cy.assertChecked('Female');
    cy.assertChecked('XXL');
    cy.assertChecked('No');
    cy.assertChecked('Plane');
    cy.assertChecked('Halal');
    cy.assertInputText('Do you have specific information to share?', 'World');
  });
});
