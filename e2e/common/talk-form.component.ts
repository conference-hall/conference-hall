import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../page-object.ts';
import type { MultiSelectComponent } from './multi-select.component.ts';

export class TalkFormComponent extends PageObject {
  readonly titleInput: Locator;
  readonly abstractInput: Locator;
  readonly referencesInput: Locator;
  readonly languageSelect: MultiSelectComponent;
  readonly beginnerRadio: Locator;
  readonly intermediateRadio: Locator;
  readonly advancedRadio: Locator;

  constructor(page: Page, isEdit = false) {
    super(page);

    const parent = isEdit ? page.getByRole('dialog') : page;
    this.titleInput = parent.getByLabel('Title');
    this.abstractInput = parent.getByLabel('Abstract');
    this.referencesInput = parent.getByLabel('References');
    this.languageSelect = this.multiSelectInput('Languages');
    this.beginnerRadio = parent.getByRole('radio', { name: /beginner/i });
    this.intermediateRadio = parent.getByRole('radio', { name: /intermediate/i });
    this.advancedRadio = parent.getByRole('radio', { name: /advanced/i });
  }

  async waitFor() {
    await this.titleInput.waitFor();
  }

  async fillForm(title: string, abstract: string, level?: string, language?: string, references?: string) {
    await this.titleInput.fill(title);
    await this.abstractInput.fill(abstract);
    if (level) await this.radioInput(level).click();
    if (language) await this.languageSelect.select([language]);
    if (references) await this.referencesInput.fill(references);
  }

  formatCheckbox(name: string) {
    return this.page.getByRole('checkbox', { name });
  }

  categoryCheckbox(name: string) {
    return this.page.getByRole('checkbox', { name });
  }

  async selectFormat(name: string) {
    await this.formatCheckbox(name).click();
  }

  async selectCategory(name: string) {
    await this.categoryCheckbox(name).click();
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
