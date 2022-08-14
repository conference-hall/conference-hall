import SubmissionPage from '../page-objects/submission.page';

describe('Submit a talk to event', () => {
  beforeEach(() => {
    cy.task('seedDB', 'submit-talk');
    cy.login();
  });

  afterEach(() => cy.task('resetDB'));

  const submission = new SubmissionPage();

  it('submit a new talk for a conference (full wizard)', () => {
    submission.visit('devfest-nantes');
    submission.createNewProposal();

    // Step: talk creation
    submission.fillTalkForm({
      title: 'The amazing talk',
      abstract: 'An amazing abstract for an amazing talk.',
      level: 'Intermediate',
      language: 'English',
      references: 'Best talk ever!',
    });
    submission.submitTalkForm();

    // Step: speaker
    submission.fillSpeakerForm({ bio: 'I am the best!' });
    submission.submitSpeakerForm();

    // Step: tracks
    submission.selectFormatTrack('Quickie');
    submission.selectCategoryTrack('Web');
    submission.submitTracksForm();

    // Step: survey
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
    cy.assertText('The amazing talk');
    cy.assertText('by Clark Kent');
    submission.fillConfirmationForm({ message: 'You rock!', cod: true });
    submission.submitProposal();

    // Check proposal list
    cy.assertUrl('/devfest-nantes/proposals');
    cy.assertText('Your proposals');
    cy.assertText('The amazing talk');
    cy.assertText('by Clark Kent');

    // Check proposal info
    cy.clickOn(/The amazing talk/);
    cy.assertUrl(/\/devfest-nantes\/proposals\/(.*)/);
    cy.assertText('The amazing talk');
    cy.assertText('Intermediate');
    cy.assertText('English');
    cy.assertText('An amazing abstract for an amazing talk.');
    cy.assertText('Best talk ever!');
    cy.assertText('Clark Kent');
    cy.assertText('Quickie');
    cy.assertText('Web');

    // Check survey info
    cy.clickOn('Survey');
    cy.assertChecked('Male');
    cy.assertChecked('XXXL');
    cy.assertChecked('Yes');
    cy.assertChecked('Taxi');
    cy.assertChecked('Vegetarian');
    cy.assertInputText('Do you have specific information to share?', 'Thanks!');
  });

  it('submit an existing talk', () => {
    submission.visit('devfest-nantes');

    cy.clickOn(/My existing talk/);
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)/);

    cy.assertInputText('Title', 'My existing talk');
    cy.assertInputText('Abstract', 'My existing abstract');
    cy.assertChecked('Advanced');
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
    cy.assertText('Speaker details');
    submission.submitSpeakerForm();

    // Step: tracks
    cy.assertText('Select one or severals formats proposed by the event organizers.');
    submission.submitTracksForm();

    // Step: survey
    cy.assertText('We have some questions for you.');
    submission.submitSurveyForm();

    // Step: confirmation
    submission.fillConfirmationForm({ cod: true });
    submission.submitProposal();

    // Check proposal list
    cy.assertUrl('/devfest-nantes/proposals');
    cy.assertText('Your proposals');
    cy.assertText('Title UPDATED');

    // Check proposal info
    cy.clickOn(/UPDATED/);
    cy.assertUrl(/\/devfest-nantes\/proposals\/(.*)/);
    cy.assertText('Title UPDATED');
    cy.assertText('Intermediate');
    cy.assertText('English');
    cy.assertText('Abstract UPDATED');
    cy.assertText('References UPDATED');
  });

  it('submit a new talk for a conference (w/o survey)', () => {
    submission.visit('without-survey');
    submission.createNewProposal();

    // Step: talk creation
    submission.fillTalkForm({
      title: 'The amazing talk',
      abstract: 'An amazing abstract for an amazing talk.',
    });
    submission.submitTalkForm();

    // Step: speaker
    cy.assertText('Speaker details');
    submission.submitSpeakerForm();

    // Step: tracks
    submission.selectFormatTrack('Quickie');
    submission.selectCategoryTrack('Web');
    submission.submitTracksForm();

    // Step: confirmation
    submission.fillConfirmationForm({ message: 'You rock!', cod: true });
    submission.submitProposal();

    // Check proposal list
    cy.assertUrl('/without-survey/proposals');
    cy.assertText('Your proposals');
    cy.assertText('The amazing talk');
  });

  it('submit a new talk for a conference (w/o tracks)', () => {
    submission.visit('without-tracks');
    submission.createNewProposal();

    // Step: talk creation
    submission.fillTalkForm({
      title: 'The amazing talk',
      abstract: 'An amazing abstract for an amazing talk.',
    });
    submission.submitTalkForm();

    // Step: speaker
    cy.assertText('Speaker details');
    submission.submitSpeakerForm();

    // Step: survey
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
    submission.fillConfirmationForm({ message: 'You rock!', cod: true });
    submission.submitProposal();

    // Check proposal list
    cy.assertUrl('/without-tracks/proposals');
    cy.assertText('Your proposals');
    cy.assertText('The amazing talk');

    // Check survey info
    cy.clickOn('Survey');
    cy.assertChecked('Male');
    cy.assertChecked('XXXL');
    cy.assertChecked('Yes');
    cy.assertChecked('Taxi');
    cy.assertChecked('Vegetarian');
    cy.assertInputText('Do you have specific information to share?', 'Thanks!');
  });

  it('submit a new talk for a conference (w/o survey, tracks and code of conduct)', () => {
    submission.visit('without-survey-tracks');
    submission.createNewProposal();

    // Step: talk creation
    submission.fillTalkForm({
      title: 'The amazing talk',
      abstract: 'An amazing abstract for an amazing talk.',
    });
    submission.submitTalkForm();

    // Step: speaker
    cy.assertText('Speaker details');
    submission.submitSpeakerForm();

    // Step: confirmation
    submission.submitProposal();

    // Check proposal list
    cy.assertUrl('/without-survey-tracks/proposals');
    cy.assertText('Your proposals');
    cy.assertText('The amazing talk');
  });
});
