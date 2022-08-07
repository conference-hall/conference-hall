describe('Submit a talk to event', () => {
  beforeEach(() => cy.task('seedDB', 'submit-talk'));
  afterEach(() => cy.task('resetDB'));

  it('submit a new talk for the event', () => {
    cy.login();
    cy.visit('/devfest-nantes');
    cy.clickOn('Submit a proposal');
    cy.assertUrl('/devfest-nantes/submission');
    cy.assertText('Proposal selection');
    cy.clickOn('Create a new proposal');

    // Step: talk creation
    cy.typeOn('Title', 'The amazing talk');
    cy.typeOn('Abstract', 'An amazing abstract for an amazing talk.');
    cy.clickOn('Intermediate');
    cy.selectOn('Languages', 'English');
    cy.typeOn('References', 'Best talk ever!');
    cy.clickOn('Save as draft and continue');

    // Step: speaker
    cy.typeOn('Biography', 'I am the best!');
    cy.clickOn('Invite a co-speaker');
    cy.clickOn('Generate invitation link');
    cy.findByLabelText('Copy co-speaker invitation link').should('contain.value', 'http://localhost:3001/invitation');
    cy.clickOn('Revoke invitation link');
    cy.clickOn('Close');
    cy.clickOn('Next');

    // Step: tracks
    cy.assertText('Select one or severals formats proposed by the event organizers.');
    cy.clickOn('Quickie');
    cy.assertText('Select categories that are the best fit for your proposal.');
    cy.clickOn('Web');
    cy.clickOn('Next');

    // Step: survey
    cy.assertText('We have some questions for you.');
    cy.clickOn('Male');
    cy.clickOn('XXXL');
    cy.clickOn('Yes');
    cy.clickOn('Taxi');
    cy.clickOn('Vegetarian');
    cy.typeOn('Do you have specific information to share?', 'Thanks!');
    cy.clickOn('Next');

    // Step: confirmation
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
    cy.findByLabelText('Do you have specific information to share?').should('contain.value', 'Thanks!');
  });
});
