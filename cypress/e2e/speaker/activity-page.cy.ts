import SearchEventPage from 'page-objects/event-search.page';
import SpeakerActivityPage from 'page-objects/speaker-activity.page';
import SpeakerSettingsPage from 'page-objects/speaker-settings.page';

describe('Speaker activity page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/activity-page');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const activity = new SpeakerActivityPage();
  const settings = new SpeakerSettingsPage();
  const search = new SearchEventPage();

  it('displays the speaker activity page', () => {
    activity.visit();

    cy.assertText('Clark Kent');
    cy.assertText('superman@example.com');
    cy.assertText("Clark Kent's profile");
    cy.assertText('Clark kent biography');
    cy.assertText('Clark kent is superman');
    cy.assertText('Metropolis');
    cy.assertText('Daily planet');
    cy.assertText('ckent-github');
    cy.assertText('ckent-twitter');
  });

  it('can edit the profile', () => {
    activity.visit();
    activity.editProfile().click();
    settings.isPageVisible();
  });

  it('can submit a talk', () => {
    activity.visit();
    activity.submitTalk().click();
    search.isPageVisible();
  });
});
