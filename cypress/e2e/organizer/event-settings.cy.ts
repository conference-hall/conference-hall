import CfpSettings from 'page-objects/organizer/event-settings/cfp-settings.page';
import CustomizeSettings from 'page-objects/organizer/event-settings/customize-settings.page';
import GeneralSettings from 'page-objects/organizer/event-settings/general-settings.page';
import TracksSettings from 'page-objects/organizer/event-settings/tracks-settings.page';

describe('Event settings', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/event-settings');
  });

  afterEach(() => cy.task('disconnectDB'));

  const general = new GeneralSettings();
  const customize = new CustomizeSettings();
  const tracks = new TracksSettings();
  const cfp = new CfpSettings();

  describe('as a organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    describe('general settings', () => {
      it.skip('initial values');
      it.skip('check error fields');

      it('can update general event info', () => {
        general.visit('orga-1', 'conference-1');

        general.saveGeneralForm({ name: 'Conference 2', visibility: 'Private' });

        cy.assertUrl('/organizer/orga-1/conference-2/settings');
        cy.reload();

        general.generalBlock().within(() => {
          cy.assertInputText('Name', 'Conference 2');
          cy.assertInputText('Event URL', 'conference-2');
          cy.assertRadioChecked('Private');
        });
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

        general.detailsBlock().within(() => {
          cy.assertInputText('Start date', '2022-12-12');
          cy.assertInputText('End date', '2022-12-13');
          cy.assertInputText('Venue address or city', 'Nantes, France');
          cy.assertInputText('Description', 'Hello world!');
          cy.assertInputText('Website URL', 'https://website.com');
          cy.assertInputText('Contact email', 'contact@email.com');
        });
      });
    });

    describe('customize settings', () => {
      it('can upload a new banner', () => {
        customize.visit('orga-1', 'conference-1');
        customize.uploadBanner().selectFile('cypress/fixtures/banner.jpg', { force: true });
      });
    });

    describe('tracks settings', () => {
      it.skip('initial values');

      it('add, edit and remove a format', () => {
        tracks.visit('orga-1', 'conference-1');

        tracks.formatsRequired();
        tracks.newFormat().click();

        tracks.newFormatModal().within(() => {
          cy.typeOn('Name', 'Quickie');
          cy.typeOn('Description', 'Small talk');
          cy.clickOn('Save format');
        });

        tracks.formatsBlock().within(() => {
          cy.assertText('Quickie');
          cy.assertText('Small talk');
          cy.clickOn('Edit Quickie');
        });

        tracks.newFormatModal().within(() => {
          cy.assertInputText('Name', 'Quickie');
          cy.assertInputText('Description', 'Small talk');
          cy.typeOn('Name', 'Conf');
          cy.typeOn('Description', 'Long talk');
          cy.clickOn('Save format');
        });

        tracks.formatsBlock().within(() => {
          cy.assertText('Conf');
          cy.assertText('Long talk');
          cy.clickOn('Remove Conf');
          cy.assertNoText('Conf');
          cy.assertNoText('Long talk');
        });
      });

      it('add, edit and remove a category', () => {
        tracks.visit('orga-1', 'conference-1');

        tracks.categoriesRequired();
        tracks.newCategory().click();

        tracks.newCategoryModal().within(() => {
          cy.typeOn('Name', 'Web');
          cy.typeOn('Description', 'This is the web');
          cy.clickOn('Save category');
        });

        tracks.categoriesBlock().within(() => {
          cy.assertText('Web');
          cy.assertText('This is the web');
          cy.clickOn('Edit Web');
        });

        tracks.newCategoryModal().within(() => {
          cy.assertInputText('Name', 'Web');
          cy.assertInputText('Description', 'This is the web');
          cy.typeOn('Name', 'Cloud');
          cy.typeOn('Description', 'This is the cloud');
          cy.clickOn('Save category');
        });

        tracks.categoriesBlock().within(() => {
          cy.assertText('Cloud');
          cy.assertText('This is the cloud');
          cy.clickOn('Remove Cloud');
          cy.assertNoText('Cloud');
          cy.assertNoText('This is the cloud');
        });
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
