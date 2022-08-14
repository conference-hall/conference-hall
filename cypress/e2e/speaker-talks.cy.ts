import SpeakerTalksPage from '../page-objects/speaker-talks.page';

describe('Speaker talks page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker-talks');
    cy.login();
  });

  afterEach(() => cy.task('resetDB'));

  const page = new SpeakerTalksPage();

  it('displays the speaker talks', () => {
    page.visit();
    page.title().should('exist');
  });
});
