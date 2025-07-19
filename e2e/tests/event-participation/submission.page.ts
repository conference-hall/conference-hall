import type { Locator, Page } from '@playwright/test';
import { CoSpeakerComponent } from 'e2e/common/co-speaker.component.ts';
import { TalkFormComponent } from 'e2e/common/talk-form.component.ts';
import { PageObject } from 'e2e/page-object.ts';
import { ProposalListPage } from './proposal-list.page.ts';

export class SubmissionPage extends PageObject {
  readonly selectionStep: Locator;
  readonly proposalStep: Locator;
  readonly speakerStep: Locator;
  readonly tracksStep: Locator;
  readonly surveyStep: Locator;
  readonly talks: Locator;
  readonly drafts: Locator;
  readonly speakers: Locator;
  readonly alreadySubmittedError: Locator;
  readonly inviteCoSpeaker: Locator;

  constructor(page: Page) {
    super(page);
    this.selectionStep = page.getByRole('heading', { name: 'Submit a proposal' });
    this.proposalStep = page.getByRole('heading', { name: 'Your proposal' });
    this.speakerStep = page.getByRole('heading', { name: 'Speaker details' });
    this.tracksStep = page.getByRole('heading', { name: 'Proposal tracks' });
    this.surveyStep = page.getByRole('heading', { name: 'We have some questions for you' });
    this.talks = page.getByRole('list', { name: 'Your talks library' });
    this.drafts = page.getByRole('list', { name: 'Your draft proposals' });
    this.speakers = page.getByRole('list', { name: 'Speakers' }).locator('>li');
    this.alreadySubmittedError = page.getByRole('heading', { name: 'Talk already submitted' });
    this.inviteCoSpeaker = page.getByRole('heading', { name: 'Invite a co-speaker' });
  }

  async goto(slug: string) {
    await this.page.goto(`/${slug}/submission`);
    await this.selectionStep.waitFor();
  }

  async waitFor(name: string) {
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('heading', { name });
  }

  async clickOnNewProposal() {
    await this.page.getByRole('link', { name: 'New proposal' }).click();
  }

  async clickOnTalk(name: string) {
    await this.talks.getByRole('link', { name }).click();
  }

  async clickOnDraft(name: string) {
    await this.drafts.getByRole('link', { name }).click();
  }

  speaker(name: string) {
    return this.page.getByLabel(`View ${name} profile`);
  }

  async clickOnSpeaker(name: string) {
    await this.speaker(name).click();
    return new CoSpeakerComponent(this.page);
  }

  async clickOnAddSpeaker() {
    await this.page.getByRole('button', { name: 'Add a co-speaker' }).click();
  }

  async clickOnContinue() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async fillTalkForm(title: string, abstract: string, level: string, language: string, references: string) {
    const talkForm = new TalkFormComponent(this.page);
    return talkForm.fillForm(title, abstract, level, language, references);
  }

  async fillSpeakerForm(bio: string) {
    await this.page.getByLabel('Biography').fill(bio);
  }

  async clickOnSubmit() {
    await this.page.getByRole('button', { name: 'Submit proposal' }).click();
    return new ProposalListPage(this.page);
  }

  async clickOnCheckMyProposals() {
    await this.page.getByRole('link', { name: 'Check submitted proposals' }).click();
    return new ProposalListPage(this.page);
  }
}
