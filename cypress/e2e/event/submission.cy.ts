import EventProposalPage from '../../page-objects/event/proposal.page.ts';
import EventProposalsPage from '../../page-objects/event/proposals.page.ts';
import EventSubmissionPage from '../../page-objects/event/submission.page.ts';
import EventSurveyPage from '../../page-objects/event/survey.page.ts';
import LoginPage from '../../page-objects/login.page.ts';

describe('Submit a talk to event', () => {
  beforeEach(() => {
    cy.task('seedDB', 'event/submission');
  });

  afterEach(() => cy.task('disconnectDB'));

  const submission = new EventSubmissionPage();
  const proposals = new EventProposalsPage();
  const proposal = new EventProposalPage();
  const survey = new EventSurveyPage();
  const login = new LoginPage();

  it('redirects to signin, when user is not connected', () => {
    cy.visit('devfest-nantes/submission');
    login.isPageVisible();
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
      submission.continue();

      // Step: speaker
      // TODO: Test remove co-speaker
      submission.isSpeakerStepVisible();
      submission.fillSpeakerForm({ bio: 'I am the best!' });
      submission.continue();

      // Step: tracks
      submission.isTracksStepVisible();
      submission.selectFormatTrack('Quickie');
      submission.selectCategoryTrack('Web');
      submission.continue();

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
      submission.continue();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      cy.assertText('The amazing talk');
      submission.fillConfirmationForm({ cod: true });
      submission.submit();
      cy.assertToast('Congratulation! Proposal submitted!');

      // Check proposal list
      proposals.isPageVisible();
      proposals.list().should('have.length', 1);
      proposals.proposal('The amazing talk').should('contain', 'by Clark Kent').click();

      // Check proposal info
      proposal.isPageVisible();
      proposal.cospeakers().speaker('Clark Kent').should('exist');
      cy.assertText('The amazing talk');
      cy.assertText('Intermediate');
      cy.assertText('English');
      cy.assertText('An amazing abstract for an amazing talk.');
      cy.assertText('Quickie');
      cy.assertText('Web');
      proposal.openReferences();
      cy.assertText('Best talk ever!');

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
      submission.continue();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.continue();

      // Step: tracks
      submission.isTracksStepVisible();
      submission.continue();

      // Step: survey
      submission.isSurveyStepVisible();
      submission.continue();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.fillConfirmationForm({ cod: true });
      submission.submit();

      // Check proposal list
      proposals.isPageVisible();
      proposals.list().should('have.length', 1);
      proposals.proposal('Title UPDATED').should('exist').click();

      // Check proposal info
      proposal.isPageVisible();
      cy.assertText('Title UPDATED');
      cy.assertText('Intermediate');
      cy.assertText('English');
      cy.assertText('Abstract UPDATED');

      proposal.openReferences();
      cy.assertText('References UPDATED');
    });

    it('save a proposal as draft', () => {
      submission.visit('devfest-nantes');

      submission.talks().should('have.length', 1);
      submission.talk('My existing talk').click();

      submission.isTalkStepVisible();
      cy.assertInputText('Title', 'My existing talk');
      cy.assertInputText('Abstract', 'My existing abstract');
      cy.assertRadioChecked('Advanced');
      cy.assertInputText('References', 'My existing references');

      submission.fillTalkForm({
        title: 'My draft proposal',
        abstract: 'Abstract draft',
        level: 'Intermediate',
        language: 'English',
        references: 'References draft',
      });

      submission.continue();
      submission.isSpeakerStepVisible();

      // Check proposal list
      submission.visit('devfest-nantes');
      submission.drafts().should('have.length', 1);
      submission.draft('My draft proposal').should('exist').click();

      submission.isTalkStepVisible();
      cy.assertInputText('Title', 'My draft proposal');
    });

    it('submit a new talk for a conference (w/o survey and mandatory tracks)', () => {
      submission.visit('without-survey');
      submission.createNewProposal();

      // Step: talk creation
      submission.isTalkStepVisible();
      submission.fillTalkForm({
        title: 'The amazing talk',
        abstract: 'An amazing abstract for an amazing talk.',
      });
      submission.continue();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.continue();

      // Step: tracks
      submission.isTracksStepVisible();
      submission.continue();
      cy.assertText('You must select at least one proposal format.');
      cy.assertText('You must select at least one proposal category.');
      submission.selectFormatTrack('Quickie');
      submission.selectCategoryTrack('Web');
      submission.continue();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.fillConfirmationForm({ cod: true });
      submission.submit();

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
      submission.continue();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.continue();

      // Step: survey
      submission.isSurveyStepVisible();
      submission.fillSurveyForm({ gender: 'Male' });
      submission.continue();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.fillConfirmationForm({ cod: true });
      submission.submit();

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
      submission.continue();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.continue();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.submit();

      // Check proposal list
      proposals.isPageVisible();
      proposals.list().should('have.length', 1);
    });

    it('cannot submit a talk when max proposal reached', () => {
      submission.visit('with-max-proposals');
      cy.assertText('0 / 1 proposals submitted.');

      submission.talk('My existing talk').click();
      submission.isTalkStepVisible();
      submission.continue();

      // Step: speaker
      submission.isSpeakerStepVisible();
      submission.continue();

      // Step: confirmation
      submission.isConfirmationStepVisible();
      submission.fillConfirmationForm({ cod: true });
      submission.submit();

      proposals.isPageVisible();
      proposals.submitProposal();

      cy.assertText('You have reached the maximum of submitted proposals for the event (1 max)');
      submission.checkMyProposalsButton();
      proposals.isPageVisible();
    });

    it('cannot submit a talk to an event with a cfp not open yet', () => {
      cy.visitAndCheck('/conference-cfp-future/submission', { failOnStatusCode: false });
      cy.assertText('CFP not open');
    });

    it('cannot submit a talk to an event with a cfp already closed', () => {
      cy.visitAndCheck('/conference-cfp-past/submission', { failOnStatusCode: false });
      cy.assertText('CFP not open');
    });
  });
});
