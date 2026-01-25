import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../../page-object.ts';
import { NewTalkPage } from './new-talk.page.ts';
import { TalkPage } from './talk.page.ts';

export class TalkLibraryPage extends PageObject {
  readonly heading: Locator;
  readonly talks: Locator;
  readonly noTalks: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Talks library' });
    this.talks = this.page.getByRole('list', { name: 'Talks list' }).locator('>li');
    this.noTalks = this.page.getByText('No talks found.');
  }

  async goto() {
    await this.page.goto('/speaker/talks');
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  async clickOnNewTalk() {
    await this.page.getByRole('link', { name: 'New talk' }).click();
    return new NewTalkPage(this.page);
  }

  talkLink(talkName: string) {
    return this.talks.getByRole('link', { name: talkName });
  }

  async clickOnTalk(talkName: string) {
    await this.talkLink(talkName).click();
    return new TalkPage(this.page);
  }

  async clickOnArchivedTalks() {
    return this.page.getByRole('link', { name: 'Archived', exact: true }).click();
  }

  async clickOnAllTalks() {
    return this.page.getByRole('link', { name: 'All', exact: true }).click();
  }
}
