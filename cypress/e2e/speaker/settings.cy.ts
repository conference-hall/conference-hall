import SpeakerSettingsPage from 'page-objects/speaker-settings.page';

describe('Speaker settings page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/settings');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const settings = new SpeakerSettingsPage();

  it('edit personal information', () => {
    settings.visit();
    settings.fillPersonalInfoForm({
      name: 'Superman',
      email: 'clark@example.com',
      avatarUrl: 'https://superman.com/photo.jpg',
    });
    settings.savePersonalInfo();
  });

  it('display errors on mandatory fields for personal information', () => {
    settings.visit();
    settings.fillPersonalInfoForm({
      name: ' ',
      email: ' ',
    });
    settings.savePersonalInfo();
    settings.error('Full name').should('contain.text', 'String must contain at least 1 character(s)');
    settings.error('Email address').should('contain.text', 'Invalid email');
  });

  it('edit speaker details', () => {
    settings.visit();
    settings.fillSpeakerDetails({
      bio: 'Speaker biography',
      references: 'Speaker references',
    });
    settings.saveSpeakerDetails();
  });

  it('edit additional information', () => {
    settings.visit();
    settings.fillAdditionalInfo({
      company: 'New company',
      location: 'New location',
      twitter: 'New twitter',
      github: 'New github',
    });
    settings.saveAdditionalInfo();
  });
});
