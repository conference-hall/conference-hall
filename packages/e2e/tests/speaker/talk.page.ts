import type { Locator, Page } from '@playwright/test';
import { CoSpeakerComponent } from '../../common/co-speaker.component.ts';
import { TalkFormComponent } from '../../common/talk-form.component.ts';
import { PageObject } from '../../helpers/page-object.ts';
import { ProposalPage } from '../event-participation/proposal.page.ts';
import { HomePage } from '../event-search/home.page.ts';

export class TalkPage extends PageObject {
  readonly heading: Locator;
  readonly speakers: Locator;
  readonly submissions: Locator;
  readonly inviteCoSpeaker: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Talk page' });
    this.speakers = page.getByRole('list', { name: 'Speakers' }).locator('>li');
    this.submissions = page.getByRole('list', { name: 'Talk submission list' }).locator('>li');
    this.inviteCoSpeaker = page.getByRole('heading', { name: 'Invite a co-speaker' });
  }

  async goto(talkId: string) {
    await this.page.goto(`/speaker/talks/${talkId}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
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

  async clickOnEditTalk() {
    await this.page.getByRole('button', { name: 'Edit' }).click();
    return new TalkFormComponent(this.page, true);
  }

  async clickOnArchiveTalk() {
    await this.page.getByRole('button', { name: 'Archive' }).click();
  }

  async clickOnRestoreTalk() {
    await this.page.getByRole('button', { name: 'Restore' }).click();
  }

  async clickOnReferences() {
    await this.page.getByRole('button', { name: 'References' }).click();
  }

  async clickOnSubmission(eventName: string) {
    await this.page.getByRole('link', { name: `Go to ${eventName}` }).click();
    return new ProposalPage(this.page);
  }

  async clickOnSubmitTalk() {
    await this.page.getByRole('link', { name: 'Submit' }).click();
    return new HomePage(this.page);
  }
}
