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

  // Expose form inputs for backward compatibility with existing tests
  get titleInput() {
    return this.talkForm.titleInput;
  }
  get abstractTextarea() {
    return this.talkForm.abstractInput;
  }
  get referencesTextarea() {
    return this.talkForm.referencesInput;
  }
  get beginnerRadio() {
    return this.talkForm.beginnerRadio;
  }
  get intermediateRadio() {
    return this.talkForm.intermediateRadio;
  }
  get advancedRadio() {
    return this.talkForm.advancedRadio;
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/reviews/new`);
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
  }

  async fillProposalForm(data: {
    title: string;
    abstract: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    references?: string;
  }) {
    await this.talkForm.fillForm(data.title, data.abstract, data.level, data.references);
  }

  async submitProposal() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  formatCheckbox(name: string) {
    return this.talkForm.formatCheckbox(name);
  }

  categoryCheckbox(name: string) {
    return this.talkForm.categoryCheckbox(name);
  }

  async selectFormat(name: string) {
    await this.talkForm.selectFormat(name);
  }

  async selectCategory(name: string) {
    await this.talkForm.selectCategory(name);
  }
}
