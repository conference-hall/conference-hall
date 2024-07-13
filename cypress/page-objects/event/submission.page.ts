import BasePage from 'page-objects/base.page.ts';
import TalkCoSpeakersActions from 'page-objects/common/talk-co-speakers.actions.ts';

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
  cod?: boolean;
};

class EventSubmissionPage extends BasePage {
  visit(slug: string) {
    cy.visitAndCheck(`/${slug}/submission`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Submit a proposal' }).should('exist');
  }

  /**
   * Talks list
   */

  createNewProposal() {
    return cy.findByRole('link', { name: 'New proposal' }).click();
  }

  drafts() {
    return cy.findByRole('list', { name: 'Draft proposals list' }).children();
  }

  draft(name: string) {
    return this.drafts().contains(name);
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
    cy.findByRole('heading', { name: 'Your proposal' }).should('exist');
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Proposal');
  }

  fillTalkForm(data: TalkFormType) {
    cy.typeOn('Title', data.title);
    cy.typeOn('Abstract', data.abstract);
    if (data.level) cy.findByRole('radio', { name: data.level }).click();
    if (data.language) cy.selectOn('Languages', data.language);
    if (data.references) cy.typeOn('References', data.references);
  }

  continue() {
    return cy.findByRole('button', { name: 'Continue' }).click();
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

  cospeakers() {
    return new TalkCoSpeakersActions();
  }

  /**
   * Tracks step
   */

  isTracksStepVisible() {
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Tracks');
  }

  selectFormatTrack(format: string) {
    cy.findByRole('checkbox', { name: format }).click();
  }

  selectCategoryTrack(category: string) {
    cy.findByRole('checkbox', { name: category }).click();
  }

  /**
   * Survey step
   */

  isSurveyStepVisible() {
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Survey');
  }

  fillSurveyForm(data: SurveyFormType) {
    if (data.gender) cy.findByRole('radio', { name: data.gender }).click();
    if (data.tshirt) cy.findByRole('radio', { name: data.tshirt }).click();
    if (data.accomodation) cy.findByRole('radio', { name: data.accomodation }).click();
    if (data.transport) cy.findByRole('checkbox', { name: data.transport }).click();
    if (data.meal) cy.findByRole('checkbox', { name: data.meal }).click();
    if (data.message) cy.typeOn('Do you have specific information to share?', data.message);
  }

  /**
   * Confirmation step
   */
  isConfirmationStepVisible() {
    cy.findByRole('listitem', { current: 'step' }).should('contain', 'Submission');
  }

  fillConfirmationForm(data: ConfirmationFormType) {
    if (data.cod) cy.findByRole('checkbox', { name: 'Please agree with the code of conduct of the event.' }).click();
  }

  submit() {
    return cy.findByRole('button', { name: 'Submit proposal' }).click();
  }

  /**
   * Max proposals
   */
  checkMyProposalsButton() {
    return cy.findByRole('link', { name: 'Check submitted proposals' }).click();
  }
}

export default EventSubmissionPage;
