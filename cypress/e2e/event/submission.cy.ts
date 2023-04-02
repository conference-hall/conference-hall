import EventProposalPage from 'page-objects/event/proposal.page';
import EventProposalsPage from 'page-objects/event/proposals.page';
import EventSubmissionPage from 'page-objects/event/submission.page';
import EventSurveyPage from 'page-objects/event/survey.page';

describe('Submit a talk to event', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/submission');
  });

  afterEach(() => cy.task('disconnectDB'));

  const submission = new EventSubmissionPage();
  const proposals = new EventProposalsPage();
  const proposal = new EventProposalPage();
  const survey = new EventSurveyPage();

  it('redirects to signin, when user is not connected', () => {
    cy.visit('devfest-nantes/submission');
    cy.assertText('Log in to Conference Hall');
  });

  describe('When user is connected', () => {
    beforeEach(() => {
      cy.login();
    });

    it('submit a new talk for a conference (full wizard)', () => {
      submission.visit('devfest-nantes');
      submission.createNewProposal();

      // Step: talk creation
      submission.isTalkStepVisible();
      submission.fillTalkForm({
        title: 'The amazing talk',
        abstract: 'An amazing abstract for an amazing talk.',
        level: 'Intermediate',
        language: 'English',
        references: 'Best talk ever!',
      });
      submission.submitTalkForm();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.fillSpeakerForm({ bio: 'I am the best!' });
      submission.submitSpeakerForm();

      // Step: tracks
      submission.isTracksStepVisible();
      submission.selectFormatTrack('Quickie');
      submission.selectCategoryTrack('Web');
      submission.submitTracksForm();

      // Step: survey
      submission.isSurveyStepVisible();
      submission.fillSurveyForm({
        gender: 'Male',
        tshirt: 'XXXL',
        accomodation: 'Yes',
        transport: 'Taxi',
        meal: 'Vegetarian',
        message: 'Thanks!',
      });
      submission.submitSurveyForm();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      cy.assertText('The amazing talk');
      cy.assertText('by Clark Kent');
      submission.fillConfirmationForm({ message: 'You rock!', cod: true });
      submission.submitConfirmation();

      // Check proposal list
      proposals.isPageVisible();
      proposals.list().should('have.length', 1);
      proposals.proposal('The amazing talk').should('contain', 'by Clark Kent').click();

      // Check proposal info
      proposal.isPageVisible();
      cy.assertText('Proposal "The amazing talk"');
      cy.assertText('Intermediate');
      cy.assertText('English');
      cy.assertText('An amazing abstract for an amazing talk.');
      cy.assertText('Best talk ever!');
      cy.assertText('Clark Kent');
      cy.assertText('Quickie');
      cy.assertText('Web');

      // Check survey info
      survey.visit('devfest-nantes');
      survey.gender('Male').should('be.checked');
      survey.tshirt('XXXL').should('be.checked');
      survey.accommodation('Yes').should('be.checked');
      survey.transport('Taxi').should('be.checked');
      survey.meal('Vegetarian').should('be.checked');
      survey.message().should('contain.value', 'Thanks!');
    });

    it('submit an existing talk', () => {
      submission.visit('devfest-nantes');

      submission.talks().should('have.length', 1);
      submission.talk('My existing talk').click();

      submission.isTalkStepVisible();
      cy.assertInputText('Title', 'My existing talk');
      cy.assertInputText('Abstract', 'My existing abstract');
      cy.assertRadioChecked('Advanced');
      cy.assertInputText('References', 'My existing references');

      submission.fillTalkForm({
        title: 'Title UPDATED',
        abstract: 'Abstract UPDATED',
        level: 'Intermediate',
        language: 'English',
        references: 'References UPDATED',
      });
      submission.submitTalkForm();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.submitSpeakerForm();

      // Step: tracks
      submission.isTracksStepVisible();
      submission.submitTracksForm();

      // Step: survey
      submission.isSurveyStepVisible();
      submission.submitSurveyForm();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.fillConfirmationForm({ cod: true });
      submission.submitConfirmation();

      // Check proposal list
      proposals.isPageVisible();
      proposals.list().should('have.length', 1);
      proposals.proposal('Title UPDATED').should('exist').click();

      // Check proposal info
      proposal.isPageVisible();
      cy.assertText('Proposal "Title UPDATED"');
      cy.assertText('Intermediate');
      cy.assertText('English');
      cy.assertText('Abstract UPDATED');
      cy.assertText('References UPDATED');
    });

    it('submit a new talk for a conference (w/o survey)', () => {
      submission.visit('without-survey');
      submission.createNewProposal();

      // Step: talk creation
      submission.isTalkStepVisible();
      submission.fillTalkForm({
        title: 'The amazing talk',
        abstract: 'An amazing abstract for an amazing talk.',
      });
      submission.submitTalkForm();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.submitSpeakerForm();

      // Step: tracks
      submission.isTracksStepVisible();
      submission.selectFormatTrack('Quickie');
      submission.selectCategoryTrack('Web');
      submission.submitTracksForm();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.fillConfirmationForm({ message: 'You rock!', cod: true });
      submission.submitConfirmation();

      // Check proposal list
      proposals.isPageVisible();
      proposals.list().should('have.length', 1);
    });

    it('submit a new talk for a conference (w/o tracks)', () => {
      submission.visit('without-tracks');
      submission.createNewProposal();

      // Step: talk creation
      submission.isTalkStepVisible();
      submission.fillTalkForm({
        title: 'The amazing talk',
        abstract: 'An amazing abstract for an amazing talk.',
      });
      submission.submitTalkForm();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.submitSpeakerForm();

      // Step: survey
      submission.isSurveyStepVisible();
      submission.fillSurveyForm({ gender: 'Male' });
      submission.submitSurveyForm();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.fillConfirmationForm({ message: 'You rock!', cod: true });
      submission.submitConfirmation();

      // Check proposal list
      proposals.isPageVisible();
      proposals.list().should('have.length', 1);
    });

    it('submit a new talk for a conference (w/o survey, tracks and code of conduct)', () => {
      submission.visit('without-survey-tracks');
      submission.createNewProposal();

      // Step: talk creation
      submission.isTalkStepVisible();
      submission.fillTalkForm({
        title: 'The amazing talk',
        abstract: 'An amazing abstract for an amazing talk.',
      });
      submission.submitTalkForm();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.submitSpeakerForm();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.submitConfirmation();

      // Check proposal list
      proposals.isPageVisible();
      proposals.list().should('have.length', 1);
    });

    it('cannot submit a talk when max proposal reached', () => {
      submission.visit('with-max-proposals');
      cy.assertText('You can submit a maximum of 1 proposals. (0 out of 1)');

      submission.talk('My existing talk').click();
      submission.isTalkStepVisible();
      submission.submitTalkForm();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.submitSpeakerForm();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.fillConfirmationForm({ cod: true });
      submission.submitConfirmation();
      proposals.isPageVisible();
      proposals.submitProposal();

      cy.assertText('You have submitted the maximum of proposals for the event. Thanks!');
      submission.checkMyProposalsButton();
      proposals.isPageVisible();
    });

    it('cannot submit a talk to an event with a cfp not open yet', () => {
      cy.visit('/conference-cfp-future/submission', { failOnStatusCode: false });
      cy.assertText('CFP not open');
    });

    it('cannot submit a talk to an event with a cfp already closed', () => {
      cy.visit('/conference-cfp-past/submission', { failOnStatusCode: false });
      cy.assertText('CFP not open');
    });
  });
});
