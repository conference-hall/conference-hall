import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class TalkEditFormComponent extends PageObject {
  readonly heading: Locator;
  readonly titleInput: Locator;
  readonly abstractInput: Locator;
  readonly languageSelect: Locator;
  readonly referencesInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Edit talk' });
    this.titleInput = page.getByLabel('Title');
    this.abstractInput = page.getByLabel('Abstract');
    this.languageSelect = page.getByLabel('Languages');
    this.referencesInput = page.getByLabel('References');
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  levelRadio(level: string) {
    return this.page.getByRole('radio', { name: level });
  }

  async fillForm(title: string, abstract: string, level: string, language: string, references: string) {
    await this.titleInput.fill(title);
    await this.abstractInput.fill(abstract);
    await this.levelRadio(level).click();
    await this.selectOptions(this.languageSelect, [language]);
    await this.referencesInput.fill(references);
  }

  async selectFormatTrack(format: string) {
    await this.page.getByRole('checkbox', { name: format }).click();
  }

  async selectCategoryTrack(category: string) {
    await this.page.getByRole('checkbox', { name: category }).click();
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
