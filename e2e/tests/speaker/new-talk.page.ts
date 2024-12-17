import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { TalkPage } from './talk.page.ts';

export class NewTalkPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create a new talk' });
  }

  async goto() {
    await this.page.goto('/speaker/talks/new');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async fillForm(title: string, abstract: string, level: string, language: string, references: string) {
    await this.page.getByLabel('Title').fill(title);
    await this.page.getByLabel('Abstract').fill(abstract);
    await this.page.getByRole('radio', { name: level }).click();
    await this.selectOptions(this.page.getByLabel('Languages'), [language]);
    await this.page.getByLabel('References').fill(references);
    await this.page.getByRole('button', { name: 'Create new talk' }).click();
    return new TalkPage(this.page);
  }
}
