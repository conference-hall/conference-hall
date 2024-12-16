import type { Locator, Page } from '@playwright/test';
import { ProposalPage } from '../event-page/proposal.page.ts';
import { NewTalkPage } from './new-talk.page.ts';
import { ProfilePage } from './profile.page.ts';

export class ActivityPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly activities: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Your activity' });
    this.activities = this.page.getByRole('list', { name: 'Activities list' }).locator('>li');
  }

  async goto() {
    await this.page.goto('/speaker');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  eventActivity(eventName: string) {
    return this.page.getByRole('list', { name: `${eventName} activities` }).locator('>li');
  }

  eventLink(eventName: string) {
    return this.page.getByRole('link', { name: `Open ${eventName} page` });
  }

  async clickOnProposal(eventName: string, proposalTitle: string) {
    await this.eventActivity(eventName).getByRole('link', { name: proposalTitle }).click();
    return new ProposalPage(this.page);
  }

  async clickOnEditProfile() {
    await this.page.getByRole('link', { name: 'Edit your profile' }).click();
    return new ProfilePage(this.page);
  }

  async clickOnNewTalk() {
    await this.page.getByRole('link', { name: 'New talk' }).click();
    return new NewTalkPage(this.page);
  }
}
