import SpeakerNewTalkPage from 'page-objects/speaker/talk-new.page';
import SpeakerTalkPage from 'page-objects/speaker/talk.page';

describe('Speaker talk creation page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'speaker/talk-create');
    cy.login();
  });

  afterEach(() => cy.task('disconnectDB'));

  const newTalk = new SpeakerNewTalkPage();
  const talk = new SpeakerTalkPage();

  it('can create a new talk', () => {
    newTalk.visit();
    newTalk.fillTalkForm({
      title: 'Awesome title',
      abstract: 'Awesome abstract',
      level: 'Intermediate',
      language: 'English',
      references: 'Best talk ever!',
    });
    newTalk.createAbstract().click();
    cy.assertToast('New talk created.');

    talk.isPageVisible();
    cy.assertText('Awesome title');
    cy.assertText('Awesome abstract');
    cy.assertText('Intermediate');
    cy.assertText('English');
    cy.assertText('Best talk ever!');
    cy.assertText('by Clark Kent');
  });

  it('display errors on mandatory fields', () => {
    newTalk.visit();
    newTalk.fillTalkForm({});
    newTalk.createAbstract().click();
    newTalk.titleInput().then(($el: any) => expect($el[0].checkValidity()).to.be.false);
    newTalk.abstractInput().then(($el: any) => expect($el[0].checkValidity()).to.be.false);
  });
});
