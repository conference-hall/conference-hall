import SpeakerActivityPage from 'page-objects/speaker/activity.page';
import SpeakerProfilePage from 'page-objects/speaker/profile.page';
import SpeakerNewTalkPage from 'page-objects/speaker/talk-new.page';
import EventProposalPage from 'page-objects/event/proposal.page';

describe('Speaker activity page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/activity');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const activity = new SpeakerActivityPage();
  const profile = new SpeakerProfilePage();
  const newTalk = new SpeakerNewTalkPage();
  const eventProposal = new EventProposalPage();

  it('displays the speaker activity page', () => {
    activity.visit();

    cy.assertText('Clark Kent');
    cy.assertText('superman@example.com');
    cy.assertText('Clark Kent');
    cy.assertText('Clark kent biography');
    cy.assertText('Metropolis');
    cy.assertText('Daily planet');
    cy.assertText('ckent-github');
    cy.assertText('ckent-twitter');

    activity.activities().should('have.length', 4);
    activity.activity('My talk 2').click();

    eventProposal.isPageVisible();
  });

  it('can edit the profile', () => {
    activity.visit();
    activity.editProfile().click();
    profile.isPageVisible();
  });

  it('can create a new talk', () => {
    activity.visit();
    activity.newTalk().click();
    newTalk.isPageVisible();
  });
});
