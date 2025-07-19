import type { Locator, Page } from '@playwright/test';
import { TalkFormComponent } from 'e2e/common/talk-form.component.ts';
import { PageObject } from 'e2e/page-object.ts';

export class NewProposalPage extends PageObject {
  readonly heading: Locator;
  readonly talkForm: TalkFormComponent;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'New proposal' });
    this.talkForm = new TalkFormComponent(page);
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.cancelButton = page.getByRole('link', { name: 'Cancel' });
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/reviews/new`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async submitProposal() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
