import BasePage from 'page-objects/base.page.ts';

type PersonalInfoType = {
  name?: string;
  email?: string;
  avatarUrl?: string;
};

type SpeakerDetailsType = {
  bio?: string;
  references?: string;
};

type AdditionalInfoType = {
  company?: string;
  location?: string;
  twitter?: string;
  github?: string;
};

class SpeakerProfilePage extends BasePage {
  visit() {
    cy.visitAndCheck('/speaker/profile');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'My profile' }).should('exist');
  }

  fillPersonalInfoForm(data: PersonalInfoType) {
    if (data.name) cy.typeOn('Full name', data.name);
    if (data.email) cy.typeOn('Email address', data.email);
    if (data.avatarUrl) cy.typeOn('Avatar picture URL', data.avatarUrl);
  }

  savePersonalInfo() {
    cy.findByLabelText('Personal information').within(() => {
      cy.findByRole('button', { name: 'Save' }).click();
    });
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-describe`);
      });
  }

  fillSpeakerDetails(data: SpeakerDetailsType) {
    if (data.bio) cy.typeOn('Biography', data.bio);
    if (data.references) cy.typeOn('Speaker references', data.references);
  }

  saveSpeakerDetails() {
    cy.findByLabelText('Speaker details').within(() => {
      cy.findByRole('button', { name: 'Save' }).click();
    });
  }

  fillAdditionalInfo(data: AdditionalInfoType) {
    if (data.company) cy.typeOn('Company', data.company);
    if (data.location) cy.typeOn('Location (city, country)', data.location);
    if (data.twitter) cy.typeOn('Twitter', data.twitter);
    if (data.github) cy.typeOn('GitHub', data.github);
  }

  saveAdditionalInfo() {
    cy.findByLabelText('Additional information').within(() => {
      cy.findByRole('button', { name: 'Save' }).click();
    });
  }

  assertSaved() {
    cy.assertToast('Profile updated.');
  }
}

export default SpeakerProfilePage;
