import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class SubmissionPage extends PageObject {
  readonly proposalStep: Locator;
  readonly alreadySubmittedError: Locator;

  constructor(page: Page) {
    super(page);
    this.proposalStep = page.getByRole('heading', { name: 'Your proposal' });
    this.alreadySubmittedError = page.getByRole('heading', { name: 'Talk already submitted' });
  }

  async goto(slug: string, name: string) {
    await this.page.goto(`/${slug}/submission`);
    await this.waitFor(name);
  }

  async waitFor(name: string) {
    await this.heading(name).waitFor();
  }

  heading(name: string) {
    return this.page.getByRole('heading', { name });
  }
}
