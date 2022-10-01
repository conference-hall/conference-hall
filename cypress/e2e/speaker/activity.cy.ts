import SearchEventPage from 'page-objects/search.page';
import SpeakerActivityPage from 'page-objects/speaker/activity.page';
import SpeakerProfilePage from 'page-objects/speaker/profile.page';

describe('Speaker activity page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/activity');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const activity = new SpeakerActivityPage();
  const profile = new SpeakerProfilePage();
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
    profile.isPageVisible();
  });

  it('can submit a talk', () => {
    activity.visit();
    activity.submitTalk().click();
    search.isPageVisible();
  });
});
