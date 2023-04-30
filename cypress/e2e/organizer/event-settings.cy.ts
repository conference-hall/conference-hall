import ApiSettings from 'page-objects/organizer/event-settings/api-settings.page';
import CfpSettings from 'page-objects/organizer/event-settings/cfp-settings.page';
import CustomizeSettings from 'page-objects/organizer/event-settings/customize-settings.page';
import OrganizerEventSettingsPage from 'page-objects/organizer/event-settings/event-settings.page';
import GeneralSettings from 'page-objects/organizer/event-settings/general-settings.page';
import NotificationsSettings from 'page-objects/organizer/event-settings/notifications-settings.page';
import ProposalReviewSettings from 'page-objects/organizer/event-settings/proposal-review-settings.page';
import SlackSettings from 'page-objects/organizer/event-settings/slack-settings.page';
import SurveySettings from 'page-objects/organizer/event-settings/survey-settings.page';
import TracksSettings from 'page-objects/organizer/event-settings/tracks-settings.page';

describe('Event settings', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/event-settings');
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

  describe('as a organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('navigates through settings nav bar', () => {
      settings.visit('orga-1', 'conference-1');
      settings.openSetting('General');
      general.isPageVisible();

      settings.openSetting('Customize');
      customize.isPageVisible();

      settings.openSetting('Tracks');
      tracks.isPageVisible();

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
      it.skip('initial values');
      it.skip('check error fields');

      it('can update general event info', () => {
        general.visit('orga-1', 'conference-1');

        general.saveGeneralForm({ name: 'Conference 2', visibility: 'Private' });

        cy.assertUrl('/organizer/orga-1/conference-2/settings');
        cy.reload();

        cy.assertInputText('Name', 'Conference 2');
        cy.assertInputText('Event URL', 'conference-2');
        cy.assertRadioChecked('Private');
      });

      it('can update event details', () => {
        general.visit('orga-1', 'conference-1');

        general.saveDetailsForm({
          startDate: '2022-12-12',
          endDate: '2022-12-13',
          address: 'Nantes, France',
          description: 'Hello world!',
          websiteUrl: 'https://website.com',
          contactEmail: 'contact@email.com',
        });

        cy.assertInputText('Start date', '2022-12-12');
        cy.assertInputText('End date', '2022-12-13');
        cy.assertInputText('Venue address or city', 'Nantes, France');
        cy.assertInputText('Description', 'Hello world!');
        cy.assertInputText('Website URL', 'https://website.com');
        cy.assertInputText('Contact email', 'contact@email.com');
      });

      it('archive an event', () => {
        general.visit('orga-1', 'conference-1');

        cy.findByRole('heading', { name: 'Archive event' }).should('exist');
        general.archive();

        cy.findByRole('heading', { name: 'Restore event' }).should('exist');
        general.restore();

        cy.findByRole('heading', { name: 'Archive event' }).should('exist');
      });
    });

    describe('customize settings', () => {
      it('can upload a new log', () => {
        customize.visit('orga-1', 'conference-1');
        customize.changeLogo().selectFile('cypress/fixtures/devfest.png', { force: true });
        customize.getLogoSrc().should('include', '.png');
      });
    });

    describe('tracks settings', () => {
      it.skip('initial values');

      it('add, edit and remove a format', () => {
        tracks.visit('orga-1', 'conference-1');

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

        cy.findByRole('button', { name: 'Remove Conf' }).click();
        cy.assertNoText('Conf');
        cy.assertNoText('Long talk');
      });

      it('add, edit and remove a category', () => {
        tracks.visit('orga-1', 'conference-1');

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

        cy.findByRole('button', { name: 'Remove Cloud' }).click();
        cy.assertNoText('Cloud');
        cy.assertNoText('This is the cloud');
      });
    });

    describe('cfp settings', () => {
      it.skip('initial values');

      it('updates CFP settings', () => {
        cfp.visit('orga-1', 'conference-1');
        cfp.saveForm({
          cfpStart: '2022-12-12',
          cfpEnd: '2022-12-13',
          maxProposals: '12',
          codeOfConductUrl: 'https://website.com',
        });
      });
    });

    describe('survey settings', () => {
      it.skip('initial values');

      it('enables or disables survey', () => {
        survey.visit('orga-1', 'conference-1');
        survey.enableSurvey().click();
        survey.disableSurvey().should('exist');
        survey.saveQuestion().should('not.be.disabled');
        survey.disableSurvey().click();
        survey.enableSurvey().should('exist');
        survey.saveQuestion().should('be.disabled');
      });

      it('save survey questions', () => {
        survey.visit('orga-1', 'conference-1');
        survey.enableSurvey().click();
        survey.disableSurvey().should('exist');
        survey.saveQuestion().should('not.be.disabled');

        cy.findByLabelText("What's your gender?").click();
        cy.findByLabelText("What's your Tshirt size?").click();
        cy.findByLabelText('Do you need accommodation funding? (Hotel, AirBnB...)').click();
        cy.findByLabelText('Do you need transports funding?').click();
        cy.findByLabelText('Do you have any special diet restrictions?').click();
        cy.findByLabelText('Do you have specific information to share?').click();
        survey.saveQuestion().click();
        // TODO: check it has been saved
      });
    });

    describe('proposal review settings', () => {
      it.skip('initial values');

      it('enables or disables proposal reviews', () => {
        review.visit('orga-1', 'conference-1');
        review.enableProposalReview().click();
        review.disableProposalReview().should('exist');
        review.disableProposalReview().click();
        review.enableProposalReview().should('exist');
      });

      it('save proposal review settings', () => {
        review.visit('orga-1', 'conference-1');

        cy.findByLabelText('Display organizers ratings').click();
        cy.findByLabelText('Display ratings in proposal list').click();
        cy.findByLabelText('Display speakers in proposal page').click();
      });
    });

    describe('notifications settings', () => {
      it.skip('initial values');
      it.skip('display form errors');

      it('fills notification settings', () => {
        notifications.visit('orga-1', 'conference-1');
        notifications.saveForm('test@example.com');
      });

      it('save notifications', () => {
        notifications.visit('orga-1', 'conference-1');

        cy.findByLabelText('Submitted proposals').click();
        cy.findByLabelText('Confirmed proposals').click();
        cy.findByLabelText('Declined proposals').click();
      });
    });

    describe('slack integration settings', () => {
      it.skip('initial values');
      it.skip('display form errors');

      it('fills slack web hook url', () => {
        slack.visit('orga-1', 'conference-1');
        slack.saveSlackWebhook('https://slack.com/webhook/test');
      });
    });

    describe('API integration settings', () => {
      it.skip('initial values');

      it('generate and revoke API key', () => {
        api.visit('orga-1', 'conference-1');

        api.generateAPIKey().click();
        api.revokeAPIKey().should('exist');
        api.apiKey().should('not.have.value', '');

        api.revokeAPIKey().click();
        api.generateAPIKey().should('exist');
        api.apiKey().should('have.value', '');
      });
    });
  });

  describe('as a organization member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('cannot create new event as a organization member', () => {
      cy.visit(`/organizer/orga-1/conference-1/settings`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });

  describe('as a organization reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot create new event as a organization reviewer', () => {
      cy.visit(`/organizer/orga-1/conference-1/settings`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
