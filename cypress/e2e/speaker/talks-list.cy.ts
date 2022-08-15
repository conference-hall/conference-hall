import SpeakerTalksPage from '../../page-objects/speaker-talks.page';

describe('Speaker talks page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/talks-list');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const page = new SpeakerTalksPage();

  it('displays the speaker talks', () => {
    page.visit();
  });
});
