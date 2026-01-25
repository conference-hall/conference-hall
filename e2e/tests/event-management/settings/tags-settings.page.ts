import { PageObject } from '../../../page-object.ts';

export class TagsSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Proposal tags' });
  readonly noTagsMessage = this.page.getByText('No tags to display');
  readonly tagsList = this.page.getByRole('list', { name: 'Tags list' }).locator('>li');
  readonly newTagButton = this.page.getByRole('button', { name: 'New tag' });
  readonly createTagButton = this.page.getByRole('button', { name: 'Create tag' });
  readonly saveTagButton = this.page.getByRole('button', { name: 'Save tag' });
  readonly nameInput = this.page.getByLabel('Tag name');
  readonly searchTagsInput = this.page.getByLabel('Search tags');

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/tags`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }
}
