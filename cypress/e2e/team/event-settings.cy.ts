import ApiSettings from 'page-objects/team/event-settings/api-settings.page';
import CfpSettings from 'page-objects/team/event-settings/cfp-settings.page';
import CustomizeSettings from 'page-objects/team/event-settings/customize-settings.page';
import OrganizerEventSettingsPage from 'page-objects/team/event-settings/event-settings.page';
import GeneralSettings from 'page-objects/team/event-settings/general-settings.page';
import NotificationsSettings from 'page-objects/team/event-settings/notifications-settings.page';
import ProposalReviewSettings from 'page-objects/team/event-settings/proposal-review-settings.page';
import SlackSettings from 'page-objects/team/event-settings/slack-settings.page';
import SurveySettings from 'page-objects/team/event-settings/survey-settings.page';
import TracksSettings from 'page-objects/team/event-settings/tracks-settings.page';

describe('Event settings', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/event-settings');
  });

  afterEach(() => cy.task('disconnectDB'));

  const settings = new OrganizerEventSettingsPage();
  const general = new GeneralSettings();
  const customize = new CustomizeSettings();
  const tracks = new TracksSettings();
  const cfp = new CfpSettings();
  const survey = new SurveySettings();
  const review = new ProposalReviewSettings();
  const notifications = new NotificationsSettings();
  const slack = new SlackSettings();
  const api = new ApiSettings();

  describe('as a team owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('navigates through settings nav bar', () => {
      settings.visit('team-1', 'conference-1');
      settings.openSetting('General');
      general.isPageVisible();

      settings.openSetting('Call for paper');
      cfp.isPageVisible();

      settings.openSetting('Tracks');
      tracks.isPageVisible();

      settings.openSetting('Customize');
      customize.isPageVisible();

      settings.openSetting('Speaker survey');
      survey.isPageVisible();

      settings.openSetting('Proposals review');
      review.isPageVisible();

      settings.openSetting('Email notifications');
      notifications.isPageVisible();

      settings.openSetting('Slack integration');
      slack.isPageVisible();

      settings.openSetting('Web API');
      api.isPageVisible();
    });

    describe('general settings', () => {
      it('can update general event info', () => {
        general.visit('team-1', 'conference-1');

        general.saveGeneralForm({ name: 'Conference 2', visibility: 'Private' });
        cy.assertToast('Event saved.');

        cy.assertUrl('/team/team-1/conference-2/settings');
        cy.reload();

        cy.assertInputText('Name', 'Conference 2');
        cy.assertInputText('Event URL', 'conference-2');
        cy.assertRadioChecked('Private');
      });

      it('can update event details', () => {
        general.visit('team-1', 'conference-1');

        general.saveDetailsForm({
          startDate: '2022-12-12',
          endDate: '2022-12-13',
          address: 'Nantes, France',
          description: 'Hello world!',
          websiteUrl: 'https://website.com',
          contactEmail: 'contact@email.com',
        });
        cy.assertToast('Event details saved.');

        cy.assertInputText('Start date', '2022-12-12');
        cy.assertInputText('End date', '2022-12-13');
        cy.assertInputText('Venue address or city', 'Nantes, France');
        cy.assertInputText('Description', 'Hello world!');
        cy.assertInputText('Website URL', 'https://website.com');
        cy.assertInputText('Contact email', 'contact@email.com');

        cy.reload();
        cy.assertInputText('Start date', '2022-12-12');
        cy.assertInputText('End date', '2022-12-13');
        cy.assertInputText('Venue address or city', 'Nantes, France');
        cy.assertInputText('Description', 'Hello world!');
        cy.assertInputText('Website URL', 'https://website.com');
        cy.assertInputText('Contact email', 'contact@email.com');
      });

      it('archive an event', () => {
        general.visit('team-1', 'conference-1');

        cy.findByRole('heading', { name: 'Archiving' }).should('exist');
        general.archive();
        cy.assertText('Event archived.');

        general.restore();
        cy.assertText('Event restored.');
      });
    });

    describe('customize settings', () => {
      it('can upload a new log', () => {
        customize.visit('team-1', 'conference-1');
        customize.changeLogo().selectFile('cypress/fixtures/devfest.png', { force: true });
        cy.assertText('Logo updated.');
        customize.getLogoSrc().should('include', '.png');
      });
    });

    describe('tracks settings', () => {
      it('add, edit and remove a format', () => {
        tracks.visit('team-1', 'conference-1');

        tracks.newFormat().click();
        tracks.newFormatModal().within(() => {
          cy.typeOn('Name', 'Quickie');
          cy.typeOn('Description', 'Small talk');
          cy.findByRole('button', { name: 'Save format' }).click();
        });

        cy.assertText('Quickie');
        cy.assertText('Small talk');

        cy.findByRole('button', { name: 'Edit Quickie' }).click();
        tracks.newFormatModal().within(() => {
          cy.assertInputText('Name', 'Quickie');
          cy.assertInputText('Description', 'Small talk');
          cy.typeOn('Name', 'Conf');
          cy.typeOn('Description', 'Long talk');
          cy.findByRole('button', { name: 'Save format' }).click();
        });

        cy.assertText('Conf');
        cy.assertText('Long talk');

        tracks.formatsRequired();
        cy.assertToast('Track setting updated.');

        cy.reload();
        cy.assertText('Conf');
        cy.assertText('Long talk');
        cy.findByRole('switch', { name: 'Format selection required', checked: true }).should('exist');

        cy.findByRole('button', { name: 'Remove Conf' }).click();
        cy.assertNoText('Conf');
        cy.assertNoText('Long talk');
      });

      it('add, edit and remove a category', () => {
        tracks.visit('team-1', 'conference-1');

        tracks.newCategory().click();

        tracks.newCategoryModal().within(() => {
          cy.typeOn('Name', 'Web');
          cy.typeOn('Description', 'This is the web');
          cy.findByRole('button', { name: 'Save category' }).click();
        });

        cy.assertText('Web');
        cy.assertText('This is the web');
        cy.findByRole('button', { name: 'Edit Web' }).click();

        tracks.newCategoryModal().within(() => {
          cy.assertInputText('Name', 'Web');
          cy.assertInputText('Description', 'This is the web');
          cy.typeOn('Name', 'Cloud');
          cy.typeOn('Description', 'This is the cloud');
          cy.findByRole('button', { name: 'Save category' }).click();
        });

        cy.assertText('Cloud');
        cy.assertText('This is the cloud');

        tracks.categoriesRequired();
        cy.assertToast('Track setting updated.');

        cy.reload();
        cy.assertText('Cloud');
        cy.assertText('This is the cloud');
        cy.findByRole('switch', { name: 'Category selection required', checked: true }).should('exist');

        cy.findByRole('button', { name: 'Remove Cloud' }).click();
        cy.assertNoText('Cloud');
        cy.assertNoText('This is the cloud');
      });
    });

    describe('cfp settings', () => {
      it('updates CFP settings', () => {
        cfp.visit('team-1', 'conference-1');
        cfp.saveForm({
          cfpStart: '2022-12-12',
          cfpEnd: '2022-12-13',
          maxProposals: '12',
          codeOfConductUrl: 'https://website.com',
        });
        cy.assertToast('Call for paper updated.');

        cy.reload();
        cy.assertInputText('Opening date', '2022-12-12');
        cy.assertInputText('Closing date', '2022-12-13');
        cy.assertInputText('Maximum of proposals per speaker', '12');
        cy.assertInputText('Code of conduct URL', 'https://website.com');
      });
    });

    describe('survey settings', () => {
      it('enables or disables survey', () => {
        survey.visit('team-1', 'conference-1');
        survey.saveQuestion().should('be.disabled');

        survey.toggleSurvey().click();
        survey.saveQuestion().should('not.be.disabled');
        cy.assertToast('Speaker survey enabled');

        cy.findByLabelText("What's your gender?").click();
        cy.findByLabelText("What's your Tshirt size?").click();
        cy.findByLabelText('Do you need accommodation funding? (Hotel, AirBnB...)').click();
        cy.findByLabelText('Do you need transports funding?').click();
        cy.findByLabelText('Do you have any special diet restrictions?').click();
        cy.findByLabelText('Do you have specific information to share?').click();
        survey.saveQuestion().click();
        cy.assertToast('Survey questions saved.');

        cy.reload();
        survey.saveQuestion().should('not.be.disabled');
        cy.findByLabelText("What's your gender?").should('be.checked');
        cy.findByLabelText("What's your Tshirt size?").should('be.checked');
        cy.findByLabelText('Do you need accommodation funding? (Hotel, AirBnB...)').should('be.checked');
        cy.findByLabelText('Do you need transports funding?').should('be.checked');
        cy.findByLabelText('Do you have any special diet restrictions?').should('be.checked');
        cy.findByLabelText('Do you have specific information to share?').should('be.checked');
      });
    });

    describe('proposal review settings', () => {
      it('toggles proposal reviews', () => {
        review.visit('team-1', 'conference-1');

        review.toggleReview(true).click();
        cy.assertToast('Review setting saved.');

        cy.reload();
        review.toggleReview(false).should('exist');
      });

      it('toggles reviews display', () => {
        review.visit('team-1', 'conference-1');

        review.toggleDisplayReviews(true).click();
        cy.assertToast('Review setting saved.');

        cy.reload();
        review.toggleDisplayReviews(false).should('exist');
      });

      it('toggles speakers display', () => {
        review.visit('team-1', 'conference-1');

        review.toggleDisplaySpeakers(true).click();
        cy.assertToast('Review setting saved.');

        cy.reload();
        review.toggleDisplaySpeakers(false).should('exist');
      });
    });

    describe('notifications settings', () => {
      it('fills notification settings', () => {
        notifications.visit('team-1', 'conference-1');
        notifications.saveForm('blablabla');
        cy.assertText('Invalid email');

        notifications.saveForm('test@example.com');
        cy.assertText('Notification email saved.');

        cy.reload();
        cy.assertInputText('Email receiving notifications', 'test@example.com');
      });

      it('save submitted notifications', () => {
        notifications.visit('team-1', 'conference-1');

        cy.findByRole('switch', { name: 'Submitted proposals', checked: false }).click();
        cy.assertText('Notification setting saved.');
        cy.findByRole('switch', { name: 'Submitted proposals', checked: true }).click();
      });

      it('save confirmed notifications', () => {
        notifications.visit('team-1', 'conference-1');

        cy.findByRole('switch', { name: 'Confirmed proposals', checked: false }).click();
        cy.assertText('Notification setting saved.');
        cy.findByRole('switch', { name: 'Confirmed proposals', checked: true }).click();
      });

      it('save declined notifications', () => {
        notifications.visit('team-1', 'conference-1');

        cy.findByRole('switch', { name: 'Declined proposals', checked: false }).click();
        cy.assertText('Notification setting saved.');
        cy.findByRole('switch', { name: 'Declined proposals', checked: true }).click();
      });
    });

    describe('slack integration settings', () => {
      it('fills slack web hook url', () => {
        slack.visit('team-1', 'conference-1');
        slack.saveSlackWebhook('foo');
        cy.assertText('Invalid url');

        slack.saveSlackWebhook('https://slack.com/webhook/test');

        cy.reload();
        cy.assertInputText('Slack web hook URL', 'https://slack.com/webhook/test');
      });
    });

    describe('API integration settings', () => {
      it('generate and revoke API key', () => {
        api.visit('team-1', 'conference-1');

        api.generateAPIKey().click();
        api.revokeAPIKey().should('exist');
        api.apiKey().should('not.have.value', '');

        cy.findByRole('heading', { name: 'Event proposals API' }).should('exist');

        api.revokeAPIKey().click();
        api.generateAPIKey().should('exist');
        api.apiKey().should('have.value', '');

        cy.findByRole('heading', { name: 'Event proposals API' }).should('not.exist');
      });
    });
  });

  describe('as a team member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('cannot create new event as a team member', () => {
      cy.visit(`/team/team-1/conference-1/settings`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });

  describe('as a team reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot create new event as a team reviewer', () => {
      cy.visit(`/team/team-1/conference-1/settings`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});