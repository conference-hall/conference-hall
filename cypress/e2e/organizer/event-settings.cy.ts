import CustomizeSettings from 'page-objects/organizer/event-settings/customize-settings.page';
import GeneralSettings from 'page-objects/organizer/event-settings/general-settings.page';
import TracksSettings from 'page-objects/organizer/event-settings/tracks-settings.page';

describe('Event settings', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/event-settings');
  });

  afterEach(() => cy.task('disconnectDB'));

  const generalSettings = new GeneralSettings();
  const customizeSettings = new CustomizeSettings();
  const tracksSettings = new TracksSettings();

  describe('as a organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    describe('general settings', () => {
      it('can update general event info', () => {
        generalSettings.visit('orga-1', 'conference-1');

        generalSettings.saveGeneralForm({ name: 'Conference 2', visibility: 'Private' });

        cy.assertUrl('/organizer/orga-1/conference-2/settings');
        cy.reload();

        generalSettings.generalBlock().within(() => {
          cy.assertInputText('Name', 'Conference 2');
          cy.assertInputText('Event URL', 'conference-2');
          cy.assertRadioChecked('Private');
        });
      });

      it('can update event details', () => {
        generalSettings.visit('orga-1', 'conference-1');

        generalSettings.saveDetailsForm({
          startDate: '2022-12-12',
          endDate: '2022-12-13',
          address: 'Nantes, France',
          description: 'Hello world!',
          websiteUrl: 'https://website.com',
          contactEmail: 'contact@email.com',
        });

        generalSettings.detailsBlock().within(() => {
          cy.assertInputText('Start date', '2022-12-12');
          cy.assertInputText('End date', '2022-12-13');
          cy.assertInputText('Venue address or city', 'Nantes, France');
          cy.assertInputText('Description', 'Hello world!');
          cy.assertInputText('Website URL', 'https://website.com');
          cy.assertInputText('Contact email', 'contact@email.com');
        });
      });

      it('todo should check error fields');
    });

    describe('customize settings', () => {
      it('can upload a new banner', () => {
        customizeSettings.visit('orga-1', 'conference-1');
        customizeSettings.uploadBanner().selectFile('cypress/fixtures/banner.jpg', { force: true });
      });
    });

    describe('tracks settings', () => {
      it('create a format', () => {
        tracksSettings.visit('orga-1', 'conference-1');
      });
    });
  });

  describe('as a organization member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('cannot create new event as a organization member', () => {
      cy.visit(`/organizer/orga-1/conference-1/settings`);
    });
  });

  describe('as a organization reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot create new event as a organization reviewer', () => {
      cy.visit(`/organizer/orga-1/conference-1/settings`);
    });
  });
});
