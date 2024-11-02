import SpeakerProfilePage from '../../page-objects/speaker/profile.page.ts';

describe('Speaker profile page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/profile');
    cy.login();
  });

  const profile = new SpeakerProfilePage();

  it('edit personal information', () => {
    profile.visit();
    profile.fillPersonalInfoForm({
      name: 'Superman',
      email: 'clark@example.com',
      avatarUrl: 'https://superman.com/photo.jpg',
    });
    profile.savePersonalInfo();
    profile.assertSaved();
  });

  it('display errors on mandatory fields for personal information', () => {
    profile.visit();
    profile.fillPersonalInfoForm({
      name: ' ',
      email: ' ',
    });
    profile.savePersonalInfo();
    profile.inputError('Full name').should('contain.text', 'String must contain at least 1 character(s)');
    profile.inputError('Email address').should('contain.text', 'Invalid email');
  });

  it('edit speaker details', () => {
    profile.visit();
    profile.fillSpeakerDetails({
      bio: 'Speaker biography',
      references: 'Speaker references',
    });
    profile.saveSpeakerDetails();
    profile.assertSaved();
  });

  it('edit additional information', () => {
    profile.visit();
    profile.fillAdditionalInfo({
      company: 'New company',
      location: 'New location',
      twitter: 'New twitter',
      github: 'New github',
    });
    profile.saveAdditionalInfo();
    profile.assertSaved();
  });
});
