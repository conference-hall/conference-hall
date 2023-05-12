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

class SpeakerProfilePage {
  visit() {
    cy.visit('/speaker/profile');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Your profile' }).should('exist');
  }

  fillPersonalInfoForm(data: PersonalInfoType) {
    if (data.name) cy.typeOn('Full name', data.name);
    if (data.email) cy.typeOn('Email address', data.email);
    if (data.avatarUrl) cy.typeOn('Avatar picture URL', data.avatarUrl);
  }

  savePersonalInfo() {
    return cy.findByLabelText('Personal information').submit();
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-description`);
      });
  }

  fillSpeakerDetails(data: SpeakerDetailsType) {
    if (data.bio) cy.typeOn('Biography', data.bio);
    if (data.references) cy.typeOn('Speaker references', data.references);
  }

  saveSpeakerDetails() {
    return cy.findByLabelText('Speaker details').submit();
  }

  fillAdditionalInfo(data: AdditionalInfoType) {
    if (data.company) cy.typeOn('Company', data.company);
    if (data.location) cy.typeOn('Location (city, country)', data.location);
    if (data.twitter) cy.typeOn('Twitter', data.twitter);
    if (data.github) cy.typeOn('GitHub', data.github);
  }

  saveAdditionalInfo() {
    return cy.findByLabelText('Additional information').submit();
  }
}

export default SpeakerProfilePage;
