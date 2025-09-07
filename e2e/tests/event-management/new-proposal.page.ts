import { SpeakerPanelComponent } from 'e2e/common/speaker-panel.component.ts';
import { TalkFormComponent } from 'e2e/common/talk-form.component.ts';
import { PageObject } from 'e2e/page-object.ts';

export class NewProposalPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'New proposal' });
  readonly talkForm = new TalkFormComponent(this.page);
  readonly submitButton = this.page.getByRole('button', { name: 'Submit' });
  readonly cancelButton = this.page.getByRole('link', { name: 'Cancel' });
  readonly speakerPanel = new SpeakerPanelComponent(this.page);
  readonly formatsButton = this.page.getByRole('button', { name: 'Formats', exact: true });
  readonly categoriesButton = this.page.getByRole('button', { name: 'Categories', exact: true });
  readonly tagsButton = this.page.getByRole('button', { name: 'Tags', exact: true });

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

  // Format selection
  async selectFormat(formatName: string) {
    const formatCheckbox = this.page.getByRole('checkbox', { name: formatName });
    await formatCheckbox.click();
  }

  // Category selection
  async selectCategory(categoryName: string) {
    const categoryCheckbox = this.page.getByRole('checkbox', { name: categoryName });
    await categoryCheckbox.click();
  }

  // Tag selection
  async selectTag(tagName: string) {
    const tagsButton = this.page.getByRole('button').filter({ hasText: 'Tags' });
    await tagsButton.click();
    const tagOption = this.page.getByText(tagName);
    await tagOption.click();
    // Click outside to close the tags panel
    await this.page.click('body');
  }

  // Verification helpers
  async verifyFormatSelected(formatName: string) {
    const formatCheckbox = this.page.getByRole('checkbox', { name: formatName });
    return formatCheckbox.isChecked();
  }

  async verifyCategorySelected(categoryName: string) {
    const categoryCheckbox = this.page.getByRole('checkbox', { name: categoryName });
    return categoryCheckbox.isChecked();
  }
}
