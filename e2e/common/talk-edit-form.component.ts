import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class TalkEditFormComponent extends PageObject {
  readonly titleInput: Locator;
  readonly abstractInput: Locator;
  readonly languageSelect: Locator;
  readonly referencesInput: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByLabel('Title');
    this.abstractInput = page.getByLabel('Abstract');
    this.languageSelect = page.getByLabel('Languages');
    this.referencesInput = page.getByLabel('References');
  }

  async waitFor() {
    await this.titleInput.waitFor();
  }

  async fillForm(title: string, abstract: string, level: string, language: string, references: string) {
    await this.titleInput.fill(title);
    await this.abstractInput.fill(abstract);
    await this.radioInput(level).click();
    await this.selectOptions(this.languageSelect, [language]);
    await this.referencesInput.fill(references);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
