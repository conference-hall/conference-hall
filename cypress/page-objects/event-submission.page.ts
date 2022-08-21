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

class EventSubmissionPage {
  visit(slug: string) {
    cy.visit(`/${slug}/submission`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposal selection' }).should('exist');
  }

  /**
   * Talks list
   */

  createNewProposal() {
    return cy.clickOn('Create a new proposal');
  }

  talks() {
    return cy.findByRole('list', { name: 'Talks list' }).children();
  }

  talk(name: string) {
    return this.talks().contains(name);
  }

  /**
   * Talk step
   */

  isTalkStepVisible() {
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Proposal');
  }

  fillTalkForm(data: TalkFormType) {
    cy.typeOn('Title', data.title);
    cy.typeOn('Abstract', data.abstract);
    if (data.level) cy.clickOn(data.level);
    if (data.language) cy.selectOn('Languages', data.language);
    if (data.references) cy.typeOn('References', data.references);
  }

  submitTalkForm() {
    return cy.clickOn('Save as draft and continue');
  }

  /**
   * Speaker step
   */

  isSpeakerStepVisible() {
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Speaker');
  }

  fillSpeakerForm({ bio }: { bio: string }) {
    cy.typeOn('Biography', bio);
  }

  submitSpeakerForm() {
    return cy.clickOn('Next');
  }

  generateCoSpeakerInvite() {
    cy.clickOn('Invite a co-speaker');
    cy.clickOn('Generate invitation link');
    return cy.findByLabelText('Copy co-speaker invitation link');
  }

  closeCoSpeakerModal() {
    return cy.clickOn('Close');
  }

  /**
   * Tracks step
   */

  isTracksStepVisible() {
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Tracks');
  }

  selectFormatTrack(format: string) {
    cy.clickOn(format);
  }

  selectCategoryTrack(category: string) {
    cy.clickOn(category);
  }

  submitTracksForm() {
    return cy.clickOn('Next');
  }

  /**
   * Survey step
   */

  isSurveyStepVisible() {
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Survey');
  }

  fillSurveyForm(data: SurveyFormType) {
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

  /**
   * Confirmation step
   */
  isConfirmationStepVisible() {
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Submission');
  }

  fillConfirmationForm(data: ConfirmationFormType) {
    if (data.message) cy.typeOn('Message to organizers', data.message);
    if (data.cod) cy.clickOn('Please agree with the code of conduct of the event.');
  }

  submitConfirmation() {
    return cy.clickOn('Submit proposal');
  }

  /**
   * Max proposals
   */
  checkMyProposalsButton() {
    return cy.clickOn('Check my submitted proposals');
  }
}

export default EventSubmissionPage;
