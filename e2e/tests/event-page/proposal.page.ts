import type { Locator, Page } from '@playwright/test';
import { CoSpeakerComponent } from 'e2e/common/co-speaker.component.ts';
import { TalkEditFormComponent } from 'e2e/common/talk-edit-form.component.ts';
import { PageObject } from 'e2e/page-object.ts';
import { ProposalListPage } from './proposal-list.page.ts';
import { SubmissionPage } from './submission.page.ts';

export class ProposalPage extends PageObject {
  readonly heading: Locator;
  readonly speakers: Locator;
  readonly removeConfirmationDialog: Locator;
  readonly inviteCoSpeaker: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Proposal page' });
    this.speakers = page.getByRole('list', { name: 'Speakers' }).locator('>li');
    this.removeConfirmationDialog = page.getByRole('heading', {
      name: 'Are you sure you want to remove your submission?',
    });
    this.inviteCoSpeaker = page.getByRole('heading', { name: 'Invite a co-speaker' });
  }

  async goto(slug: string, proposalId: string) {
    await this.page.goto(`/${slug}/proposals/${proposalId}`);
    await this.waitFor();
  }

  async waitFor() {
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
    return new TalkEditFormComponent(this.page);
  }

  async clickOnContinueSubmission() {
    await this.page.getByRole('link', { name: 'Continue submission' }).click();
    return new SubmissionPage(this.page);
  }

  async clickOnConfirmation() {
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async clickOnDecline() {
    await this.page.getByRole('button', { name: 'Decline' }).click();
  }

  async clickOnRemoveProposal() {
    await this.page.getByRole('button', { name: 'Remove proposal' }).click();
    await this.removeConfirmationDialog.waitFor();
  }

  async clickOnConfirmRemoveProposal() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Remove proposal' }).click();
    return new ProposalListPage(this.page);
  }

  async clickOnReferences() {
    await this.page.getByRole('button', { name: 'References' }).click();
  }
}
