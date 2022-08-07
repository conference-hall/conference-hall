describe('Submit a talk to event', () => {
  beforeEach(() => cy.task('seedDB', 'submit-talk'));
  afterEach(() => cy.task('resetDB'));

  it('submit a new talk for a conference (full wizard)', () => {
    cy.login();
    cy.visit('/devfest-nantes/submission');
    cy.assertUrl('/devfest-nantes/submission');
    cy.assertText('Proposal selection');
    cy.clickOn('Create a new proposal');

    // Step: talk creation
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)/);
    cy.typeOn('Title', 'The amazing talk');
    cy.typeOn('Abstract', 'An amazing abstract for an amazing talk.');
    cy.clickOn('Intermediate');
    cy.selectOn('Languages', 'English');
    cy.typeOn('References', 'Best talk ever!');
    cy.clickOn('Save as draft and continue');

    // Step: speaker
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)\/speakers/);
    cy.typeOn('Biography', 'I am the best!');
    cy.clickOn('Invite a co-speaker');
    cy.clickOn('Generate invitation link');
    cy.assertInputText('Copy co-speaker invitation link', 'http://localhost:3001/invitation');
    cy.clickOn('Revoke invitation link');
    cy.clickOn('Close');
    cy.clickOn('Next');

    // Step: tracks
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)\/tracks/);
    cy.assertText('Select one or severals formats proposed by the event organizers.');
    cy.clickOn('Quickie');
    cy.assertText('Select categories that are the best fit for your proposal.');
    cy.clickOn('Web');
    cy.clickOn('Next');

    // Step: survey
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)\/survey/);
    cy.assertText('We have some questions for you.');
    cy.clickOn('Male');
    cy.clickOn('XXXL');
    cy.clickOn('Yes');
    cy.clickOn('Taxi');
    cy.clickOn('Vegetarian');
    cy.typeOn('Do you have specific information to share?', 'Thanks!');
    cy.clickOn('Next');

    // Step: confirmation
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)\/submit/);
    cy.assertText('The amazing talk');
    cy.assertText('by Clark Kent');
    cy.typeOn('Message to organizers', 'You rock!');
    cy.clickOn('Please agree with the code of conduct of the event.');
    cy.clickOn('Submit proposal');

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
    cy.login();
    cy.visit('/devfest-nantes/submission');
    cy.assertUrl('/devfest-nantes/submission');
    cy.assertText('Proposal selection');

    cy.clickOn(/My existing talk/);
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)/);

    cy.assertInputText('Title', 'My existing talk');
    cy.assertInputText('Abstract', 'My existing abstract');
    cy.assertChecked('Advanced');
    cy.assertInputText('References', 'My existing references');

    cy.typeOn('Title', ' UPDATED');
    cy.typeOn('Abstract', ' UPDATED');
    cy.clickOn('Intermediate');
    cy.selectOn('Languages', 'English');
    cy.typeOn('References', ' UPDATED');
    cy.clickOn('Save as draft and continue');

    // Step: speaker
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)\/speakers/);
    cy.assertText('Speaker details');
    cy.clickOn('Next');

    // Step: tracks
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)\/tracks/);
    cy.assertText('Select one or severals formats proposed by the event organizers.');
    cy.clickOn('Next');

    // Step: survey
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)\/survey/);
    cy.assertText('We have some questions for you.');
    cy.clickOn('Next');

    // Step: confirmation
    cy.assertUrl(/\/devfest-nantes\/submission\/(.*)\/submit/);
    cy.clickOn('Please agree with the code of conduct of the event.');
    cy.clickOn('Submit proposal');

    // Check proposal list
    cy.assertUrl('/devfest-nantes/proposals');
    cy.assertText('Your proposals');
    cy.assertText('My existing talk UPDATED');

    // Check proposal info
    cy.clickOn(/My existing talk UPDATED/);
    cy.assertUrl(/\/devfest-nantes\/proposals\/(.*)/);
    cy.assertText('My existing talk UPDATED');
    cy.assertText('Intermediate');
    cy.assertText('English');
    cy.assertText('My existing abstract UPDATED');
    cy.assertText('My existing references UPDATED');
  });

  it('submit a new talk for a conference (w/o survey)', () => {
    cy.login();
    cy.visit('/without-survey/submission');
    cy.assertText('Proposal selection');
    cy.clickOn('Create a new proposal');

    // Step: talk creation
    cy.assertUrl(/\/without-survey\/submission\/(.*)/);
    cy.typeOn('Title', 'The amazing talk');
    cy.typeOn('Abstract', 'An amazing abstract for an amazing talk.');
    cy.clickOn('Save as draft and continue');

    // Step: speaker
    cy.assertUrl(/\/without-survey\/submission\/(.*)\/speakers/);
    cy.clickOn('Next');

    // Step: tracks
    cy.assertUrl(/\/without-survey\/submission\/(.*)\/tracks/);
    cy.assertText('Select one or severals formats proposed by the event organizers.');
    cy.clickOn('Quickie');
    cy.assertText('Select categories that are the best fit for your proposal.');
    cy.clickOn('Web');
    cy.clickOn('Next');

    // Step: confirmation
    cy.assertUrl(/\/without-survey\/submission\/(.*)\/submit/);
    cy.assertText('The amazing talk');
    cy.clickOn('Please agree with the code of conduct of the event.');
    cy.clickOn('Submit proposal');

    // Check proposal list
    cy.assertUrl('/without-survey/proposals');
    cy.assertText('Your proposals');
    cy.assertText('The amazing talk');
  });

  it('submit a new talk for a conference (w/o tracks)', () => {
    cy.login();
    cy.visit('/without-tracks/submission');
    cy.assertText('Proposal selection');
    cy.clickOn('Create a new proposal');

    // Step: talk creation
    cy.assertUrl(/\/without-tracks\/submission\/(.*)/);
    cy.typeOn('Title', 'The amazing talk');
    cy.typeOn('Abstract', 'An amazing abstract for an amazing talk.');
    cy.clickOn('Save as draft and continue');

    // Step: speaker
    cy.assertUrl(/\/without-tracks\/submission\/(.*)\/speakers/);
    cy.clickOn('Next');

    // Step: survey
    cy.assertUrl(/\/without-tracks\/submission\/(.*)\/survey/);
    cy.assertText('We have some questions for you.');
    cy.clickOn('Male');
    cy.clickOn('XXXL');
    cy.clickOn('Yes');
    cy.clickOn('Taxi');
    cy.clickOn('Vegetarian');
    cy.typeOn('Do you have specific information to share?', 'Thanks!');
    cy.clickOn('Next');

    // Step: confirmation
    cy.assertUrl(/\/without-tracks\/submission\/(.*)\/submit/);
    cy.assertText('The amazing talk');
    cy.clickOn('Please agree with the code of conduct of the event.');
    cy.clickOn('Submit proposal');

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
    cy.login();
    cy.visit('/without-survey-tracks/submission');
    cy.assertText('Proposal selection');
    cy.clickOn('Create a new proposal');

    // Step: talk creation
    cy.assertUrl(/\/without-survey-tracks\/submission\/(.*)/);
    cy.typeOn('Title', 'The amazing talk');
    cy.typeOn('Abstract', 'An amazing abstract for an amazing talk.');
    cy.clickOn('Save as draft and continue');

    // Step: speaker
    cy.assertUrl(/\/without-survey-tracks\/submission\/(.*)\/speakers/);
    cy.clickOn('Next');

    // Step: confirmation
    cy.assertUrl(/\/without-survey-tracks\/submission\/(.*)\/submit/);
    cy.assertText('The amazing talk');
    cy.clickOn('Submit proposal');

    // Check proposal list
    cy.assertUrl('/without-survey-tracks/proposals');
    cy.assertText('Your proposals');
    cy.assertText('The amazing talk');
  });
});
