type TalkFormType = {
  title: string;
  abstract: string;
  level?: string;
  language?: string;
  references?: string;
};

type SurveyFormType = {
  gender?: string;
  tshirt?: string;
  accomodation?: string;
  transport?: string;
  meal?: string;
  message?: string;
};

type ConfirmationFormType = {
  message?: string;
  cod?: boolean;
};

class SubmissionPage {
  visit(slug: string) {
    cy.visit(`/${slug}/submission`);
  }

  createNewProposal() {
    return cy.clickOn('Create a new proposal');
  }

  fillTalkForm(data: TalkFormType) {
    cy.assertUrl(/\/(.*)\/submission\/(.*)/);
    cy.typeOn('Title', data.title);
    cy.typeOn('Abstract', data.abstract);
    if (data.level) cy.clickOn(data.level);
    if (data.language) cy.selectOn('Languages', data.language);
    if (data.references) cy.typeOn('References', data.references);
  }

  submitTalkForm() {
    return cy.clickOn('Save as draft and continue');
  }

  fillSpeakerForm({ bio }: { bio: string }) {
    cy.assertUrl(/\/(.*)\/submission\/(.*)\/speakers/);
    cy.typeOn('Biography', bio);
  }

  submitSpeakerForm() {
    return cy.clickOn('Next');
  }

  generateCoSpeakerInvite() {
    cy.assertUrl(/\/(.*)\/submission\/(.*)\/speakers/);
    cy.clickOn('Invite a co-speaker');
    cy.clickOn('Generate invitation link');
    return cy.findByLabelText('Copy co-speaker invitation link');
  }

  closeCoSpeakerModal() {
    return cy.clickOn('Close');
  }

  selectFormatTrack(format: string) {
    cy.assertUrl(/\/(.*)\/submission\/(.*)\/tracks/);
    cy.assertText('Select one or severals formats proposed by the event organizers.');
    cy.clickOn(format);
  }

  selectCategoryTrack(category: string) {
    cy.assertUrl(/\/(.*)\/submission\/(.*)\/tracks/);
    cy.assertText('Select categories that are the best fit for your proposal.');
    cy.clickOn(category);
  }

  submitTracksForm() {
    return cy.clickOn('Next');
  }

  fillSurveyForm(data: SurveyFormType) {
    cy.assertUrl(/\/(.*)\/submission\/(.*)\/survey/);
    cy.assertText('We have some questions for you.');

    if (data.gender) cy.clickOn(data.gender);
    if (data.tshirt) cy.clickOn(data.tshirt);
    if (data.accomodation) cy.clickOn(data.accomodation);
    if (data.transport) cy.clickOn(data.transport);
    if (data.meal) cy.clickOn(data.meal);
    if (data.message) cy.typeOn('Do you have specific information to share?', data.message);
  }

  submitSurveyForm() {
    return cy.clickOn('Next');
  }

  fillConfirmationForm(data: ConfirmationFormType) {
    cy.assertUrl(/\/(.*)\/submission\/(.*)\/submit/);
    if (data.message) cy.typeOn('Message to organizers', data.message);
    if (data.cod) cy.clickOn('Please agree with the code of conduct of the event.');
  }

  submitProposal() {
    return cy.clickOn('Submit proposal');
  }
}

export default SubmissionPage;
