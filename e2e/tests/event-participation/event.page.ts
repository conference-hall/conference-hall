import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { SubmissionPage } from './submission.page.ts';

export class EventPage extends PageObject {
  readonly websiteLink: Locator;
  readonly contactsLink: Locator;
  readonly codeOfConductLink: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.websiteLink = this.page.getByRole('link', { name: 'Website' });
    this.contactsLink = this.page.getByRole('link', { name: 'Contacts' });
    this.codeOfConductLink = this.page.getByRole('link', { name: 'Code of conduct' });
    this.submitButton = this.page.getByRole('link', { name: 'Submit a proposal' });
  }

  async goto(slug: string, name: string) {
    await this.page.goto(`/${slug}/`);
    await this.waitFor(name);
  }

  async gotoLegacyUrl(legacyId: string | null, name: string) {
    await this.page.goto(`/public/event/${legacyId}`);
    await this.waitFor(name);
  }

  async waitFor(name: string) {
    await this.waitForHydration();
    await this.heading(name).waitFor();
  }

  heading(name: string) {
    return this.page.getByRole('heading', { name, level: 1 });
  }

  async clickOnSubmitButton() {
    await this.page.getByRole('link', { name: 'Submit a proposal' }).click();
    return new SubmissionPage(this.page);
  }
}
